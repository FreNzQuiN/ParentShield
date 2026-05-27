# ParentShield

Aplikasi monitoring orang tua untuk aktivitas internet anak, menggunakan API AdGuard DNS.

## Stack

| Layer | Teknologi |
|-------|-----------|
| Backend | Laravel 12, PHP 8.2+ |
| Frontend | React 19, TypeScript, Tailwind CSS v4 |
| Auth | Laravel Sanctum (token) |
| CI/CD | Vite, PHPUnit, Vitest |

## Arsitektur

```
Browser → React SPA → Laravel API → AdGuard DNS API
```

Frontend **tidak** pernah direct call ke AdGuard. Semua komunikasi melalui Laravel backend yang bertanggung jawab atas autentikasi, validasi, normalisasi response/error, dan enkripsi API key.

## Direktori Kunci

```
app/
├── Exceptions/
│   └── AdGuardApiException.php    # Domain exception AdGuard
├── Http/
│   ├── Controllers/Api/           # AuthController, DashboardController,
│   │                              # SetupApiKeyController, DeviceController,
│   │                              # LogController
│   ├── Middleware/
│   │   ├── AddCorrelationId.php   # X-Correlation-Id header
│   │   └── CheckApiKey.php        # Middleware verifikasi API key
│   └── Requests/
│       ├── Api/                   # SetupApiKey, UpdateSafebrowsing,
│       │                         # UpdateParentalControl, StoreDevice, UpdateDevice
│       └── Auth/                  # Register, Login, ForgotPassword,
│       │                         # UpdateProfile, ChangePassword requests
├── Models/User.php                # + adguard_api_key_encrypted, verified_at
└── Services/
    └── AdGuardService.php         # HTTP client AdGuard API

resources/js/
├── app/
│   ├── components/
│   │   ├── features/              # SideNavBar, AppLayout, Dashboard/*, devices/*,
│   │   │                          # activity/*, parentalControl/*
│   │   └── shared/                # AuthLayout, FormInput, Loading, LoadingOverlay,
│   │                              # InlineError, Toast, EmptyState, Modal, StepList,
│   │                              # ConfirmDialog, SettingsCard, RefreshBar,
│   │                              # ToggleSwitch, icons
│   ├── constants/                 # serviceGroups (JSON + TS defs), time.ts, urls.ts
│   ├── contexts/                  # AuthContext, ToastContext
│   ├── hooks/                     # useDashboard, useActivityLog, useParentalControlPage,
│   │                              # useIsMobile, useDialog
│   ├── routes/guards/             # ProtectedRoute, RequireApiKey
│   ├── services/api/              # client (axios), auth, dashboard, devices,
│   │                              # setupApiKey, activity
│   ├── types/                     # api, auth, dashboard, device, activity
│   └── utils/                     # error, storage, parentalControl
└── pages/                         # Login, Register, ForgotPassword, SetupApiKey,
                                   # Dashboard, Activity, Devices, Settings,
                                   # ParentalControl
```

## Flow Aplikasi

```
Login/Register
  ↓ (berhasil)
Setup API Key AdGuard
  ↓ (key valid)
Dashboard (statistik, proteksi global)
  ↓
Monitoring (ParentalControl, device/activity/settings bertahap)
```

### Auth Guard (urutan)

1. Belum login → `/login`
2. Login, API key kosong/revoked → `/setup-api-key`
3. Login + API key valid → halaman tujuan (dashboard/protected route)

## Endpoint API

| Method | Path | Auth | Fungsi |
|--------|------|------|--------|
| GET | `/api/v1/health` | - | Health check |
| POST | `/api/v1/auth/register` | - | Register |
| POST | `/api/v1/auth/login` | - | Login (return token) |
| POST | `/api/v1/auth/logout` | sanctum | Logout |
| POST | `/api/v1/auth/forgot-password` | - | Kirim link reset |
| GET | `/api/v1/auth/me` | sanctum | User + has_api_key |
| POST | `/api/v1/auth/refresh` | sanctum | Perbarui token |
| PUT | `/api/v1/auth/profile` | sanctum | Ubah nama profil |
| PUT | `/api/v1/auth/password` | sanctum | Ubah kata sandi |
| POST | `/api/v1/setup-api-key` | sanctum | Verifikasi & simpan API key |
| GET | `/api/v1/setup-api-key/status` | sanctum | Cek status API key |
| GET | `/api/v1/dashboard` | sanctum+key | Data aggregated dashboard |
| GET | `/api/v1/dashboard/services` | sanctum+key | Daftar layanan web AdGuard |
| PUT | `/api/v1/dashboard/safebrowsing` | sanctum+key | Toggle proteksi |
| PUT | `/api/v1/dashboard/parental-control` | sanctum+key | Update kontrol parental |
| GET | `/api/v1/devices` | sanctum+key | Daftar perangkat |
| POST | `/api/v1/devices` | sanctum+key | Tambah perangkat |
| GET | `/api/v1/devices/{device}` | sanctum+key | Detail perangkat |
| PUT | `/api/v1/devices/{device}` | sanctum+key | Ubah nama perangkat |
| DELETE | `/api/v1/devices/{device}` | sanctum+key | Hapus perangkat |
| GET | `/api/v1/devices/{device}/doh.mobileconfig` | sanctum+key | Unduh mobileconfig |
| GET | `/api/v1/logs/query` | sanctum+key | Query log aktivitas DNS (filter: time range, devices, statuses, search, limit, cursor) |

### Response Format

```json
{
  "success": true,
  "data": { ... },
  "message": "..."
}
```

```json
{
  "success": false,
  "code": "ERROR_CODE",
  "message": "Pesan error Indonesia",
  "errors": { "field": ["..."] }
}
```

Semua pesan error user-facing dalam **Bahasa Indonesia**.

## Error Handling

### Backend (`bootstrap/app.php`)

| Exception | Status | Pesan |
|-----------|--------|-------|
| QueryException (constraint 23*) | 409 | Operasi tidak dapat diproses... |
| QueryException (syntax 42*) | 500 | Kesalahan sistem... |
| QueryException (lain) | 503 | Layanan sedang sibuk, silakan coba lagi. |
| ConnectionException | 502 | Layanan eksternal tidak dapat dijangkau... |
| TooManyRequestsHttpException | 429 | Terlalu banyak permintaan... |
| ValidationException | 422 | (pesan validasi per field) |
| AuthenticationException | 401 | Sesi Anda telah berakhir... |
| HttpException (403) | 403 | Anda tidak memiliki izin... |
| Throwable lain | 500 | Terjadi kesalahan... |

### Frontend (Axios Interceptor)

| Status | Kode | Aksi |
|--------|------|------|
| 401 | ADGUARD_UNAUTHORIZED | Redirect `/setup-api-key?reason=revoked` |
| 401 | (lain) | Redirect `/login` |
| 403 | API_KEY_REQUIRED | Redirect `/setup-api-key` |
| 422 | - | Tampilkan inline error |
| 5xx | - | Tampilkan toast error |

### AdGuardService Error Mapping

| Status AdGuard | Kode Error | Status HTTP | Pesan User |
|---------------|------------|-------------|------------|
| 401 | ADGUARD_UNAUTHORIZED | 401 | Kunci API tidak valid... |
| 405 | ADGUARD_METHOD_NOT_ALLOWED | 502 | Layanan AdGuard sedang sibuk. |
| 429 | ADGUARD_RATE_LIMITED | 429 | Terlalu banyak permintaan... |
| timeout | ADGUARD_CONNECTION_ERROR | 503 | Layanan sedang sibuk, silakan coba beberapa saat lagi. |

## Design Tokens

Defined in `resources/css/app.css` via Tailwind v4 `@theme`, available as utility classes (e.g. `bg-primary`, `text-text-secondary`, `border-border/20`).

### Warna

| Token | Value | Penggunaan |
|-------|-------|-----------|
| `primary` | `#005bbf` | Tombol, link, active state |
| `primary-hover` | `#004d9e` | Hover state tombol primary |
| `primary-light` | `rgba(26, 115, 232, 0.1)` | Background active nav item |
| `bg-page` | `#f7f9ff` | Background halaman utama |
| `bg-sidebar` | `#f1f4fa` | Background sidebar |
| `bg-card` | `#ffffff` | Background kartu |
| `bg-card-inner` | `#f7f9ff` | Background toggle row dalam card |
| `bg-tag` | `#ebeef4` | Background pill/badge netral |
| `text-primary` | `#181c20` | Judul, angka |
| `text-secondary` | `#414754` | Subtitle, label, body |
| `text-muted` | `#727785` | Placeholder, icon |
| `success` | `#1b6d24` | Online, toggle ON |
| `success-badge` | `#a0f399` | Background badge success |
| `danger` | `#ba1a1a` | Diblokir, angka merah |
| `danger-hover` | `#a01515` | Hover state tombol danger |
| `danger-bar` | `#dd3635` | Progress bar danger |
| `danger-light` | `#ffb3ac` | Background danger ringan |
| `error` | `#ef4444` | Form validation error |
| `inactive` | `#dfe3e8` | Toggle OFF, dot offline |
| `border` | `#c1c6d6` | Border input, separator |
| `chart-blue` | `#adc7ff` | Bar chart secondary |
| `warning-bg` | `#ffedd5` | Background warning card |
| `warning-text` | `#c2410c` | Text warning card |

### Tipografi

| Level | Ukuran | Tailwind | Elemen |
|-------|--------|----------|--------|
| Hero / page title | 24px | `text-2xl` | Welcome heading, judul halaman auth |
| Section title | 20px | `text-xl` | Card section headers |
| Body / label | 14px | `text-sm` | Input, placeholder, subtitle, button |
| Caption | 12px | `text-xs` | Helper text, footer |

Font: **Roboto** (UI via `font-sans`), **Liberation Serif** (brand name via `font-serif` token).

Font body **wajib 14px** — jangan gunakan `text-base` (16px) untuk body.

### Layout

| Token | Value |
|-------|-------|
| Sidebar | 256px |
| Card radius | 12px |
| Card padding | 13px (default), 24px (large) |
| Card shadow | `0px 4px 20px -2px rgba(0,91,192,0.15)` (`shadow-card`) |

## Routing

```
PUBLIC:       /login, /register, /forgot-password
SEMI-PUBLIC:  /setup-api-key (auth required, no API key needed)
PROTECTED:    /dashboard, /parental-control, /activity, /devices, /settings
```

## Halaman Log Aktivitas

Halaman `/activity` menampilkan riwayat permintaan DNS dengan fitur:

| Fitur | Detail |
|-------|--------|
| **Filter Periode** | Quick select: 1 Jam, 12 Jam, 24 Jam, 7 Hari; atau Kustom (DateRangePicker dengan kalender, hingga 90 hari ke belakang) |
| **Filter Status** | Semua, Diizinkan, Diblokir, Dimodifikasi, Tidak Diketahui — dikirim sebagai `statuses[]` ke API |
| **Filter Perangkat** | Dropdown multi-select perangkat — dikirim sebagai `devices[]` ke API |
| **Filter Domain** | Input search (debounce 300ms) — dikirim sebagai `search` ke API |
| **Tabel** | Desktop (table) + Mobile (card). Expandable detail per entri (domain, filtering source, DNS type, category) |
| **Paginasi** | Client-side slicing dari buffer. Page size: 15/25/50/100 |
| **Refresh** | RefreshBar dengan last-refresh timestamp |
| **Truncation Banner** | Muncul jika data melebihi 3 halaman × 1000 item — menampilkan coverage tertua |
| **Loading Bar** | Inline animated bar di atas tabel saat background refresh |

Server memproses filter (`devices`, `statuses`, `search`) di setiap page request — buffer hanya menyimpan data yang sudah difilter.

## Halaman Kontrol Orang Tua

Halaman `/parental-control` terdiri dari 2 section:

| Section | Posisi | Konten |
|---------|--------|--------|
| **Sidebar** | Kiri (sticky) | 4 toggle utama: Kontrol Orang Tua (master), Blokir Konten Dewasa, Pencarian Aman, YouTube Mode Terbatas |
| **Pembatasan per Kategori** | Kanan (scrollable) | 9 kategori layanan (Konten Dewasa, Anonymizers, Game, Media Berita, Media Sosial, Keuangan, Mesin Pencari, Toko Online, Video) |
| **Semua Layanan** | Kanan (scrollable) | Daftar semua layanan web AdGuard dengan pencarian dan toggle individual |

- Master toggle OFF → semua sub-toggle dan layanan disabled (opacity-50, pointer-events-none)
- Category toggle ON → seluruh layanan di kategori diblokir
- Category partial → toggle OFF, label "(Sebagian)", tampil "X Layanan diblokir, Y Layanan diizinkan"
- Dashboard card menampilkan 4 kategori: Anonymizers, Game, Media Sosial, Belanja Online & E-Wallet
- Service IDs hanya yang valid di registry AdGuard DNS (gunakan `GET /dashboard/services` untuk daftar lengkap)

## Halaman Perangkat Dilindungi

Halaman `/devices` menampilkan daftar perangkat dengan kartu. Setiap kartu menampilkan:
- Nama, tipe perangkat, status online/Luring, dan waktu terakhir aktif
- **Warning "Bahaya"** (dengan tooltip hover) muncul di samping status "Luring" jika perangkat offline ≥6 jam (threshold: `LONG_OFFLINE_THRESHOLD_MS`)
- Tombol: Petunjuk Konfigurasi / Selesaikan Setup, Edit Nama, Hapus
- Empty slot card untuk sisa kuota perangkat
- Batas perangkat maksimal sesuai paket akun

## Testing

```bash
php artisan test          # PHPUnit (45 tests)
npx vitest run            # Vitest (129 tests)
npm run build             # Vite build check
```

Backend tests mencakup: auth flow, API response contract, dashboard access control & data retrieval,
safebrowsing/parental control updates, web services listing, cache lock behavior, API key revocation, setup API key validation, exception handling.

Frontend tests mencakup: component rendering, form states (loading/error/success),
auth context (login/register/logout, refreshUser, checkAuth all-error cleanup),
route guards, per-path navigation debounce, API client interceptors (auth retry, redirect),
hooks (useDashboard, useActivityLog, useParentalControlPage), all pages (Dashboard, ParentalControl, Devices, Login, Register, ForgotPassword, SetupApiKey, Settings, Activity),
shared components (EmptyState, InlineError, Loading, SettingsCard).
