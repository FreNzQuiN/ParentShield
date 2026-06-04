# ParentShield

Aplikasi monitoring orang tua untuk aktivitas internet anak melalui API AdGuard DNS. Frontend React SPA dengan backend Laravel — semua komunikasi ke AdGuard melalui Laravel, tanpa *direct call* dari browser. 

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Backend | Laravel 12, PHP ^8.2 |
| Frontend | React 19, TypeScript 6, Tailwind CSS v4 |
| Auth | Laravel Sanctum (token-based) |
| Database | MySQL / SQLite (development) |
| Testing | PHPUnit, Vitest |

## Arsitektur

```
Browser → React SPA → Laravel API → AdGuard DNS API
```

Laravel menangani autentikasi, validasi, enkripsi API key, normalisasi respons/error, dan seluruh logika bisnis. Frontend hanya berkomunikasi dengan Laravel.

## Prasyarat

- PHP ^8.2, Composer
- Node.js 18+, npm
- Ekstensi PHP: `pdo_mysql` atau `pdo_sqlite`, `openssl`, `mbstring`, `tokenizer`, `json`, `ctype`, `filter`
- Akun AdGuard DNS ([adguard-dns.io](https://adguard-dns.io)) — untuk API key

## Setup Lokal

```bash
# 1. Clone & masuk direktori
git clone https://github.com/FreNzQuiN/ParentShield.git
cd ParentShield

# 2. Install dependencies
composer install
npm install

# 3. Environment
cp .env.example .env
php artisan key:generate

# 4. Atur database di .env
#    Opsi A — SQLite (tanpa instalasi, cocok untuk coba-coba)
DB_CONNECTION=sqlite
# DB_DATABASE=/absolute/path/database.sqlite
#    Opsi B — MySQL
DB_CONNECTION=mysql
DB_DATABASE=db_parentshield

# 5. Migrasi
touch database/database.sqlite   # hanya jika SQLite
php artisan migrate

# 6. Build aset frontend
npm run build

# 7. Jalankan (concurrent: Laravel + Vite + queue + logs)
composer run dev
```

Buka `http://localhost:8000`.

### Environment Penting

| Variable | Keterangan |
|----------|-----------|
| `APP_KEY` | Wajib diisi (`php artisan key:generate`) |
| `ADGUARD_BASE_URL` | Endpoint API AdGuard (default: `https://api.adguard-dns.io/oapi/v1`) |
| `TRUSTED_PROXIES` | Proxy tepercaya (default `*` untuk dev) |
| `SESSION_DRIVER` | `database` untuk persist login |
| `APP_LOCALE` | Bahasa UI (default: `id`) |

## Testing

```bash
# Backend (PHPUnit)
php artisan test

# Frontend (Vitest)
npx vitest run

# Type check
npm run typecheck
```

## Struktur Proyek

```
app/
├── Exceptions/
│   └── AdGuardApiException.php
├── Http/
│   ├── Controllers/Api/
│   │   ├── AuthController.php
│   │   ├── DashboardController.php
│   │   ├── DeviceController.php
│   │   ├── LogController.php
│   │   └── SetupApiKeyController.php
│   ├── Middleware/
│   │   ├── AddCorrelationId.php
│   │   └── CheckApiKey.php
│   └── Requests/Api/
│       ├── QueryLogRequest.php
│       ├── SetupApiKeyRequest.php
│       ├── StoreDeviceRequest.php
│       ├── UpdateDeviceRequest.php
│       ├── UpdateParentalControlRequest.php
│       └── UpdateSafebrowsingRequest.php
├── Models/
│   └── User.php              # + adguard_api_key_encrypted, verified_at
└── Services/
    └── AdGuardService.php    # HTTP client ke AdGuard API

resources/js/
└── app/
    ├── components/
    │   ├── features/
    │   │   ├── activity/        # ActivityFilters, ActivityPagination, ActivityTable, dll.
    │   │   ├── dashboard/       # BarChart, StatCard, KontrolParental, dll.
    │   │   ├── devices/         # DeviceCard, CreateDeviceForm, SetupDeviceModal, dll.
    │   │   ├── parentalControl/ # ServiceBlocklistByCategory, ServiceBlocklistProvider
    │   │   ├── setupApiKey/     # ApiKeyInfoModal
    │   │   ├── AppLayout.tsx
    │   │   └── SideNavBar.tsx
    │   └── shared/              # AuthLayout, Modal, Toast, ToggleSwitch, ConfirmDialog,
    │                            # Loading, LoadingOverlay, EmptyState, InlineError,
    │                            # FormInput, SettingsCard, RefreshBar, StepList, icons
    ├── constants/               # serviceGroups (JSON + TS), time, urls
    ├── contexts/                # AuthContext, AuthProvider, ToastContext, ToastProvider
    ├── hooks/                   # useActivityLog, useDashboard, useDialog,
    │                            # useIsMobile, useParentalControlPage
    ├── pages/                   # Login, Register, ForgotPassword, SetupApiKey,
    │                            # Dashboard, Devices, Activity, Settings, ParentalControl
    ├── routes/guards/           # ProtectedRoute, RequireApiKey
    ├── services/api/            # client (axios), auth, dashboard, devices,
    │                            # setupApiKey, activity
    ├── types/                   # api, auth, activity, dashboard, device
    └── utils/                   # error, storage, parentalControl

routes/
├── api.php              # Prefix /api/v1
└── web.php              # SPA catch-all
```

## Endpoint API

Semua endpoint berada di prefix `/api/v1`.

| Method | Path | Auth | Fungsi |
|--------|------|------|--------|
| GET | `/health` | — | Status API |
| POST | `/auth/register` | — | Registrasi |
| POST | `/auth/login` | — | Login |
| POST | `/auth/forgot-password` | — | Kirim link reset password |
| POST | `/auth/logout` | sanctum | Logout |
| GET | `/auth/me` | sanctum | Profil user |
| POST | `/auth/refresh` | sanctum | Perbarui token |
| PUT | `/auth/profile` | sanctum | Ubah nama profil |
| PUT | `/auth/password` | sanctum | Ubah kata sandi |
| POST | `/setup-api-key` | sanctum | Verifikasi & simpan API key AdGuard |
| GET | `/setup-api-key/status` | sanctum | Status API key |
| GET | `/dashboard` | sanctum+key | Statistik agregat |
| GET | `/dashboard/services` | sanctum+key | Daftar layanan web |
| PUT | `/dashboard/safebrowsing` | sanctum+key | Toggle proteksi global |
| PUT | `/dashboard/parental-control` | sanctum+key | Update kontrol parental |
| GET | `/devices` | sanctum+key | Daftar perangkat |
| POST | `/devices` | sanctum+key | Tambah perangkat |
| GET | `/devices/{id}` | sanctum+key | Detail perangkat |
| PUT | `/devices/{id}` | sanctum+key | Ubah nama perangkat |
| DELETE | `/devices/{id}` | sanctum+key | Hapus perangkat |
| GET | `/devices/{id}/doh.mobileconfig` | sanctum+key | Unduh profil iOS DoH |
| GET | `/logs/query` | sanctum+key | Log aktivitas DNS (filter: time range, devices, status, search) |

Kolom Auth: `sanctum` = `auth:sanctum`, `sanctum+key` = `auth:sanctum` + middleware `check-api-key`.

## Deployment

Aplikasi ini dapat dijalankan di lingkungan production standar (VPS, shared hosting) maupun *serverless* (Vercel, Laravel Vapor) dengan penyesuaian konfigurasi pada entry point dan environment.
