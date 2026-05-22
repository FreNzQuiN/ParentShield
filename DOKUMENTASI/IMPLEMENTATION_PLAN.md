# ParentShield — IMPLEMENTATION_PLAN

Dokumen ini adalah rencana implementasi final untuk membangun ParentShield secara **bertahap per fitur/halaman**, dengan prioritas **ketangguhan (robustness)**, **maintainability**, dan **kemudahan debugging**.

---

## 1) Tujuan & Prinsip Implementasi

### Tujuan utama
- Merealisasikan flow wajib aplikasi parent monitoring sesuai dokumen produk.
- Menyederhanakan integrasi AdGuard DNS API lewat backend Laravel (bukan direct frontend).
- Menjamin aplikasi stabil pada state sukses, gagal, loading, empty, timeout, rollback.

### Prinsip engineering
1. **Feature-first delivery**: implementasi per fitur/halaman end-to-end.
2. **Backend contract dulu**: endpoint + validasi + error schema distabilkan sebelum UI final.
3. **Single source of truth**: state otentikasi, status API key, dan status device dari backend.
4. **Fail-safe by default**: semua aksi kritis punya rollback/error handling.
5. **Consistent DX**: struktur modular, naming konsisten, reusable components, minim duplikasi.

---

## 2) Referensi Sumber (Wajib)

- Integrasi AdGuard API: `DOKUMENTASI/DOCUMENTATION.md:7`, `DOKUMENTASI/DOCUMENTATION.md:15`
- Flow aplikasi wajib: `DOKUMENTASI/ParentShield.md:13`, `DOKUMENTASI/ParentShield.md:14`
- Device limit + rollback: `DOKUMENTASI/ParentShield.md:15`, `DOKUMENTASI/ParentShield.md:18`
- UI implementation detail: `DOKUMENTASI/ParentShield_UI.md:172`, `DOKUMENTASI/ParentShield_UI.md:592`
- AddDevice koreksi Android/Windows/iOS: `DOKUMENTASI/ParentShield_UI.md:523`
- Popup global add device: `DOKUMENTASI/ParentShield_UI.md:544`
- State management wajib: `DOKUMENTASI/ParentShield_UI.md:566`
- Cursor pagination query log: `DOKUMENTASI/ParentShield_UI.md:642`, `DOKUMENTASI/DOCUMENTATION.md:77`

> Catatan scope: **Tidak mengimplementasikan scheduler/jam malam** pada plan ini.

---

## 3) Scope Final (In-Scope vs Out-of-Scope)

## In-Scope
- Auth (Login, Register, Forgot Password)
- Setup API Key (verify + persist + guard redirect)
- Dashboard
- Activity History (cursor pagination)
- Devices (list, add, sync, delete, slot limit)
- AddDevice modal (Android/Windows/iOS sesuai koreksi)
- Settings (Profil, Password, Integrasi AdGuard)
- Global popup “Belum ada perangkat”
- Error/loading/empty/toast state di semua fitur inti

## Out-of-Scope (fase ini)
- Scheduler / time-based blocking automation
- Subscription premium flow
- Device detail page kompleks (akan dibuat placeholder/mini-manage jika diperlukan)
- Multi-tenant/team account

---

## 4) Target Arsitektur

## 4.1 High-level
Frontend React+TS ↔ Laravel Internal API ↔ AdGuard DNS API

- Frontend **tidak** direct call ke AdGuard.
- Laravel mengelola:
  - otorisasi pengguna
  - validasi payload
  - normalisasi response/error
  - translasi fitur UI ↔ payload AdGuard

## 4.2 Integrasi AdGuard
- Base URL: `https://api.adguard-dns.io/oapi/v1`
- Header auth: `Authorization: ApiKey {api_key}`
- Endpoint kunci:
  - `PUT /dns_servers/{dns_server_id}/settings`
  - `POST /devices`
  - `PUT /devices/{id}/settings`
  - `GET /devices/{id}/doh.mobileconfig`
  - `GET /query_log`
  - `GET /stats/categories`
  - `GET /stats/time`
  - `GET /account/limits`
  - `GET /web_services`

---

## 5) Strategi Implementasi Bertahap (Per Fitur/Halaman)

## Fase 0 — Foundation & Guardrails
**Output**
- Struktur folder backend/frontend final.
- Konvensi response API & error schema tunggal.
- Logging strategy + correlation id minimal.
- Base UI tokens & shared components skeleton.

**Deliverables**
- Contract response standar:
  - success: `{ success: true, data, message }`
  - error: `{ success: false, code, message, errors? }`
- Global error handler backend + axios interceptor frontend.
- Reusable state UI: `Loading`, `InlineError`, `Toast`, `EmptyState`.

---

## Fase 1 — Auth Pages (Login/Register/Forgot)
Halaman:
- `/login`
- `/register`
- `/forgot-password`

**Backend**
- Endpoint auth + validasi form.
- Session/token mekanisme dipilih konsisten untuk SPA.
- Rate-limit minimal untuk login/forgot-password.

**Frontend**
- Form sesuai UI guide.
- Validation client-side + server-side message mapping.
- State wajib:
  - loading
  - error credentials/network
  - success feedback (forgot password)

**Acceptance**
- User bisa register → login.
- Error invalid credential muncul jelas.
- Akses route protected ditolak saat belum login.

---

## Fase 2 — Setup API Key (Gate Wajib)
Halaman:
- `/setup-api-key`

**Backend**
- Endpoint verify API key ke AdGuard.
- Simpan key secara aman (encrypted at rest).
- Endpoint status koneksi API key.

**Frontend**
- Form API key + state loading/success/error.
- Redirect logic:
  - login + key invalid/kosong → wajib ke `/setup-api-key`
  - key valid → lanjut route protected

**Acceptance**
- Key invalid ditolak dengan pesan ramah.
- Key valid membuka akses ke halaman protected.
- Status koneksi tampil sinkron dengan backend.

---

## Fase 3 — Routing Guard & App Shell
Halaman protected:
- `/dashboard`
- `/activity`
- `/devices`
- `/settings`

**Implementasi**
- `ProtectedRoute` (auth wajib)
- `RequireApiKey` (API key valid wajib)
- Shared `SideNavBar` reusable dengan active state dinamis.
- Layout shell global (sidebar + main).

**Acceptance**
- Urutan guard sesuai dokumen:
  1) belum login → `/login`
  2) login, key invalid/kosong → `/setup-api-key`
  3) login+key valid lanjut route tujuan
- Active nav tidak hardcoded.

---

## Fase 4 — Devices Core + AddDevice Flow
Halaman:
- `/devices`
- AddDevice Modal (Android/Windows/iOS)

**Backend**
- Endpoint:
  - list devices
  - add/register device
  - update device settings
  - sync orphan devices dari AdGuard ke DB
  - delete device
  - account limits
  - doh.mobileconfig download (iOS)
- Rollback transaksi bisnis:
  - POST `/devices` sukses, PUT `/devices/{id}/settings` gagal → delete remote + hapus DB
  - timeout deteksi koneksi → rollback

**Frontend**
- Device grid + slot banner dinamis (`X/5`).
- Empty slot card membuka AddDevice modal.
- Instruksi platform:
  - Android: private DNS hostname
  - Windows: DNS manual + DoH URL (koreksi dari Figma)
  - iOS: tombol download `.mobileconfig`
- Polling status koneksi device.
- Delete confirm dialog.

**Acceptance**
- Maks 5 device enforced.
- Flow add device robust: success, timeout, rollback tertangani.
- iOS profile download berjalan.

---

## Fase 5 — Global Popup “Belum Ada Device”
Scope:
- Muncul di semua halaman protected selama `devices.length === 0`.
- Bisa dismiss sementara, muncul lagi setelah reload jika tetap belum ada device.

**Acceptance**
- Popup konsisten lintas halaman.
- Hilang otomatis setelah device pertama berhasil ditambahkan.

---

## Fase 6 — Dashboard
Halaman:
- `/dashboard`

**Backend**
- Aggregation endpoint dashboard (recommended) agar frontend sederhana:
  - total requests
  - blocked count
  - active devices
  - stats/time
  - stats/categories
  - quick device list

**Frontend**
- 3 stat cards.
- Aktivitas harian chart (recharts/custom).
- Progress bars kategori.
- Panel proteksi global (optimistic update + rollback jika gagal).
- Device anak list + link ke devices.

**Catatan penting**
- Toggle “Filter Pencarian Aman” belum mapping API final; sementara:
  - opsi A: hide dulu
  - opsi B: tampil disabled + tooltip “menunggu dukungan backend”

**Acceptance**
- Data dashboard tampil <latensi target internal>.
- Toggle gagal → UI rollback, toast error tampil.

---

## Fase 7 — Activity History
Halaman:
- `/activity`

**Backend**
- Endpoint activity dengan:
  - filter keyword/status/device
  - `time_from_millis`, `time_to_millis`
  - cursor passthrough dari AdGuard
- Normalisasi BigInt agar aman di frontend (recommended: stringify di Laravel).

**Frontend**
- Filter bar.
- List grouped by date.
- “Muat Lebih Banyak” berbasis cursor (bukan page).
- Insights sidebar summary.

**Acceptance**
- Cursor pagination stabil.
- No duplicate/no missing item antar page.
- State `loading-more` dan `no-more-data` akurat.

---

## Fase 8 — Settings
Halaman:
- `/settings`

**Backend**
- Update profil user.
- Update password (current password verification).
- Integrasi AdGuard:
  - verify & save API key
  - remove API key
  - connection status endpoint

**Frontend**
- 3 card:
  - Profil
  - Keamanan
  - Integrasi AdGuard
- Visibility toggle API key.
- Status indicator connected/disconnected real-time.

**Acceptance**
- Update profil/password aman.
- API key verify/save/remove konsisten + guard behavior otomatis.

---

## 6) Struktur Teknis yang Disarankan

## Backend (Laravel)
- `app/Http/Controllers/Api/...`
- `app/Services/AdGuardService.php`
- `app/Services/DeviceProvisionService.php` (rollback orchestration)
- `app/Http/Middleware/CheckApiKey.php`
- `app/Http/Resources/...` (response shaping)
- `app/Exceptions/...` (domain exception mapping)
- `routes/api.php`

## Frontend (React + TypeScript)
- `resources/js/app/`
  - `pages/`
  - `components/shared/`
  - `components/features/`
  - `routes/guards/`
  - `services/api/`
  - `contexts/`
  - `hooks/`
  - `types/`
  - `utils/`
  - `styles/tokens.ts`

---

## 7) Data Model Minimum (Laravel)

- `users`
  - + `adguard_api_key_encrypted` (nullable)
  - + `adguard_api_key_verified_at` (nullable)
- `devices`
  - `id`, `user_id`, `adguard_device_id`, `name`, `platform`, `status`, `last_seen_at`, timestamps
- (opsional ringan) `device_sync_logs`
  - untuk audit sync/rollback

> Tidak membuat tabel scheduler pada plan ini.

---

## 8) Error Handling & Resilience Checklist

1. Semua call AdGuard memakai timeout + retry terbatas untuk error transient.
2. Error code AdGuard ditranslasikan ke pesan user-friendly.
3. Aksi multi-step device provisioning pakai kompensasi rollback.
4. Frontend optimistic update hanya untuk toggle yang aman; rollback wajib.
5. Semua form disable submit saat loading untuk mencegah duplicate request.
6. Endpoint sensitif dilindungi rate limit.
7. Logging terstruktur untuk incident debugging.

---

## 9) Testing Strategy (Wajib per Fase)

## Backend
- Feature test per endpoint utama.
- Test validasi & authorization.
- Test skenario rollback device.
- Test mapping error AdGuard.

## Frontend
- Component test form validation.
- Route guard test.
- Integration test flow:
  - login → setup key → add device → dashboard
- State test: loading/error/empty.

## Manual E2E checklist
- Flow wajib ParentShield selesai tanpa dead-end.
- Semua redirect guard sesuai urutan.
- AddDevice 3 platform tervalidasi.

---

## 10) Definition of Done (DoD)

Satu fitur dianggap selesai jika:
1. Endpoint backend + validasi + error mapping selesai.
2. UI halaman sesuai Figma/UI guide + responsive fallback.
3. Semua state (loading/success/error/empty) ada.
4. Test minimal lulus (backend + frontend sesuai cakupan fitur).
5. Tidak ada regression pada flow login → setup key → add device.

---

## 11) Urutan Eksekusi yang Direkomendasikan

1. Foundation + contract
2. Auth
3. Setup API key
4. Route guards + app shell
5. Devices + AddDevice + rollback
6. Global popup no-device
7. Dashboard
8. Activity
9. Settings
10. Hardening + test sweep + polish

---

## 12) Risiko & Mitigasi

1. **Mismatch Figma vs behavior nyata platform**
   - Mitigasi: pakai instruksi platform koreksi (Android/Windows/iOS).
2. **AdGuard response edge cases / limit**
   - Mitigasi: validasi limit via `/account/limits`, graceful handling `FIELD_REACHED_LIMIT`.
3. **BigInt parsing issue**
   - Mitigasi: normalisasi ID/string di backend.
4. **Flow AddDevice rawan partial success**
   - Mitigasi: provisioning service + rollback teruji.
5. **UI state belum didesain di Figma**
   - Mitigasi: design-system state components reusable.

---

## 13) Keputusan Produk yang Perlu Dipatok Sebelum Implementasi Dashboard

1. Toggle “Filter Pencarian Aman”:
   - hide sementara / disable / mapping khusus?
2. Tombol “Kelola” device:
   - route `/devices/:id` sederhana atau modal quick-manage?
3. Strategy BigInt final:
   - normalisasi di Laravel (recommended) atau `json-bigint` di frontend.

   
## 14) Ringkasan

Plan ini memprioritaskan:
- flow wajib aplikasi selesai end-to-end
- implementasi per fitur/halaman yang aman dan terukur
- robust error handling + rollback pada area paling kritis (device provisioning)

Implementasi berjalan iteratif dengan quality gate per fase sebelum lanjut ke fase berikutnya.