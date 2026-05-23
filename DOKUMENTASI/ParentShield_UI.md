# ParentShield — UI Implementation Guide
> Dihasilkan dari analisis langsung Figma file `35FobcDWzMONYV3MXzBvBd`  
> Stack target: **React + TypeScript + Tailwind CSS**

---

## 0. Temuan Kritis dari Figma (Baca Dulu)

Sebelum implementasi, ada beberapa masalah yang ditemukan langsung di file Figma:

| # | Masalah | Frame | Dampak |
|---|---------|-------|--------|
| 🔴 | Frame iOS salah nama — `2032:54` bernama **"ParentShield AddDevice Android"** tapi isinya **"Tambah Perangkat IOS"** | AddDevice iOS | Developer bisa salah implementasi |
| 🔴 | Instruksi Windows AddDevice **masih copy-paste instruksi Android** (Settings > Network & Internet > Private DNS) | AddDevice Windows | Flow salah total untuk Windows |
| 🔴 | **Tidak ada komponen popup "Add Device"** di Figma sama sekali, padahal ParentShield.md mewajibkannya muncul di semua halaman | — | Harus buat dari nol |
| 🟡 | iOS AddDevice menampilkan alur **Private DNS** padahal seharusnya **download `.mobileconfig`** via `GET /devices/{id}/doh.mobileconfig` | AddDevice iOS | Flow iOS berbeda signifikan dari Android |
| 🟡 | Semua sidebar di Figma menampilkan **"Perangkat Dilindungi" sebagai active state** — harus dibuat dinamis per route | Semua halaman sidebar | Jika hardcoded akan bug navigasi |
| 🟡 | **Tidak ada halaman detail device** — Device card punya tombol "Kelola" tapi tidak ada halaman tujuannya | Devices | Perlu klarifikasi atau buat sendiri |
| 🟡 | **Tidak ada desain state error/loading/empty** di halaman mana pun | Semua halaman | Harus didesain dan diimplementasi sendiri |

---

## 1. Design Tokens

Ekstrak langsung dari kode Figma. Buat file `src/styles/tokens.ts` atau gunakan sebagai Tailwind config.

### 1.1 Warna

```ts
// src/styles/tokens.ts
export const colors = {
  // Brand
  primary:        '#005bbf',   // Blue utama — tombol, link, active state
  primaryLight:   'rgba(26, 115, 232, 0.1)', // Background active nav item

  // Background
  bgPage:         '#f7f9ff',   // Background halaman utama
  bgSidebar:      '#f1f4fa',   // Background sidebar
  bgCard:         '#ffffff',   // Background kartu
  bgCardInner:    '#f7f9ff',   // Background toggle row dalam card
  bgTag:          '#ebeef4',   // Background pill/badge netral

  // Text
  textPrimary:    '#181c20',   // Judul, angka
  textSecondary:  '#414754',   // Subtitle, label, body
  textMuted:      '#414754',   // Sama dengan secondary, opacity bisa ditambah

  // Status
  success:        '#1b6d24',   // Online, aktif, toggle ON
  successBadge:   '#a0f399',   // Background badge "+5%"
  danger:         '#ba1a1a',   // Diblokir, angka merah
  dangerLight:    '#ffb3ac',   // Progress bar danger muted
  dangerBar:      '#dd3635',   // Progress bar danger medium

  // Border & Divider
  border:         'rgba(193, 198, 214, 0.2)',  // Border kartu
  borderInner:    'rgba(193, 198, 214, 0.3)',  // Border divider dalam kartu
  borderToggle:   'rgba(193, 198, 214, 0.1)',  // Border toggle row

  // Interaktif
  inactiveToggle: '#dfe3e8',   // Toggle OFF background
  inactiveDot:    '#dfe3e8',   // Dot status offline

  // Chart
  chartPrimary:   '#005bbf',   // Bar chart — peak
  chartBar:       {
    opacity20: 'rgba(0, 91, 191, 0.2)',
    opacity30: 'rgba(0, 91, 191, 0.3)',
    opacity40: 'rgba(0, 91, 191, 0.4)',
    opacity50: 'rgba(0, 91, 191, 0.5)',
    opacity60: 'rgba(0, 91, 191, 0.6)',
    opacity80: 'rgba(0, 91, 191, 0.8)',
    opacity90: 'rgba(0, 91, 191, 0.9)',
  },
  chartBarBg:     '#ebeef4',   // Background track progress bar
  chartBlue:      '#adc7ff',   // Progress bar warna sekunder
};
```

### 1.2 Tipografi

Dua font family digunakan: **Roboto** (UI utama) dan **Liberation Serif** (brand name + subtitle sidebar).

```ts
export const typography = {
  // Brand
  brand: {
    name:    { font: 'Liberation Serif', weight: 700, size: 24, lineHeight: 32 },
    tagline: { font: 'Liberation Serif', weight: 400, size: 12, lineHeight: 16 },
  },

  // Headings (Roboto)
  h1: { weight: 700, size: 32, lineHeight: 40, letterSpacing: '-0.5px' }, // Welcome msg
  h2: { weight: 700, size: 32, lineHeight: 40 },                          // Page title
  h3: { weight: 500, size: 20, lineHeight: 28 },                          // Section title
  h4: { weight: 700, size: 20, lineHeight: 28 },                          // Card heading
  h5: { weight: 700, size: 18, lineHeight: 28 },                          // Modal title

  // Body (Roboto)
  bodyLg:  { weight: 400, size: 18, lineHeight: 28 },                     // Subtitle welcome
  body:    { weight: 500, size: 14, lineHeight: 20, letterSpacing: '0.5px' }, // Default
  bodyMd:  { weight: 400, size: 14, lineHeight: 24 },                     // Paragraf biasa
  caption: { weight: 500, size: 12, lineHeight: 16 },                     // Label kecil
  code:    { weight: 400, size: 14, lineHeight: 24 },                     // DNS URL copy box
};
```

### 1.3 Dimensi Layout

```ts
export const layout = {
  sidebarWidth:   256,   // px
  mainContent:    1024,  // px (1280 - 256)
  pageWidth:      1280,  // px
  pagePadding:    24,    // px — padding konten utama
  cardRadius:     12,    // px — border radius kartu
  cardRadiusSm:   8,     // px — border radius item dalam kartu
  cardPadding:    13,    // px
  cardPaddingLg:  24,    // px — section cards besar
  cardShadow:     '0px 1px 1px rgba(0, 0, 0, 0.05)',
  cardBorder:     '1px solid rgba(193, 198, 214, 0.2)',
};
```

---

## 2. Komponen Shared

### 2.1 SideNavBar
**Node ID:** `2024:125` (instance di Settings), shared di semua halaman authenticated.

**Struktur:**
```
SideNavBar (w-256, h-1024, bg-[#f1f4fa])
├── Brand Section (px-24, py-24)
│   ├── Logo Circle (40x40, bg-primary, rounded-full)
│   │   └── Shield Icon (16x20, white)
│   └── Brand Text
│       ├── "ParentShield" (Liberation Serif Bold 24px, color-primary)
│       └── "Dashboard Keluarga" (Liberation Serif 12px, color-textSecondary)
├── Nav List (px-16, gap-8)
│   ├── Nav Item — Inactive State (px-16 py-12, rounded-8, hover)
│   │   ├── Icon (18x18)
│   │   └── Label (Roboto 14px, tracking-0.5, color-textSecondary)
│   ├── Nav Item — Active State
│   │   ├── bg-primaryLight, border-r-4 border-primary, rounded-8
│   │   ├── Icon (20x16)
│   │   └── Label (Roboto 14px, color-primary)
│   └── ... (ulangi untuk setiap item)
└── Logout (px-16, absolute bottom, py-12)
    ├── Icon (18x18)
    └── "Keluar" (Roboto 14px, color-textSecondary)
```

**Nav Items (urutan tetap):**
| Label | Route | Icon |
|-------|-------|------|
| Halaman Utama | `/dashboard` | home icon |
| Aktivitas Lengkap | `/activity` | activity icon |
| Perangkat Dilindungi | `/devices` | device icon |
| Pengaturan Akun | `/settings` | settings icon |

**Implementasi penting:**
- Active state ditentukan dari `useLocation()` / `router.pathname`, **bukan hardcoded**
- Sidebar ini adalah satu komponen `<SideNavBar />` yang dipakai di semua halaman authenticated
- Shadow sidebar: `box-shadow: 0px 4px 6px -1px rgba(0,0,0,0.1), 0px 2px 4px -2px rgba(0,0,0,0.1)`

---

## 3. Halaman Per Halaman

### 3.1 Login
**Node ID:** `2014:246` | **Route:** `/login`  
**Layout:** Fullscreen, tidak ada sidebar. Card centered 440px × 545px.

**Struktur card:**
```
LoginCard (w-440, centered, bg-white, rounded-12, shadow)
├── Brand Header (py-24 px-24)
│   ├── Brand Identity (Logo + "ParentShield")
│   ├── "Masuk" (Roboto Bold 24px, centered)
│   └── Subtitle (Roboto 14px, centered, color-textSecondary)
├── Form (px-24 pb-16, gap-24)
│   ├── Email Input
│   │   ├── Label: "Alamat Email"
│   │   └── Input (h-48, placeholder: "Masukkan email Anda")
│   ├── Password Input
│   │   ├── Label: "Kata Sandi" + Link "Lupa kata sandi?" (right-aligned)
│   │   ├── Input (h-48, placeholder: "Masukkan kata sandi Anda")
│   │   └── Toggle show/hide password (icon eye, 22x15)
│   └── Submit Button (w-full, h-48, bg-primary, "Masuk")
└── Footer Link (py-8, centered)
    └── "Belum memiliki akun?" + Link "Buat Akun" → /register
```

**Footer halaman** (bawah page, bukan card): copyright text + 3 link (Privacy, Terms, Contact).

---

### 3.2 Register
**Node ID:** `2014:282` | **Route:** `/register`  
**Layout:** Fullscreen, card 440px × 805px (lebih tinggi dari login).

**Struktur card:**
```
RegisterCard (w-440)
├── Brand Header
│   ├── Brand Identity
│   ├── "Buat Akun Baru" (Bold 24px, centered)
│   └── Subtitle (2 baris, centered)
├── Form (gap-24)
│   ├── Nama Lengkap Input
│   │   ├── Label: "Nama Lengkap"
│   │   ├── Input (h-50, ada icon user di kiri)
│   │   └── Placeholder: "Anonim"
│   ├── Email Input
│   │   ├── Label: "Alamat Email"
│   │   ├── Input (h-50, ada icon email di kiri)
│   │   └── Placeholder: "anonim@family.com"
│   ├── Password Input
│   │   ├── Label: "Kata Sandi"
│   │   ├── Input (h-50, icon kunci di kiri, toggle visibility di kanan)
│   │   ├── Placeholder: "••••••••"
│   │   └── Helper text: "Minimal terdiri dari 8 karakter."
│   ├── Konfirmasi Password Input
│   │   ├── Label: "Konfirmasi Kata Sandi"
│   │   ├── Input (h-50, icon kunci di kiri, toggle visibility di kanan)
│   │   └── Placeholder: "••••••••"
│   └── Submit Button (w-full, h-44, "Buat Akun" + arrow icon)
└── Footer Link
    └── "Sudah memiliki akun?" + Link "Masuk" → /login
```

---

### 3.3 Forgot Password
**Node ID:** `2014:357` | **Route:** `/forgot-password`  
**Layout:** Fullscreen, card 440px × 498px.

**Struktur card:**
```
ForgotPasswordCard (w-440)
├── Brand Identity (logo centered)
├── "Atur Ulang Kata Sandi" (Bold 32px, centered)
├── Deskripsi (2 baris, centered)
├── Form
│   ├── Email Input (h-50, icon email di kiri)
│   └── Button "Kirim tautan" (w-full, h-44) + arrow icon
└── Back Link
    └── ← "Kembali ke login" (centered, color-primary)
```

---

### 3.4 Setup API Key
**Node ID:** `2034:98` | **Route:** `/setup-api-key`  
**Layout:** Fullscreen, card 448px × 592px. **Tidak ada sidebar.**

**Struktur card:**
```
APIKeyCard (w-448, centered)
├── Brand Identity (logo centered)
├── Stepper indicator (minimal — 1 titik, horizontal line, di tengah)
├── "Masukkan Kunci API" (Bold 32px, centered)
├── Deskripsi (3 baris — jelaskan tujuan API Key, centered)
├── Form
│   ├── Label: "Kunci API"
│   ├── Input (h-50, icon key di kiri, placeholder: "ag_...")
│   └── Button "Simpan & Lanjutkan" (w-full, h-48) + arrow icon
└── Help Link (centered)
    └── "Di mana menemukan API KEY?" (color-primary, font-size-14)
```

---

### 3.5 Dashboard
**Node ID:** `2002:396` | **Route:** `/dashboard`

**Layout:** Sidebar (256px) + Main Content (1024px, bg-bgPage).

**Main Content — 4 section vertikal:**

**Section 1 — Welcome Header:**
```
Header (w-full, pb-3.5)
├── "Selamat Pagi, {nama}." (Roboto Bold 32px, tracking -0.5)
└── Row (gap-8)
    ├── Shield Icon (16x20)
    └── "Lindungi Keluargamu dari Bahaya Internet." (Roboto 18px, color-textSecondary)
```

**Section 2 — Stat Cards (3 kolom):**
```
Grid (3 cols, gap-16)
├── Card: Permintaan Total
│   ├── Row: [Icon background] [Badge "+5%" (bg-successBadge, rounded-full)]
│   ├── Label: "Permintaan Total" (Roboto Medium 14px, tracking 0.5)
│   └── Value: "12,450" (Roboto Bold 24px)
│
├── Card: Berhasil Diblokir
│   ├── Row: [Shield/Block Icon background]
│   ├── Label: "Berhasil Diblokir"
│   └── Value: "142" (Roboto Bold 24px, color-danger) + "Adware, Phishing, Malware" (12px)
│
└── Card: Device Aktif
    ├── Row: [Device Icon background] [Dot animasi hijau (ping)]
    ├── Label: "Device Aktif"
    └── Value: "3" (Roboto Bold 24px, color-success) + nama device list (12px, truncated)
```

**Section 3 — Bento Grid (2 kolom kiri + 1 kolom kanan):**

*Kolom Kiri (col-span-2, gap-24):*
```
Card: Aktivitas Harian (h-300)
├── Header row: "Aktivitas Harian" + Badge "Last 24 Hours"
└── Bar Chart Area
    ├── Y-Axis: Tinggi | Sedang | Rendah (opacity-50)
    └── 11 bar vertikal (opacity berbeda-beda, bar paling tinggi = primary color penuh)
        — Implementasi: gunakan library recharts atau custom div-based bars

Card: Aktivitas Terbanyak + Kategori Diblokir (2 kolom sejajar, h-199)
├── Card kiri: "Aktivitas Terbanyak"
│   └── 3 horizontal progress bar (YouTube 40%, Roblox 30%, TikTok 20%)
│       — data dari GET /stats/categories
└── Card kanan: "Kategori Diblokir"
    └── 3 horizontal progress bar dengan color-danger
        (Konten Dewasa 40%, Iklan 30%, Aplikasi Berbahaya 30%)
```

*Kolom Kanan (col-span-1, gap-24):*
```
Card: Proteksi Global
├── Header: icon + "Proteksi Global"
└── 3 Toggle Row (bg-bgCardInner, rounded-8, p-13, gap-16)
    ├── Toggle 1: "Filter Pencarian Aman" / "Terapkan Pencarian Aman" → ON (hijau)
    │   — API: safebrowsing_settings (belum ada SafeSearch langsung di Spec, klarifikasi)
    ├── Toggle 2: "Tingkatkan Keamanan" / "Blokir Halaman Berbahaya" → ON
    │   — API: safebrowsing_settings.enabled + block_dangerous_domains
    └── Toggle 3: "Blokir Website Baru" / "Jangan Percaya Website Baru" → OFF
        — API: safebrowsing_settings.block_nrd

Card: Device Anak
├── Header row: "Device Anak" + Link "Lihat Semua" → /devices
└── List (gap-0, divider antar item)
    └── Item (py-12)
        ├── [Device Icon] [Nama] [Dot status] — online: #1b6d24, offline: #dfe3e8
        ├── Status text (12px)
        └── Chevron → (navigasi ke detail device — halaman belum ada di Figma)
```

> ⚠️ **Toggle 1 "Filter Pencarian Aman"** tidak memiliki mapping AdGuard API yang jelas di Spec. Perlu dikonfirmasi — kemungkinan ini punya endpoint tersendiri yang belum didokumentasikan, atau perlu mapping ke parameter lain.

---

### 3.6 Activity History
**Node ID:** `2002:184` | **Route:** `/activity`

**Layout:** Sidebar + Main Content. Dibagi 2 kolom horizontal.

**Struktur:**
```
Main Content
├── Header: "Riwayat Aktivitas" + subtitle
└── Layout (2 kolom, gap-24)
    │
    ├── Kolom Kiri — Activity Feed (w-632)
    │   ├── Filter Bar (3 input sejajar)
    │   │   ├── Search Input (w-214, placeholder: "Contoh: YouTube...", icon search)
    │   │   ├── Dropdown Status (w-160, "Semua Status", icon chevron)
    │   │   └── Dropdown Device (w-192, "Semua Perangkat", icon chevron)
    │   │
    │   ├── Date Group Header: "Hari Ini" (bold, 20px)
    │   │
    │   ├── Activity Card (h-86, per item)
    │   │   ├── Left accent bar (w-4, h-84, warna sesuai status)
    │   │   │   — Diblokir: color-danger (#ba1a1a)
    │   │   │   — Diizinkan: color-success (#1b6d24)
    │   │   ├── Device Icon (48x48, rounded, bg tinted)
    │   │   ├── Content
    │   │   │   ├── Domain name (Roboto Bold 20px) — "Roblox", "Ruangguru.com"
    │   │   │   ├── Status badge (small pill: "BLOKIR" / "IZINKAN")
    │   │   │   └── Device label (12px)
    │   │   └── Right
    │   │       ├── Timestamp (14px, color-textSecondary)
    │   │       └── Status pill (rounded, dengan icon + label "Diblokir"/"Diizinkan")
    │   │
    │   └── "Muat Lebih Banyak" Button + chevron down
    │       — ⚠️ Ini harus berbasis cursor pagination, BUKAN page/offset
    │
    └── Kolom Kanan — Insights Sidebar (w-320)
        Card (bg-white, rounded-12, h-456)
        ├── "📊 Ringkasan" (h2, 28px)
        ├── Insight 1: "PALING BANYAK DIBLOKIR"
        │   └── 2 item dengan icon + nama domain + count (bold)
        ├── Insight 2: "ANCAMAN DICEGAH"
        │   └── Count besar + deskripsi
        └── Button "Lihat Seluruh Laporan" (w-full, h-36, outlined)
```

---

### 3.7 Devices
**Node ID:** `2002:2` | **Route:** `/devices`

**Layout:** Sidebar + Main Content.

**Struktur:**
```
Main Content
├── Header: "Perangkat Anak" + subtitle
│
├── Device Limit Banner (h-106, bg-white, border, rounded-12)
│   ├── Left: Icon + Heading "X dari 5 Slot Terpakai" + subtitle
│   └── Right: Button "Premium Belum Tersedia" (disabled/grey)
│       — ⚠️ Banner ini harus dinamis: tampilkan sisa slot dari GET /account/limits
│
└── Devices Grid (3 kolom, gap-24)
    ├── Active Device Card (h-312, rounded-12, bg-white, border, shadow)
    │   ├── Header (py-25 px-25)
    │   │   ├── Left: [Device Icon 48x48] [Nama] [Dot status]
    │   │   └── (no right element)
    │   ├── Stats Section
    │   │   ├── Row: "Perlindungan" + status badge (ON/OFF)
    │   │   ├── Row: "Blokir Bahaya" + status text ("Aktif"/"Nonaktif")
    │   │   └── "Terakhir aktif: Sekarang" (12px, color-textSecondary)
    │   │       — ⚠️ Data ini harus diambil dari query log terakhir per device
    │   └── Actions Row
    │       ├── Button "Kelola" (primary outlined, w-199, h-36)
    │       └── Button Delete (icon trash, w-48, h-30, color-danger outlined)
    │
    └── Empty Slot Card (dashed border, cursor-pointer)
        ├── Plus icon (rounded bg, 64x64)
        ├── "Tambah Perangkat" (bold)
        └── "Klik untuk menambah" (caption)
        — onClick → buka modal AddDevice (pilih platform)
```

**Device Icons per tipe:**
- Android: icon berbentuk robot/android (15x22)
- iOS/iPad: icon berbentuk tablet (18x22)
- Windows: icon berbentuk laptop (24x17)

---

### 3.8 Settings
**Node ID:** `2008:2` | **Route:** `/settings`

**Layout:** Sidebar + Main Content. Main dibagi 2 kolom.

**Struktur:**
```
Main Content
├── Header: "Pengaturan" + subtitle "Kelola Profil, Sandi, dan API KEY Adguard."
│
└── Settings Grid (2 kolom: 517px | 365px)
    │
    ├── Kolom Kiri (gap-24)
    │   ├── Card: Profil Pengguna (h-376)
    │   │   ├── Section header: [icon] "Profil Pengguna"
    │   │   ├── Subtitle: "Kelola informasi dasar akun..."
    │   │   └── Form
    │   │       ├── Input: "Nama Lengkap" (h-52)
    │   │       ├── Input: "Email" (h-52)
    │   │       └── Button "Simpan Perubahan" (w-174, h-44, primary)
    │   │
    │   └── Card: Keamanan (h-400)
    │       ├── Section header: [icon] "Keamanan"
    │       ├── Subtitle: "Pastikan akun Anda tetap aman..."
    │       └── Form
    │           ├── Input: "Kata Sandi Saat Ini" (h-52, type password)
    │           ├── Row (2 kolom):
    │           │   ├── Input: "Kata Sandi Baru" (h-52, placeholder "Minimal 8 karakter")
    │           │   └── Input: "Konfirmasi Kata Sandi Baru" (h-52)
    │           └── Button "Perbarui Kata Sandi" (w-181, h-44, primary)
    │
    └── Kolom Kanan (w-365)
        Card: Integrasi AdGuard (h-800, full height)
        ├── Section header: [icon] "Integrasi AdGuard"
        ├── Info Banner (bg dengan server infrastructure image, rounded-8)
        │   └── Text penjelasan integrasi AdGuard DNS
        ├── Form
        │   ├── Label: "API Key AdGuard"
        │   ├── Input (h-48, placeholder "Contoh: ag_82k1...m39")
        │   │   └── Icon visibility toggle di kanan input
        │   └── Helper text (14px, color-textSecondary)
        ├── Actions
        │   ├── Button Primary "Verifikasi & Simpan" (w-full, h-52)
        │   └── Button Text "Hapus API Key" (w-full, h-48, color-danger)
        └── Status indicator (bottom)
            ├── Dot status (merah/hijau)
            └── "Terhubung" / "Tidak Terhubung"
```

---

### 3.9 AddDevice Modal
**Tiga varian:** Android (`2027:2`), Windows (`2032:10`), iOS (`2032:54`)

**Layout:** Overlay modal, card 672px × 570px, centered di atas halaman `/devices`.

```
Modal Card (w-672, rounded-12, bg-white, shadow-xl)
├── Body (p-40)
│   ├── Title: "Tambah Perangkat {Platform}" (Roboto Bold 32px)
│   ├── Deskripsi (16px, color-textSecondary, 2-3 baris)
│   └── Instructions List (gap-28)
│       ├── Step 1 (numbered circle 32x32, border, text kiri)
│       ├── Step 2 (numbered circle + instruction text)
│       └── Step 3 (numbered circle + instruction + Copy Box)
│           Copy Box (bg-[#1e2124], rounded-8, h-58)
│           ├── DNS URL (monospace, color-white/light, kiri)
│           └── Button "Salin" (icon copy + label, kanan)
│
└── Footer Actions (px-40 py-24, border-t)
    ├── Left: Status indicator
    │   ├── "Belum Terkoneksi" / "Terkoneksi" (Roboto Bold 20px)
    │   └── Dot merah/hijau (rounded, 8x8)
    ├── Button "Batal" (w-83, h-40, outlined)
    └── Button "Konfirmasi" (w-140, h-40, primary, icon shield)
```

**Instruksi per platform yang BENAR** (bukan yang ada di Figma):

**Android:**
1. Masuk ke Settings → Network & Internet → Private DNS
2. Pilih "Private DNS provider hostname"
3. Masukkan: `{dns_server_id}.dns.adguard-dns.com` (dari API)

**Windows** *(harus diperbaiki dari Figma — instruksi saat ini salah)*:
1. Buka Settings → Network & Internet → WiFi/Ethernet → Edit DNS
2. Ubah DNS ke mode Manual
3. Masukkan DNS over HTTPS URL: `{doh_url}`

**iOS** *(berbeda dari Android — perlu download profile)*:
1. Download profil konfigurasi DNS dari tombol di bawah
2. Buka Settings → Profile Downloaded → Install
3. Konfirmasi instalasi profile

> ⚠️ iOS perlu tombol **"Download Profil (.mobileconfig)"** yang memanggil `GET /devices/{id}/doh.mobileconfig` dari Laravel. Komponen ini **tidak ada di Figma** dan harus ditambahkan.

---

## 4. Popup "Tambah Device" (Tidak Ada di Figma)

Berdasarkan ParentShield.md B.2, popup ini wajib muncul di **semua halaman** sampai user berhasil menambahkan minimal 1 device.

Desain harus dibuat sendiri dengan mengikuti design tokens yang ada:

```
Popup Banner (fixed bottom-right atau top-center, z-50)
Contoh struktur:
├── Icon peringatan
├── "Belum ada perangkat yang terdaftar"
├── Subtitle: "Tambahkan perangkat anak untuk mulai memantau."
└── Button "Tambah Sekarang" → /devices (buka modal)
```

Logika:
- Cek dari state global: `devices.length === 0`
- Simpan di `localStorage` / context apakah sudah dismiss sementara
- Tetap muncul setelah reload selama device belum ada

---

## 5. State Management & Error States

Tidak ada di Figma, harus diimplementasikan sendiri. Panduan per halaman:

### States yang wajib ada di setiap form/action:

```
Loading State:    Tombol disabled + spinner + "Memproses..."
Success State:    Toast / inline green message (use color-success)
Error State:      Inline red message di bawah input / toast (use color-danger)
Empty State:      Ilustrasi + teks panduan (mis. grid device kosong)
```

### State kritis per fitur:

| Fitur | States |
|-------|--------|
| Login | loading, error-credentials, error-network |
| Register | loading, error-email-taken, error-password-mismatch |
| API Key Setup | loading, success-verified, error-invalid-key, error-network |
| AddDevice | polling-status ("Menunggu koneksi..."), success-connected, error-timeout, error-rollback |
| Toggle Proteksi | optimistic-update, error-revert |
| Load More Activity | loading-more, no-more-data |

---

## 6. Routing & Auth Guard

```
/ → redirect ke /login (jika belum login) atau /dashboard (jika sudah login)

PUBLIC (tanpa auth):
  /login
  /register
  /forgot-password

SEMI-PUBLIC (butuh auth tapi tidak perlu API key):
  /setup-api-key        ← redirect kesini jika API key kosong/invalid

PROTECTED (butuh auth + API key valid):
  /dashboard
  /activity
  /devices
  /settings
```

**Guard logic (urutan pengecekan):**
1. Tidak login → `/login`
2. Login tapi API key kosong/invalid → `/setup-api-key`
3. Login + API key valid + belum ada device → Halaman tujuan + popup addDevice overlay
4. Semua OK → Halaman tujuan normal

---

## 7. Catatan Implementasi Teknis

### 7.1 Bar Chart Dashboard
Figma menggunakan div statis sebagai simulasi. Untuk implementasi nyata:
- Gunakan `recharts` (sudah tersedia di environment)
- Data dari: `GET /stats/time` → format ke 24 bar per jam
- Y-axis label: Tinggi / Sedang / Rendah (bukan angka) — sesuai desain

### 7.2 Horizontal Progress Bars
Gunakan div biasa dengan `width` dinamis, bukan library chart:
```tsx
<div className="bg-[#ebeef4] h-2 rounded-full w-full">
  <div className="bg-primary h-2 rounded-full" style={{ width: `${percent}%` }} />
</div>
```

### 7.3 Copy Box DNS URL
Gunakan `navigator.clipboard.writeText()`, dengan feedback "Tersalin!" sementara selama 2 detik.

### 7.4 Toggle Proteksi Global
Gunakan **optimistic update**: update UI langsung, rollback jika API gagal. Ini menghindari lag terasa saat parent mengklik toggle.

### 7.5 Cursor Pagination (Activity History)
```ts
// SALAH — jangan pakai ini:
GET /query_log?page=2&per_page=10

// BENAR — sesuai Spec:
GET /query_log?cursor={cursor_dari_response_sebelumnya}&time_from_millis=...&time_to_millis=...
```
Tombol "Muat Lebih Banyak" harus menyimpan `cursor` dari response terakhir.

### 7.6 BigInt di Activity Log
```ts
// Install: npm install json-bigint
import JSONbig from 'json-bigint';

const data = JSONbig.parse(responseText); // Aman untuk BigInt ID
```
Atau handle di sisi Laravel dengan stringify ID sebelum dikirim ke React.

### 7.7 Device "Terakhir Aktif"
Tidak ada endpoint langsung. Implementasi di Laravel:
1. Hit `GET /query_log` per `device_id` dengan limit 1, sorted by time desc
2. Return `last_seen` timestamp ke React
3. React format: "Sekarang", "2 jam yang lalu", dst. (gunakan `dayjs` atau `date-fns`)

---

## 8. Node ID Reference Map

| Halaman | Node ID Figma |
|---------|---------------|
| Dashboard | `2002:396` |
| Login | `2014:246` |
| Register | `2014:282` |
| Forgot Password | `2014:357` |
| Setup API Key | `2034:98` |
| Activity History | `2002:184` |
| Devices | `2002:2` |
| Settings | `2008:2` |
| AddDevice Android | `2027:2` |
| AddDevice Windows | `2032:10` |
| AddDevice iOS | `2032:54` ⚠️ mislabeled |
| SideNavBar (shared) | `2024:125` |

---

## 9. Ringkasan: Yang Harus Dibuat dari Nol (Tidak Ada di Figma)

| Komponen | Alasan |
|----------|--------|
| Popup "Tambah Device" overlay | Diwajibkan ParentShield.md, tidak ada di Figma |
| iOS AddDevice tombol download `.mobileconfig` | Mekanisme iOS berbeda, Figma salah |
| Windows AddDevice instruksi yang benar | Instruksi di Figma copy-paste dari Android |
| Loading/Spinner states | Tidak ada di Figma |
| Toast notification | Tidak ada di Figma |
| Error state per form | Tidak ada di Figma |
| Empty state grid devices | Tidak ada di Figma |
| Device detail/management page | Ada tombol "Kelola" tapi halaman tujuan tidak ada |
| Konfirmasi hapus device | Tidak ada di Figma |