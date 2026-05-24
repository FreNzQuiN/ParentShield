> Langsung mulai implementasi fase X, test rapi sesuai dokumentasi.
> Kalau ada terminal command besar, berhenti dan biarkan aku yang menjalankan.

## Fase 0 — Foundation & Guardrails ✅
9/9 PHPUnit tests pass.

Backend:
  app/Helpers/ApiResponse.php
  app/Http/Controllers/Controller.php
  app/Http/Controllers/Api/
  app/Http/Middleware/AddCorrelationId.php
  app/Exceptions/Handler.php
  app/Exceptions/AdGuardApiException.php
  routes/api.php (prefix /api/v1, health endpoint)
  bootstrap/app.php (routing + error render + middleware)
  config/logging.php (+ channel 'api')
  tests/Feature/ApiResponseContractTest.php
  tests/Unit/AdGuardApiExceptionTest.php

Frontend:
  resources/js/app/App.tsx
  resources/js/app/styles/tokens.ts (token reference)
  resources/js/app/types/api.ts (ApiResponse<T>, PaginatedData)
  resources/js/app/services/api/client.ts (axios + interceptor)
  resources/js/app/contexts/ToastContext.tsx + ToastProvider.tsx
  resources/js/app/components/shared/ (Loading, InlineError, Toast, EmptyState)
  resources/js/pages/Landing.tsx, NotFound.tsx
  resources/js/test/ (3 component tests)
  tsconfig.json, vitest.config.ts

Response contract:
  Success: { success: true, data, message }
  Error: { success: false, code, message, errors? }

---

## Fase 1 — Auth Pages ✅
23/23 PHPUnit | 33/33 Vitest

Backend (9 files):
  config/sanctum.php, config/auth.php (+ api guard)
  app/Models/User.php (+ HasApiTokens, adguard fields)
  app/Http/Controllers/Api/AuthController.php
  app/Http/Requests/Auth/{Register,Login,ForgotPassword}Request.php
  database/migrations/...add_adguard_fields..., ...personal_access_tokens...

Frontend (10 files):
  types/auth.ts, services/api/auth.ts
  contexts/AuthContext.tsx, AuthProvider.tsx
  pages/Login.tsx, Register.tsx, ForgotPassword.tsx
  test/contexts/AuthProvider.test.tsx
  test/pages/Login.test.tsx, Register.test.tsx, ForgotPassword.test.tsx

Rate limits: Register 10/min, Login 5/min, Forgot-password 3/min

---

## Fase 1.5 — Refactoring Shared Components ✅
Duplikasi kode di Login/Register diekstrak ke shared:

New shared components:
  resources/js/app/components/shared/icons.tsx    ← 14 SVG icons
  resources/js/app/components/shared/AuthLayout.tsx ← Layout fullscreen + footer
  resources/js/app/components/shared/FormInput.tsx   ← Reusable input (label, icon, error, helper)

Refactored:
  pages/Login.tsx    ← 45% lebih pendek, pakai shared components
  pages/Register.tsx ← 45% lebih pendek, pakai shared components
  shared/index.ts    ← barrel export icons + AuthLayout + FormInput

Font sizing fix:
  Standarisasi body text ke 14px (text-sm), bukan 16px.
  Detail: lihat ParentShield_UI.md section 10.

---

## Fase 2 — Setup API Key ✅
**31/31 PHPUnit | 37/37 Vitest**

Backend:
  app/Http/Controllers/Api/SetupApiKeyController.php ← store + status
  routes/api.php (+ auth:sanctum setup-api-key routes)
  app/Http/Controllers/Api/AuthController.php (+ has_api_key di me/login/register)

Frontend:
  pages/SetupApiKey.tsx ← form key + verifikasi + redirect
  services/api/setupApiKey.ts
  routes/guards/RequireApiKey.tsx ← redirect ke /setup-api-key jika !hasApiKey
  contexts/AuthContext.tsx (+ hasApiKey), AuthProvider.tsx
  types/auth.ts (+ has_api_key)
  components/shared/icons.tsx (+ KeyIcon)
  App.tsx (+ route /setup-api-key di dalam ProtectedRoute)
  test/pages/SetupApiKey.test.tsx

Catatan: Validasi format `ag_` TIDAK diterapkan — AdGuard API key bisa format apapun.

---

## Fase 3 — Routing Guard & App Shell ✅ (setelah Fase 1.5)
Baru diimplementasi — agent sebelumnya menyelesaikan Fase 0 & 1.

New files:
  resources/js/app/components/features/SideNavBar.tsx
  resources/js/app/components/features/AppLayout.tsx
  resources/js/app/components/features/index.ts
  resources/js/app/routes/guards/ProtectedRoute.tsx
  resources/js/app/routes/guards/RequireApiKey.tsx ← sekarang fully functional
  resources/js/app/routes/guards/index.ts

Placeholder pages:
  resources/js/pages/Dashboard.tsx    ← welcome header saja
  resources/js/pages/Activity.tsx
  resources/js/pages/Devices.tsx
  resources/js/pages/Settings.tsx

Modified:
  App.tsx — route tree dengan ProtectedRoute → RequireApiKey → AppLayout
  styles/tokens.ts — redesign ke brand actual (warna, fontSize body 14px)

---

## Fase 5.5 — Dashboard Implementation + Bug Fixes ✅
**31/31 PHPUnit | 37/37 Vitest** — all passing.
Frontend rebuilt: `npm run build` (3.60s, 130 modules).

### Backend — AdGuard Dashboard API + Safebrowsing Toggle
- `app/Services/AdGuardService.php` — AdGuard DNS API client:
  - `getDashboardData()` — aggregate stats/time, categories, devices, DNS server settings
  - `getDnsServers()`, `getDnsServerSettings()`, `updateDnsServerSettings()`
  - `getDevices()`, `getDeviceStats()`, `getTimeStats()`, `getCategoryStats()`, `getDomainStats()`
  - `getAccountLimits()`, `verifyApiKey()`
  - `get()`, `put()` — internal HTTP helpers with error handling
  - `handleError()` — normalizes AdGuard errors (401→ADGUARD_UNAUTHORIZED, 405→502, 429→RATE_LIMITED)
- `app/Http/Controllers/Api/DashboardController.php`:
  - `GET /api/v1/dashboard` — returns aggregated dashboard data
  - `PUT /api/v1/dashboard/safebrowsing` — toggles 3 settings (safe_search, block_dangerous, block_nrd)
- `routes/api.php` — registered dashboard endpoints

### Frontend — Dashboard Page
- `types/dashboard.ts` — TypeScript interfaces for DashboardData, TimeSeriesPoint, TopActivity, BlockedCategory, SafebrowsingSettings, DashboardDevice, AccountLimits
- `services/api/dashboard.ts` — fetchDashboard, updateSafebrowsing
- `hooks/useDashboard.ts` — loading/error/refresh/toggleSafebrowsing
- `components/features/dashboard/StatCard.tsx` — 3 stat boxes (total queries, blocked, active devices)
- `components/features/dashboard/BarChart.tsx` — div-based "Aktivitas Harian" chart with Y-axis levels
- `components/features/dashboard/ProgressBarList.tsx` — reusable horizontal bars (top activities + categories)
- `components/features/dashboard/ProteksiGlobal.tsx` — 3 toggles with optimistic update + rollback
- `components/features/dashboard/DeviceAnakList.tsx` — device list with online/offline status
- `pages/Dashboard.tsx` — full dashboard composing all sections

### Critical Bug Fixes

**Bug 1 — `GET /dns_servers/{id}/settings` returns 405**
- Root cause: Endpoint only supports PUT, not GET.
- Fix: Changed to `GET /dns_servers/{id}` and extract `response.settings`.

**Bug 2 — All stats show 0 because wrong field names**
- Root cause: Assumed `time`, `processed`, `categories`, `domains`, `count`, `percent` — actual field names are `stats`, `value.queries`, `stats`, `stats`, `queries`, no percent.
- Fix: Rewired all field mappings to match actual API response schema (see IMPLEMENTATION_PLAN.md §4.2).

**Bug 3 — Safebrowsing toggle payload wrong**
- Root cause: Sent flat `safebrowsing_enabled`, `block_newly_registered_domains`, `parental_settings`.
- Fix: Changed to nested `safebrowsing_settings: { enabled, block_dangerous_domains, block_nrd }`, `parental_control_settings`.

**Bug 4 — Axios 401 interceptor redirect loop**
- Root cause: Interceptor caught ALL 401s including `/auth/login`.
- Fix: Skip redirect for auth routes (`/auth/login`, `/auth/register`, `/auth/forgot-password`).

**Bug 5 — API key saved but dashboard redirect fails**
- Root cause: `hasApiKey` state not refreshed after saving.
- Fix: Added `refreshUser()` to AuthContext; SetupApiKey calls it after save.

**Bug 6 — `Http::send('GET', ...)` caused 405 from AdGuard**
- Root cause: `Http::send()` sent `'json' => []` body on GET requests.
- Fix: Replaced with `Http::get()` / `Http::put()`.

### Documentation Updated
- `IMPLEMENTATION_PLAN.md` §4.2 — added verified field mappings for all AdGuard endpoints

---

## Belum Dimulai
- Fase 4 — Devices + AddDevice
- Fase 5 — Global Popup No-Device
- Fase 7 — Activity History
- Fase 8 — Settings
