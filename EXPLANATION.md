# EXPLANATION — Panduan Teknis ParentShield

Dokumen ini menjelaskan *mengapa* setiap komponen, dependensi, dan keputusan arsitektur dipilih. Dirancang sebagai referensi untuk developer yang ingin memahami alasan di balik setiap baris konfigurasi dan kode.

---

## A. PHP Extensions

### `pdo_mysql` / `pdo_sqlite`

**Fungsi:** Koneksi ke database. Dua opsi karena lingkungan development dan production punya kebutuhan berbeda.

| Opsi | Cocok untuk | Setup |
|------|-------------|-------|
| SQLite | Development lokal, testing, contributor cepat | Zero config — `touch database.sqlite` |
| MySQL / TiDB | Production, staging, load-balanced | Butuh server database terpisah |

**Lokasi di kode:**
- `config/database.php:45-67` — konfigurasi koneksi `mysql` dan `sqlite`
- `phpunit.xml:25-26` — testing memakai `sqlite::memory:` agar cepat dan isolasi
- Seluruh model Eloquent (`app/Models/User.php`) — operasi database via PDO

**Kenapa dua sekaligus:** Fleksibilitas development. Kontributor cukup punya PHP tanpa perlu install MySQL. Production tetap pakai MySQL karena menangani konkurensi lebih tinggi.

---

### `openssl`

**Fungsi:** Enkripsi dan dekripsi data sensitif — terutama **API key AdGuard** pengguna. Juga digunakan Laravel untuk APP_KEY, session, dan cookie encryption.

**Lokasi di kode:**
- `app/Models/User.php` (method `getDecryptedAdguardKey`, `setAdguardKeyAttribute`) — enkripsi AES-256-CBC via `Crypt::encryptString`
- `config/app.php` — `'key' => env('APP_KEY')` — digunakan Laravel untuk enkripsi session/CSRF
- `php artisan key:generate` — memanggil `openssl_random_pseudo_bytes` untuk generate key 32 byte

**Kenapa wajib:** Tanpa ini API key AdGuard tersimpan sebagai plaintext di database `users.adguard_api_key_encrypted`. Jika database bocor, semua API key pengguna terekspos. Enkripsi memastikan hanya Laravel (dengan APP_KEY) yang bisa mendekripsinya.

---

### `mbstring`

**Fungsi:** Multibyte string handling untuk karakter UTF-8. Bahasa Indonesia menggunakan huruf Latin standar, tapi Laravel tetap membutuhkan `mbstring` untuk fungsi string internal seperti `Str::lower()`, `Str::upper()`, `Str::slug()` yang aman terhadap UTF-8.

**Lokasi di kode:**
- `config/database.php:158` — `Str::slug(env('APP_NAME', 'laravel'), '_')` untuk Redis prefix
- Seluruh error message di `bootstrap/app.php:41-134` — string Indonesia

**Kenapa wajib:** Tanpa `mbstring`, `strtolower()` akan gagal pada string dengan multibyte characters. Fungsi-fungsi Laravel yang bergantung pada `Str::*` akan melempar `RuntimeException`.

---

### `tokenizer`

**Fungsi:** PHP tokenizer (`token_get_all`, `token_name`) digunakan oleh **Blade template engine** untuk memproses direktif seperti `@if`, `@foreach`, `@section`.

**Lokasi di kode:**
- `resources/views/welcome.blade.php` — file entry point SPA (satu-satunya view Blade)
- Laravel internal: `Illuminate\View\Compilers\BladeCompiler` — mengubah Blade syntax menjadi PHP

**Kenapa wajib:** Meski aplikasi hanya punya satu file Blade (`welcome.blade.php`), Laravel tetap memuat Blade compiler di kernel. Tanpa `tokenizer`, setiap render halaman akan error `Call to undefined function token_get_all`.

---

### `json`

**Fungsi:** Encoding dan decoding JSON. Seluruh komunikasi data dalam aplikasi berbasis JSON.

**Lokasi di kode:**
- `app/Helpers/ApiResponse.php` — format respons standar `{ success, data, message }`
- `app/Services/AdGuardService.php` — parse respons dari AdGuard DNS API
- `resources/js/app/types/device.ts`, `activity.ts`, `dashboard.ts` — tipe data TypeScript yang mapping dari JSON
- `config/service-groups.json` — data layanan terdefinisi

**Aliran data:**

```
AdGuard API → JSON → AdGuardService (json_decode) → Laravel → JSON → React SPA (json_parse)
```

**Kenapa wajib:** Tanpa `json`, tidak ada satupun API yang bisa memproses request atau response. Aplikasi berhenti total.

---

### `ctype`

**Fungsi:** Character type checking (`ctype_alnum`, `ctype_digit`, `ctype_space`, dll). Laravel menggunakannya di middleware **TrimStrings** untuk membersihkan input request.

**Lokasi di kode:**
- `bootstrap/app.php:27` — `\Illuminate\Foundation\Http\Middleware\TrimStrings::class` (didaftarkan di api middleware)
- Laravel internal: `Illuminate\Support\Stringable` dan validator

**Kenapa wajib:** `TrimStrings` menggunakan `ctype_space` untuk mendeteksi whitespace. Tanpa `ctype`, middleware ini error dan seluruh request login/register/setup-api-key gagal diproses.

---

### `filter`

**Fungsi:** Validasi dan filter data melalui `filter_var`. Laravel Validator bergantung pada `FILTER_VALIDATE_EMAIL`, `FILTER_VALIDATE_URL`, `FILTER_SANITIZE_*`.

**Lokasi di kode:**
- `app/Http/Requests/Api/QueryLogRequest.php:18-31` — validasi parameter query log
- Laravel internal: validasi `email`, `url`, `ip`, `boolean` rules

**Contoh dependency chain:**
```php
// Laravel Validator → filter_var
'email' => 'required|email'
// Internally calls: filter_var($value, FILTER_VALIDATE_EMAIL)
```

---

## B. Tech Stack

### Laravel 12

| Fitur | Kenapa dipakai |
|-------|----------------|
| Sanctum | Token-based auth untuk SPA tanpa session cookies |
| Encryption built-in | Enkripsi API key pengguna tanpa library tambahan |
| Exception handling terpusat | Semua error AdGuard ditangani di `bootstrap/app.php` tanpa try-catch di controller |
| Rate limiter | Throttle endpoint sensitif (login: 5/jam) |
| Queue native | Polling device status tanpa blocking request |

**Alternatif yang dipertimbangkan dan alasan tidak dipilih:**

| Alternatif | Alasan tidak dipilih |
|------------|---------------------|
| Express.js / Node.js | Tidak punya enkripsi built-in, harus setup JWT manual, tidak ada rate limiter native |
| Django / Python | Overkill untuk API proxy + SPA, ORM kurang fleksibel untuk mapping response AdGuard |
| Laravel 11 | Rilis terbaru terjaga, Long Term Support |

### React 19 + TypeScript 6

**Kenapa React:**
- **Component reusability** — `shared/*` (Modal, ToggleSwitch, Toast) dipakai di 5+ halaman
- **Hooks** — `useDashboard`, `useActivityLog`, `useParentalControlPage` memisahkan data fetching dari UI
- **Ecosystem mature** — react-router-dom untuk routing, Axios untuk HTTP, testing-library untuk test

**Kenapa TypeScript:**
- Response AdGuard punya struktur kompleks dan nested — tipe seperti `QueryLogResponse`, `DashboardData`, `DeviceDetail` butuh definisi eksplisit
- 5 file definisi tipe di `resources/js/app/types/` — api, auth, activity, dashboard, device
- Mencegah bug mapping yang pernah terjadi di versi awal (field `page_cursor` di cursor pagination, `value.queries` di stats)

**Kenapa bukan alternatif:**

| Alternatif | Alasan |
|------------|--------|
| Vue 3 | Kurang mature untuk TypeScript strict mode, ecosystem testing lebih kecil |
| Svelte 5 | Masih baru, kurang library untuk HTTP client patterns |
| Plain JS | Tidak bisa menjamin tipe response API yang kompleks |

### Tailwind CSS v4

**Pendekatan:**
- Semua tokens warna didefinisikan di `resources/css/app.css` via `@theme` — bersumber langsung dari Figma
- Utility classes → zero custom CSS, hanya Tailwind utility di JSX
- Build-time compiled — tidak ada CSS framework yang di-load browser

**Kenapa bukan CSS biasa:**
- 22 komponen shared + 5 halaman fitur tanpa file CSS terpisah
- Warna konsisten — semua komponen pakai `bg-primary`, `text-text-secondary`, `border-border/20`
- Dark mode siap pakai jika dibutuhkan nanti

---

## C. Arsitektur

### Kenapa frontend tidak direct call ke AdGuard API?

Ini prinsip utama aplikasi. Ada 4 alasan:

**1. Keamanan API key**

```
[❌ Salah]  Browser → AdGuard API (API key di JS bundle, bocor)
[✅ Benar]  Browser → Laravel → AdGuard API (key di backend, aman)
```

API key AdGuard disimpan terenkripsi di database. Hanya Laravel yang bisa mendekripsinya saat akan dipakai. Browser tidak pernah melihat key dalam bentuk apapun.

**2. Normalisasi respons**

AdGuard API punya format respons inkonsisten:

| Endpoint | Format respons |
|----------|----------------|
| `GET /devices` | Array langsung di root |
| `GET /stats/time` | `{ stats: [...] }` |
| `GET /account/limits` | `{ devices: { max, used } }` |

Laravel menormalisasi semua respons ke format tunggal:

```json
{
  "success": true,
  "data": { ... },
  "message": "Data berhasil dimuat."
}
```

**3. Error mapping**

Error AdGuard ditranslasikan ke Bahasa Indonesia:

| Status AdGuard | Pesan ke user |
|----------------|---------------|
| 401 | "Kunci API tidak valid. Perbarui kunci API di halaman Pengaturan." |
| 405 | "Layanan AdGuard sedang sibuk. Silakan coba beberapa saat lagi." |
| 429 | "Terlalu banyak permintaan. Silakan tunggu beberapa saat." |

**4. Business logic terpusat**

- Rollback device provisioning — jika create device sukses tapi settings gagal, device dihapus otomatis
- Device status inference — dari `last_activity_time_millis` di `/stats/devices`
- Cache dashboard — mencegah request berulang ke AdGuard dalam 30 detik

---

### Kenapa prefix `/api/v1`?

**Versioning API** — jika di masa depan ada perubahan breaking:

```
/api/v1/devices → response format A
/api/v2/devices → response format B (tanpa mengganggu client lama)
```

Frontend dan mobile app bisa migrasi bertahap. Ini standard REST API practice.

---

## D. Database

### SQLite untuk development vs MySQL untuk production

| Aspek | SQLite | MySQL / TiDB |
|-------|--------|--------------|
| Setup | `touch database.sqlite` | Install MySQL + buat database |
| Kecepatan test | Sangat cepat (in-memory) | Lambat (butuh TCP koneksi) |
| Konkurensi | Single-writer | Multi-writer |
| Cocok untuk | Development, testing, CI | Production, staging |

`phpunit.xml:25-26` memaksa semua test memakai SQLite in-memory:
```xml
<env name="DB_CONNECTION" value="sqlite"/>
<env name="DB_DATABASE" value=":memory:"/>
```

### Session di database

Token-based auth tetap membutuhkan session untuk:
- CSRF token (Sanctum)
- Flash messages setelah redirect

`SESSION_DRIVER=database` dipilih karena:
- File session tidak cocok untuk serverless (Vercel) atau load-balanced
- Session persistent meski server restart
- Database session bisa di-monitor via `sessions` table

---

## E. Testing

### PHPUnit (Backend — 14 test)

**Apa yang di-test:**
- API response contract — format `{ success, data, message }` konsisten
- Auth flow — register, login, logout, forgot-password
- Validation — request validation error response
- Middleware — CheckApiKey behavior (revoked, empty, valid)
- Cache behavior — lock mechanism untuk dashboard
- Exception handling — AdGuard error mapping

**Kenapa PHPUnit:**
- Standar Laravel — `php artisan make:test` sudah terkonfigurasi
- `phpunit.xml` sudah include environment testing (SQLite in-memory)
- Feature test bisa mock HTTP client AdGuard via `Http::fake()`

### Vitest (Frontend — 254 test, 39 files)

**Apa yang di-test:**

| Kategori | Contoh test |
|----------|-------------|
| Component rendering | Modal open/close, ToggleSwitch ON/OFF, Toast muncul/hilang |
| Auth context | Login flow, register, logout, refresh token, expired token redirect |
| Route guards | ProtectedRoute → redirect ke /login, RequireApiKey → redirect ke /setup-api-key |
| API interceptors | Axios response interceptor → 401 → logout, 403 → redirect |
| Hooks | `useDashboard` loading/error/success states, `useActivityLog` pagination |
| Pages | Dashboard data render, Device CRUD, ParentalControl toggle, Settings form |

**Konfigurasi penting di `vitest.config.ts`:**
- `environment: 'jsdom'` — simulated browser DOM tanpa browser sungguhan
- `setupFiles: ['./resources/js/test/setup.ts']` — global mock untuk matchMedia, localStorage
- `coverage.provider: 'v8'` — coverage reporting via V8 engine

### `npm run typecheck`

`tsc --noEmit` — memeriksa tipe TypeScript tanpa menghasilkan file JS. Mencegah:

```typescript
// ❌ Error yang dicegat typecheck:
const data = response.data as DashboardData;
// Property 'total_queries' does not exist on type 'DashboardData'
```

---

## F. Deployment

### "Serverless (Vercel, Laravel Vapor)"

Aplikasi bisa jalan di dua mode:

| Mode | Entry point | Cocok untuk |
|------|-------------|-------------|
| Standar | `public/index.php` | VPS, shared hosting, Docker |
| Serverless | `api/index.php` | Vercel, Laravel Vapor |

**Apa yang berubah:**
- Storage path → `/tmp` (serverless tidak punya persistent storage)
- Cache/session → `array` driver (tidak ada file system)
- Trusted proxies → wildcard `'*'` (Vercel proxy IP dinamis)
- SSL CA cert → ditulis ke `/tmp` saat bootstrap
- Debug mode → false

Branch `deploy-vercel3` berisi konfigurasi lengkap untuk mode serverless sebagai referensi implementasi.

---

## G. Istilah dalam Kode

| Istilah | Arti |
|---------|------|
| `sanctum` | Middleware `auth:sanctum` — user harus login dengan token valid |
| `sanctum+key` | `auth:sanctum` + `check-api-key` — user harus login dan punya API key AdGuard valid |
| `doh.mobileconfig` | File konfigurasi DNS-over-HTTPS untuk iOS (.mobileconfig) |
| `time_from_millis` | Parameter waktu (epoch millisecond) filter query log AdGuard |
| `cursor` | Token pagination (bukan page number) — di-cursor dari `pages[].page_cursor` |
| `LONG_OFFLINE_THRESHOLD_MS` | 6 jam — durasi offline sebelum device dianggap "Bahaya" |
| `ADGUARD_UNAUTHORIZED` | Kode error frontend → redirect ke `/setup-api-key?reason=revoked` |
