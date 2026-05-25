# ParentShield

Aplikasi monitoring orang tua untuk aktivitas internet anak, menggunakan API AdGuard DNS.

## Stack

| Layer | Teknologi |
|-------|-----------|
| Backend | Laravel 12, PHP 8.2+ |
| Frontend | React 19, TypeScript, Tailwind CSS |
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
│   │                              # SetupApiKeyController
│   ├── Middleware/
│   │   ├── AddCorrelationId.php   # X-Correlation-Id header
│   │   └── CheckApiKey.php        # Middleware verifikasi API key
│   └── Requests/
│       ├── Api/                   # SetupApiKey, UpdateSafebrowsing
│       └── Auth/                  # Register, Login, ForgotPassword requests
├── Models/User.php                # + adguard_api_key_encrypted, verified_at
└── Services/
    └── AdGuardService.php         # HTTP client AdGuard API

resources/js/
├── app/
│   ├── components/
│   │   ├── features/              # SideNavBar, AppLayout, Dashboard/*, devices/*
│   │   └── shared/                # AuthLayout, FormInput, Loading, LoadingOverlay,
│   │                              # InlineError, Toast, EmptyState, Modal, icons
│   ├── contexts/                  # AuthContext, ToastContext
│   ├── hooks/                     # useDashboard, useIsMobile, useDialog
│   ├── routes/guards/             # ProtectedRoute, RequireApiKey
│   ├── services/api/              # client (axios), auth, dashboard, devices, setupApiKey
│   ├── types/                     # api, auth, dashboard, device
│   └── utils/                     # error, storage
└── pages/                         # Login, Register, ForgotPassword, SetupApiKey,
                                   # Dashboard, Activity, Devices, Settings
```

## Flow Aplikasi

```
Login/Register
  ↓ (berhasil)
Setup API Key AdGuard
  ↓ (key valid)
Dashboard (statistik, proteksi global)
  ↓
Monitoring (fitur device/activity/settings bertahap)
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
| POST | `/api/v1/setup-api-key` | sanctum | Verifikasi & simpan API key |
| GET | `/api/v1/setup-api-key/status` | sanctum | Cek status API key |
| GET | `/api/v1/dashboard` | sanctum+key | Data aggregated dashboard |
| PUT | `/api/v1/dashboard/safebrowsing` | sanctum+key | Toggle proteksi |
| PUT | `/api/v1/dashboard/parental-control` | sanctum+key | Update kontrol parental |
| GET | `/api/v1/devices` | sanctum+key | Daftar perangkat |
| POST | `/api/v1/devices` | sanctum+key | Tambah perangkat |
| GET | `/api/v1/devices/{device}` | sanctum+key | Detail perangkat |
| PUT | `/api/v1/devices/{device}` | sanctum+key | Ubah nama perangkat |
| DELETE | `/api/v1/devices/{device}` | sanctum+key | Hapus perangkat |
| GET | `/api/v1/devices/{device}/doh.mobileconfig` | sanctum+key | Unduh mobileconfig |

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
| `success-badge` | `#a0f399` | Background badge |
| `danger` | `#ba1a1a` | Diblokir, angka merah |
| `danger-bar` | `#dd3635` | Progress bar danger |
| `inactive` | `#dfe3e8` | Toggle OFF, dot offline |
| `chart-blue` | `#adc7ff` | Bar chart secondary |

### Tipografi

| Level | Ukuran | Tailwind | Elemen |
|-------|--------|----------|--------|
| Hero / page title | 24px | `text-[24px]` | Welcome heading, judul halaman auth |
| Section title | 20px | `text-[20px]` | Card section headers |
| Body / label | 14px | `text-sm` | Input, placeholder, subtitle, button |
| Caption | 12px | `text-xs` | Helper text, footer |

Font: **Roboto** (UI), **Liberation Serif** (brand name).

Font body **wajib 14px** — jangan gunakan `text-base` (16px) untuk body.

### Layout

| Token | Value |
|-------|-------|
| Sidebar | 256px |
| Card radius | 12px |
| Card padding | 13px (default), 24px (large) |
| Card shadow | `0px 1px 1px rgba(0,0,0,0.05)` |

## Routing

```
PUBLIC:       /login, /register, /forgot-password
SEMI-PUBLIC:  /setup-api-key (auth required, no API key needed)
PROTECTED:    /dashboard, /activity, /devices, /settings
```

## Testing

```bash
php artisan test          # PHPUnit (36 tests)
npx vitest run            # Vitest (95 tests)
npm run build             # Vite build check
```

Backend tests mencakup: auth flow, API response contract, dashboard access control,
setup API key validation, exception handling.

Frontend tests mencakup: component rendering, form states (loading/error/success),
auth context, route guards, API client interceptors, hooks (useDashboard),
all pages (Dashboard, Devices, Login, Register, ForgotPassword, SetupApiKey),
shared components (EmptyState, InlineError, Loading).
