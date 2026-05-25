# ParentShield

Aplikasi monitoring orang tua untuk aktivitas internet anak, menggunakan API AdGuard DNS.

## Stack

| Layer | Teknologi |
|-------|-----------|
| Backend | Laravel 12, PHP 8.2+ |
| Frontend | React 19, TypeScript, Tailwind CSS |
| Auth | Laravel Sanctum (SPA) |
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
│   └── Requests/Auth/             # Register, Login, ForgotPassword requests
├── Models/User.php                # + adguard_api_key_encrypted, verified_at
└── Services/
    └── AdGuardService.php         # HTTP client AdGuard API

resources/js/
├── app/
│   ├── components/
│   │   ├── features/              # SideNavBar, AppLayout, Dashboard/*
│   │   └── shared/                # AuthLayout, FormInput, Loading, InlineError,
│   │                              # Toast, EmptyState, icons
│   ├── contexts/                  # AuthContext, ToastContext
│   ├── hooks/                     # useDashboard
│   ├── routes/guards/             # ProtectedRoute, RequireApiKey
│   ├── services/api/              # client (axios), auth, dashboard, setupApiKey
│   ├── styles/tokens.ts           # Design tokens
│   └── types/                     # api, auth, dashboard
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
  ↓ (popup jika belum ada device)
Add Device (Android / Windows / iOS)
  ↓ (device terdaftar)
Monitoring penuh
```

### Auth Guard (urutan)

1. Belum login → `/login`
2. Login, API key kosong/revoked → `/setup-api-key`
3. Login + API key valid → halaman tujuan
4. Login + API key valid + belum ada device → halaman tujuan + popup add device

### API Key Revoked

Backend set `adguard_api_key_verified_at = null`, return 401 `ADGUARD_UNAUTHORIZED`.
Axios interceptor menangkap kode ini sebelum 401 handler umum, redirect ke `/setup-api-key?reason=revoked`.
Halaman setup menampilkan banner merah: *"Kunci API sebelumnya tidak valid atau telah dicabut."*

### Error Service Setup API Key

Jika service AdGuard sedang down saat verifikasi API key, `verifyApiKey()` me-rethrow
`AdGuardApiException` dengan kode `ADGUARD_CONNECTION_ERROR`. Controller menangkapnya
dan return 503: *"Tidak dapat terhubung ke AdGuard DNS. Periksa koneksi Anda."*

## Endpoint API

| Method | Path | Auth | Fungsi |
|--------|------|------|--------|
| GET | `/api/v1/health` | - | Health check |
| POST | `/api/v1/auth/register` | - | Register |
| POST | `/api/v1/auth/login` | - | Login (return token) |
| POST | `/api/v1/auth/logout` | sanctum | Logout |
| POST | `/api/v1/auth/forgot-password` | - | Kirim link reset |
| GET | `/api/v1/auth/me` | sanctum | User + has_api_key |
| POST | `/api/v1/setup-api-key` | sanctum | Verifikasi & simpan API key |
| GET | `/api/v1/setup-api-key/status` | sanctum | Cek status API key |
| GET | `/api/v1/dashboard` | sanctum+key | Data aggregated dashboard |
| PUT | `/api/v1/dashboard/safebrowsing` | sanctum+key | Toggle proteksi |

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
| QueryException | 503 | Layanan sedang sibuk... |
| ConnectionException | 503 | Layanan sedang sibuk... |
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

### Warna

| Token | Value | Penggunaan |
|-------|-------|-----------|
| `primary` | `#005bbf` | Tombol, link, active state |
| `bgSidebar` | `#f1f4fa` | Background sidebar |
| `bgPage` | `#f7f9ff` | Background halaman |
| `bgCard` | `#ffffff` | Background kartu |
| `success` | `#1b6d24` | Online, toggle ON |
| `danger` | `#ba1a1a` | Diblokir, danger |
| `textPrimary` | `#181c20` | Judul |
| `textSecondary` | `#414754` | Body text |

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
npx vitest run            # Vitest (37 tests)
npm run build             # Vite build check
```

Backend tests mencakup: auth flow, API response contract, dashboard access control,
setup API key validation, exception handling.

Frontend tests mencakup: component rendering, form states (loading/error/success),
auth context, route guards.

## Keputusan Desain

| Keputusan | Alasan |
|-----------|--------|
| API key disimpan encrypted (Crypt::encryptString) | Keamanan data pengguna |
| Axios interceptor untuk ADGUARD_UNAUTHORIZED | Mencegah redirect loop, user dapat penjelasan |
| `?reason=revoked` URL param | Sederhana, no race condition, bookmarkable |
| verifyApiKey() rethrow connection errors | Membedakan "key salah" vs "service down" |
| Optimistic update pada toggle dashboard | UX responsif tanpa lag |
| Semua pesan error dalam Bahasa Indonesia | Target user non-teknis Indonesia |
| Cursor pagination untuk activity log | Sesuai spesifikasi AdGuard API |
| Font body distandarisasi ke 14px | Figma spec, hindari teks terlalu besar |
