# Implementation Plan: Popup Setup Device

## 1. Ringkasan

Implementasi 3 jenis popup setup device (Android/iOS/Windows) setelah user membuat perangkat melalui halaman Devices. Setiap platform mendapat instruksi setup spesifik dengan nilai konfigurasi dari API AdGuard (DNS-over-TLS untuk Android, .mobileconfig untuk iOS, DNS-over-HTTPS untuk Windows).

Pendekatan: **zero tracking** — semua indikator dari data AdGuard API. Akses instruksi **permanen** untuk semua device via tombol "Petunjuk Konfigurasi" di card.

---

## 2. Backend API

Semua endpoint baru di `routes/api.php` dalam group `['auth:sanctum', 'check.api-key']`.

### 2.1 `POST /api/v1/devices` — Create Device

```
Request:  { name: string, device_type: "ANDROID"|"IOS"|"WINDOWS" }
Response: {
  id: string,
  name: string,
  device_type: string,
  dns_addresses: {
    dns_over_tls_url: string,    // "tls://b3e82cd1.adguard-dns.com"
    dns_over_https_url: string   // "https://b3e82cd1.adguard-dns.com/dns-query"
  }
}
```

Logic:
1. Validasi input (name max 64 chars, device_type in ANDROID/IOS/WINDOWS)
2. `$dnsServerId = $this->adGuard->getDefaultDnsServerId()`
3. Proxy `POST /oapi/v1/devices` ke AdGuard
4. Return device + `dns_addresses`

### 2.2 `GET /api/v1/devices` — List Devices

Proxy `GET /oapi/v1/devices` → return array device (sudah termasuk `dns_addresses` per device).

### 2.3 `GET /api/v1/devices/{id}` — Get Device Detail

Proxy `GET /oapi/v1/devices/{device_id}` → return single device with `dns_addresses`. Digunakan saat re-open instruksi setup.

### 2.4 `PUT /api/v1/devices/{id}` — Edit Device

```
Request:  { name: string }
Response: device object
```

Proxy `PUT /oapi/v1/devices/{device_id}` ke AdGuard. Untuk rename device.

### 2.5 `DELETE /api/v1/devices/{id}` — Remove Device

Proxy `DELETE /oapi/v1/devices/{device_id}` ke AdGuard.

### 2.6 `GET /api/v1/devices/{id}/doh.mobileconfig` — iOS Profile

Proxy `GET /oapi/v1/devices/{device_id}/doh.mobileconfig` → return file dengan:
- `Content-Type: application/x-apple-aspen-config`
- `Content-Disposition: attachment; filename="adguard-dns-{device_name}.mobileconfig"`

### 2.7 AdGuardService — New Methods

```php
public function createDevice(string $name, string $deviceType, string $dnsServerId): array
public function getDefaultDnsServerId(): ?string
public function getDevice(string $deviceId): ?array
public function updateDevice(string $deviceId, array $data): bool
public function deleteDevice(string $deviceId): bool
public function getMobileConfig(string $deviceId, string $deviceName): \Illuminate\Http\Client\Response
```

### 2.8 DeviceController

File baru: `app/Http/Controllers/Api/DeviceController.php`

5 methods: `index`, `store`, `show`, `update`, `destroy`, `downloadMobileConfig`.

---

## 3. Frontend — Type Baru

File: `resources/js/app/types/device.ts`

```ts
export type SetupDeviceType = 'ANDROID' | 'IOS' | 'WINDOWS';

export interface DnsAddresses {
  dns_over_tls_url: string;    // "tls://b3e82cd1.adguard-dns.com"
  dns_over_https_url: string;  // "https://b3e82cd1.adguard-dns.com/dns-query"
}

export interface DeviceDetail {
  id: string;
  name: string;
  device_type: SetupDeviceType;
  dns_addresses: DnsAddresses;
  is_online?: boolean;
  last_seen?: number | null;
  protection_enabled?: boolean;
}
```

---

## 4. Frontend — Service API Baru

File: `resources/js/app/services/api/devices.ts`

```ts
export async function fetchDevices(): Promise<DeviceDetail[]>
export async function createDevice(name: string, deviceType: SetupDeviceType): Promise<DeviceDetail>
export async function getDevice(id: string): Promise<DeviceDetail>
export async function updateDevice(id: string, name: string): Promise<DeviceDetail>
export async function deleteDevice(id: string): Promise<void>
export async function downloadMobileConfig(id: string, deviceName: string): Promise<void>
```

---

## 5. Frontend — New Components

### 5.1 Modal (Shared)

File: `resources/js/app/components/shared/Modal.tsx`

Reusable modal dengan:
- Overlay `bg-black/50` — click outside = close (dengan konfirmasi jika perlu)
- Card `bg-white rounded-xl shadow-lg p-6`, max-width `max-w-lg`
- Title `text-[20px] font-['Roboto',sans-serif] text-[#181c20]`
- Close button (X) top-right `text-[#727785]`
- Body scrollable
- Transition: fade in/out

```tsx
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'md' | 'lg';
}
```

### 5.2 Platform Icons

Tambah ke `resources/js/app/components/shared/icons.tsx`:

- `AndroidIcon` — logo Android (robot head)
- `AppleIcon` — logo Apple (apple silhouette)
- `WindowsIcon` — logo Windows (window pane)

Masing-masing SVG component, `size` default 24x24, `fill="currentColor"`.

### 5.3 SetupDeviceModal (Orchestrator)

File: `resources/js/app/components/features/devices/SetupDeviceModal.tsx`

State machine:

```
[closed] → open(deviceType?) → [step1]
[step1]  → submit → loading → error? → [step1] / success → [step2]
[step2]  → close → [closed]
[step2]  → download iOS → loading → error? → [step2]
[step2]  → "Selesai" → [closed]

Jika open() dipanggil dengan deviceDetail (dari "Petunjuk Konfigurasi"):
  skip step1 → langsung [step2]
```

Props:
```tsx
interface SetupDeviceModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;  // refresh device list
  initialDevice?: DeviceDetail | null; // untuk re-open instructions
  initialDeviceType?: SetupDeviceType | null; // pre-select if creating new
}
```

Step indicator:
```
(1) Buat Perangkat ── (2) Setup Perangkat
```

### 5.4 CreateDeviceForm (Step 1)

File: `resources/js/app/components/features/devices/CreateDeviceForm.tsx`

- **Nama Perangkat**: FormInput — placeholder "Contoh: iPhone Anak", max 64
- **Tipe Perangkat**: 3 card radio buttons horizontal:
  ```
  ┌──────────┐  ┌──────────┐  ┌──────────┐
  │ Android  │  │ iOS      │  │ Windows  │
  │   icon   │  │   icon   │  │   icon   │
  └──────────┘  └──────────┘  └──────────┘
  ```
  - Selected: `border-[#005bbf] bg-[#f1f4fa]`
  - Unselected: `border-[#c1c6d6] bg-white`
  - Hover: `border-[#005bbf]/50`
- Tombol "Buat Perangkat": `bg-[#005bbf] text-white h-[50px] rounded-[8px]`, disabled saat loading
- Error state: inline text merah di atas tombol

### 5.5 AndroidSetupInstructions

File: `resources/js/app/components/features/devices/AndroidSetupInstructions.tsx`

```
🤖 Setup Perangkat Android

  [tls://b3e82cd1.adguard-dns.com]   [📋 Salin]
  Hostname: b3e82cd1.adguard-dns.com  [📋 Salin]

  Langkah-langkah:
  ① Buka Settings → Network & Internet → Private DNS
  ② Pilih "Private DNS provider hostname"
  ③ Masukkan hostname: b3e82cd1.adguard-dns.com
  ④ Tekan Save
```

- Dua copy button: full URL (tls://) dan hostname (tanpa prefix)
- Parse: `dns_over_tls_url.replace('tls://', '')` untuk hostname
- Step numbers: lingkaran `bg-[#005bbf] text-white w-6 h-6 rounded-full`

### 5.6 IosSetupInstructions

File: `resources/js/app/components/features/devices/IosSetupInstructions.tsx`

```
🍎 Setup Perangkat iOS

  [⬇ Unduh Profil Konfigurasi]

  Langkah-langkah:
  ① Ketuk tombol di atas untuk mengunduh profil
  ② Buka Settings → General → VPN & Device Management
  ③ Tap profil AdGuard DNS
  ④ Tap Install di pojok kanan atas
  ⑤ Ikuti instruksi hingga selesai
```

- Download button → panggil `GET /api/v1/devices/{id}/doh.mobileconfig` via Axios dengan `responseType: 'blob'`
- Trigger browser download: `URL.createObjectURL(blob)` + `<a>` click
- Loading state saat download
- Error handling inline (bukan toast — user tetap dalam modal)

### 5.7 WindowsSetupInstructions

File: `resources/js/app/components/features/devices/WindowsSetupInstructions.tsx`

```
💻 Setup Perangkat Windows

  [Windows 11] [Chrome/Edge] [Firefox]

  ── Tab: Windows 11 System-wide ──

  [IP DNS: 94.140.14.15]           [📋 Salin]
  [URL: https://.../dns-query]     [📋 Salin]

  ① Settings → Network & Internet → [Wi-Fi/Ethernet]
  ② Hardware properties → DNS server assignment → Edit
  ③ Manual → IPv4 ON
  ④ Preferred DNS → paste 94.140.14.15
  ⑤ DNS over HTTPS → On (manual template)
  ⑥ DoH template → paste URL
  ⑦ Save

  ── Tab: Chrome/Edge ──

  [URL: https://.../dns-query]     [📋 Salin]

  ① Settings → Privacy & Security → Security
  ② "Use secure DNS" → ON → Custom
  ③ Paste URL
  ④ Tutup tab (auto-save)

  ── Tab: Firefox ──

  [URL: https://.../dns-query]     [📋 Salin]

  ① Settings → General → Network Settings → Settings...
  ② Check "Enable DNS over HTTPS"
  ③ Custom → paste URL → OK
```

- Tab style: horizontal row, `bg-[#f1f4fa] rounded-lg p-1`, active tab `bg-white shadow-sm`
- IP `94.140.14.15` = hardcoded constant (AdGuard DNS public resolver, free)
- URL = `dns_addresses.dns_over_https_url`

### 5.8 EditDeviceModal

File: `resources/js/app/components/features/devices/EditDeviceModal.tsx`

Modal sederhana:
- FormInput untuk nama (pre-filled dengan nama existing)
- Tombol "Simpan" — `PUT /api/v1/devices/{id}` → refresh list
- Tombol "Batal"
- Error handling inline

---

## 6. Devices Page

File: `resources/js/pages/Devices.tsx` (rewrite)

### 6.1 Layout

```
┌─────────────────────────────────────────────┐
│ Perangkat Dilindungi                [+ Tambah]│
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ 📱 iPhone Anak                   ⋮     │ │
│ │   iOS · 🟢 Online                      │ │
│ │  ┌────────────────────────────────┐    │ │
│ │  │ ⚙️ Petunjuk Konfigurasi      │    │ │
│ │  └────────────────────────────────┘    │ │
│ └─────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────┐ │
│ │ 📱 Tablet Andi                   ⋮     │ │
│ │   Android · 🔵 Perlu Setup             │ │
│ │  ┌────────────────────────────────┐    │ │
│ │  │ ⚙️ Petunjuk Konfigurasi      │    │ │
│ │  └────────────────────────────────┘    │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ (Empty state jika belum ada device)         │
└─────────────────────────────────────────────┘
```

### 6.2 State & Data Fetching

```tsx
function Devices() {
  const [devices, setDevices] = useState<DeviceDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [setupModalOpen, setSetupModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<DeviceDetail | null>(null);

  // fetchDevices() on mount
  // openSetupModal() → SetupDeviceModal
  // openEditModal(device) → EditDeviceModal
  // handleDelete(device) → confirm → deleteDevice()
}
```

### 6.3 Device Card

```
┌─────────────────────────────────────────────┐
│ [icon] [name]                        [⋮]   │
│   [type] · [status badge]                   │
│  [Petunjuk Konfigurasi button]              │
└─────────────────────────────────────────────┘
```

**Status badge:**
- `last_seen === null` → `text-[#005bbf]` "🔵 Perlu Setup"
- `is_online === true` → `text-[#1b6d24]` "🟢 Online"
- else → `text-[#727785]` "⚪ Luring"

**Petunjuk Konfigurasi button:**
- `last_seen === null`: `bg-[#005bbf] text-white` (primary, filled)
- else: `text-[#005bbf] border border-[#005bbf]` (outline, subtle)

**⋮ menu (Dropdown):**
- Edit Nama → buka EditDeviceModal
- Hapus → confirm dialog → DELETE /api/v1/devices/{id}

### 6.4 Empty State

Jika `devices.length === 0`:
```
[icon DeviceIcon]
Belum ada perangkat
Tambahkan perangkat untuk mulai memantau aktivitas internet anak.
[Tambah Perangkat]
```

### 6.5 Loading & Error

- Loading: spinner `Loading` component
- Error: `InlineError` component dengan retry

---

## 7. Complete UX Flow

```
── First time user ──
Devices page (empty) → klik [+ Tambah] → modal Step 1
  → isi nama + pilih Android → [Buat Perangkat]
  → loading → sukses → modal Step 2 (Android instructions)
  → ikuti instruksi di device Android
  → [Tutup] → kembali ke list
  → device muncul, badge "🔵 Perlu Setup", button primary
  → (nanti setelah DNS query pertama) badge berubah "🟢 Online"

── Re-setup / lihat konfigurasi ──
Devices page → klik "⚙️ Petunjuk Konfigurasi"
  → GET /api/v1/devices/{id} → modal Step 2 langsung
  → salin hostname / URL / download iOS profile

── Edit nama ──
Devices page → ⋮ → Edit Nama
  → modal EditDevice → ubah nama → [Simpan]
  → PUT /api/v1/devices/{id} → list refresh

── Hapus device ──
Devices page → ⋮ → Hapus
  → confirm "Hapus [name]? Perangkat akan berhenti diproteksi."
  → [Hapus] / [Batal]
  → DELETE /api/v1/devices/{id} → list refresh
```

---

## 8. Edge Cases & Handling

| Skenario | Handling |
|----------|----------|
| Create loading, user klik luar modal | Modal tidak bisa di-close saat loading (disable overlay click + X button) |
| Create sukses, user tutup modal | Badge "🔵 Perlu Setup" muncul. Instruksi bisa dibuka kapan saja via button |
| Device sudah aktif, anak ubah DNS | Parent buka "Petunjuk Konfigurasi" → lihat instruksi lagi |
| Device dibuat via dashboard AdGuard | Muncul di list tanpa perlu setup flag. Button "Petunjuk" tetap ada |
| Device dihapus dari dashboard AdGuard | Hilang dari list (fresh dari API). Tidak ada stale data |
| Rename via dashboard AdGuard | Nama berubah otomatis di list (fresh dari API) |
| Download iOS profile gagal | Inline error di modal, tombol retry |
| Rate limit (429) | Error "Terlalu banyak permintaan" ditampilkan inline |
| Device limit reached | Error spesifik dari AdGuard, inline di modal |
| Token expire saat create | Axios interceptor → redirect login (existing handler) |
| API key revoked saat create | Axios interceptor → redirect /setup-api-key (existing handler) |
| Submit double-click | Button disabled + spinner saat loading |
| Nama > 64 chars | Validasi frontend + backend (maxLength) |
| Device type tidak valid | Validasi `in:ANDROID,IOS,WINDOWS` |
| Klik ⋮ menu → klik luar | Dropdown close otomatis |
| Hapus device → konfirmasi → batal | Tidak ada perubahan |
| Multiple browser tabs | Semua dari API, konsisten |
| Clear browser data | Tidak masalah — semua data dari API, tracking zero |

---

## 9. Implementation Order

| Urutan | Task | File |
|--------|------|------|
| 1 | AdGuardService — new methods | `app/Services/AdGuardService.php` |
| 2 | DeviceController | `app/Http/Controllers/Api/DeviceController.php` |
| 3 | Routes | `routes/api.php` |
| 4 | PHPUnit tests | `tests/Feature/DeviceTest.php` |
| 5 | Type definitions | `resources/js/app/types/device.ts` |
| 6 | API service | `resources/js/app/services/api/devices.ts` |
| 7 | Modal shared component | `resources/js/app/components/shared/Modal.tsx` |
| 8 | Platform icons (Android/Apple/Windows) | `resources/js/app/components/shared/icons.tsx` |
| 9 | CreateDeviceForm | `.../features/devices/CreateDeviceForm.tsx` |
| 10 | AndroidSetupInstructions | `.../features/devices/AndroidSetupInstructions.tsx` |
| 11 | IosSetupInstructions | `.../features/devices/IosSetupInstructions.tsx` |
| 12 | WindowsSetupInstructions | `.../features/devices/WindowsSetupInstructions.tsx` |
| 13 | EditDeviceModal | `.../features/devices/EditDeviceModal.tsx` |
| 14 | SetupDeviceModal (orchestrator) | `.../features/devices/SetupDeviceModal.tsx` |
| 15 | Devices page rewrite | `resources/js/pages/Devices.tsx` |
| 16 | Vitest tests | `resources/js/__tests__/` |
| 17 | Build verification | `npm run build` |

---

## 10. File Manifest

### Backend (new/modified)

| # | File | Status |
|---|------|--------|
| 1 | `app/Services/AdGuardService.php` | **Modify** — add 6 methods |
| 2 | `app/Http/Controllers/Api/DeviceController.php` | **New** |
| 3 | `routes/api.php` | **Modify** — add 6 routes |

### Frontend (new/modified)

| # | File | Status |
|---|------|--------|
| 1 | `resources/js/app/types/device.ts` | **New** |
| 2 | `resources/js/app/services/api/devices.ts` | **New** |
| 3 | `resources/js/app/components/shared/Modal.tsx` | **New** |
| 4 | `resources/js/app/components/shared/icons.tsx` | **Modify** — +3 icons |
| 5 | `resources/js/app/components/features/devices/SetupDeviceModal.tsx` | **New** |
| 6 | `resources/js/app/components/features/devices/CreateDeviceForm.tsx` | **New** |
| 7 | `resources/js/app/components/features/devices/AndroidSetupInstructions.tsx` | **New** |
| 8 | `resources/js/app/components/features/devices/IosSetupInstructions.tsx` | **New** |
| 9 | `resources/js/app/components/features/devices/WindowsSetupInstructions.tsx` | **New** |
| 10 | `resources/js/app/components/features/devices/EditDeviceModal.tsx` | **New** |
| 11 | `resources/js/pages/Devices.tsx` | **Rewrite** |

---