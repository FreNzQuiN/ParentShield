# AdGuard API — Fitur Belum Dieksplorasi

Dokumen ini memetakan seluruh endpoint AdGuard DNS API terhadap implementasi ParentShield saat ini, lalu merekomendasikan fitur yang bisa dipertimbangkan ke depan berdasarkan nilai tambah dan effort estimasi.

---

## Ringkasan

| Status | Jumlah Endpoint |
|--------|----------------|
| **Sudah terpakai** | 16 |
| **Belum terpakai** | 14 |
| **Total AdGuard API** | 30 |

---

## A. Endpoint yang Sudah Terpakai

| Endpoint | Method | Ada di `AdGuardService` | Ada di Controller/Route |
|----------|--------|------------------------|-------------------------|
| `/account/limits` | GET | ✅ `getAccountLimits()` | ✅ Dashboard (pooled) |
| `/devices` | GET | ✅ `getDevices()` | ✅ DeviceController |
| `/devices` | POST | ✅ `createDevice()` | ✅ DeviceController |
| `/devices/{id}` | GET | ✅ `getDevice()` | ✅ DeviceController |
| `/devices/{id}` | PUT | ✅ `updateDevice()` | ✅ DeviceController |
| `/devices/{id}` | DELETE | ✅ `deleteDevice()` | ✅ DeviceController |
| `/devices/{id}/doh.mobileconfig` | GET | ✅ `getMobileConfigRaw()` | ✅ DeviceController |
| `/dns_servers` | GET | ✅ `getDnsServers()` | ✅ Dashboard, DeviceController |
| `/dns_servers/{id}` | GET | ✅ `getDnsServer()` | ✅ Internal (resolve settings) |
| `/dns_servers/{id}/settings` | PUT | ✅ `updateDnsServerSettings()` | ✅ DashboardController |
| `/query_log` | GET | ✅ `getQueryLog()` | ✅ LogController |
| `/stats/categories` | GET | ✅ `getCategoryStats()` | ✅ Dashboard (pooled) |
| `/stats/devices` | GET | ✅ `getDeviceStats()` | ✅ Dashboard (pooled) |
| `/stats/domains` | GET | ✅ `getDomainStats()` | ✅ Dashboard (via `getTopDomains`) |
| `/stats/time` | GET | ✅ `getTimeStats()` | ✅ Dashboard (pooled) |
| `/web_services` | GET | ✅ `getWebServices()` | ✅ DashboardController (listServices) |

---

## B. Endpoint Belum Terpakai

### B.1 Perangkat — Setting Individual

| Endpoint | Method | Ada di API AdGuard |
|----------|--------|--------------------|
| `PUT /devices/{id}/settings` | PUT | `DeviceSettingsUpdate` |
| `PUT /devices/{id}/doh_password/reset` | PUT | — |
| `GET /devices/{id}/dot.mobileconfig` | GET | — |
| `GET /devices/{id}/dedicated_addresses` | GET | `DedicatedIps` |
| `POST /devices/{id}/dedicated_addresses/ipv4` | POST | `LinkDedicatedIPv4` |
| `DELETE /devices/{id}/dedicated_addresses/ipv4` | DELETE | — |

### B.2 Filter Lists

| Endpoint | Method | Schema |
|----------|--------|--------|
| `GET /filter_lists` | GET | `FilterList[]` |

### B.3 Stats — Detail

| Endpoint | Method | Schema |
|----------|--------|--------|
| `GET /stats/companies` | GET | `CompanyQueriesStatsList` |
| `GET /stats/companies/detailed` | GET | `CompanyDetailedQueriesStatsList` |
| `GET /stats/countries` | GET | `CountryQueriesStatsList` |

### B.4 Query Log

| Endpoint | Method | Schema |
|----------|--------|--------|
| `DELETE /query_log` | DELETE | — |

### B.5 DNS Server — Manajemen

| Endpoint | Method | Schema |
|----------|--------|--------|
| `POST /dns_servers` | POST | `DNSServerCreate` |
| `PUT /dns_servers/{id}` | PUT | `DNSServerUpdate` |
| `DELETE /dns_servers/{id}` | DELETE | — |
| `PUT /dns_servers/{id}/settings` | PUT | `DNSServerSettingsUpdate` (✅ already used) |

### B.6 Dedicated IP

| Endpoint | Method | Schema |
|----------|--------|--------|
| `GET /dedicated_addresses/ipv4` | GET | `DedicatedIPv4Address[]` |
| `POST /dedicated_addresses/ipv4` | POST | — |
| `DELETE /dedicated_addresses/ipv4/{ip}` | DELETE | — |

---

## C. Prioritas Rekomendasi

### P1 — High Value, Low Effort

#### 1. Per-Device Settings (`PUT /devices/{id}/settings`)

**Apa:** Mengaktifkan/mematikan proteksi, filtering, parental control, dan safe search **per perangkat**, bukan global.

**Saat ini:** `updateSafebrowsing()` dan `updateParentalControl()` di `DashboardController` mengupdate setting di level DNS server — berlaku untuk semua device.

**Potensi:**
- Tambah toggle "Perangkat Ini Diproteksi" di halaman Devices (DeviceCard)
- Orang tua bisa nonaktifkan proteksi sementara untuk device tertentu (misal anak perlu akses situs diblokir untuk tugas sekolah)

**Effort:** Rendah. Sudah ada `AdGuardService::updateDevice()`, tinggal tambah method `updateDeviceSettings()`.

**Schema (`DeviceSettingsUpdate`):**
```json
{
  "protection_enabled": true,
  "filtering_enabled": true,
  "parental_enabled": true,
  "safe_search_enabled": true,
  "blocked_services": ["instagram", "tiktok"]
}
```

---

#### 2. DOT Mobileconfig (`GET /devices/{id}/dot.mobileconfig`)

**Apa:** Profil konfigurasi DNS-over-TLS untuk iOS (alternatif DoH).

**Saat ini:** Hanya DoH (`doh.mobileconfig`) yang diimplementasikan.

**Potensi:**
- Opsi tambahan di SetupDeviceModal → iOS → "Unduh profil DoT"
- Beberapa pengguna melaporkan DoT lebih stabil di jaringan tertentu

**Effort:** Sangat rendah. Copy-paste dari method `getMobileConfigRaw()`, ganti endpoint.

---

#### 3. Hapus Riwayat Aktivitas (`DELETE /query_log`)

**Apa:** Membersihkan seluruh log query AdGuard.

**Potensi:**
- Tombol "Hapus Riwayat" di halaman Activity atau Settings
- Butuh konfirmasi (irreversible)

**Effort:** Rendah. Satu method baru di `AdGuardService`, satu endpoint, satu tombol UI.

---

#### 4. Statistik Perusahaan & Negara (`GET /stats/companies`, `GET /stats/countries`)

**Apa:** Data tracker/ad network mana yang paling banyak diblokir, dan dari negara mana.

**Saat ini:** Hanya kategori yang ditampilkan (di dashboard).

**Potensi:**
- Tab "Pelacak" di halaman Activity — menampilkan perusahaan pelacak teratas
- Filter tambahan untuk log aktivitas (filter by company/country)

**Effort:** Rendah. Sama pattern dengan `getCategoryStats()`.

---

### P2 — Medium Value, Medium Effort

#### 5. Filter Lists (`GET /filter_lists`)

**Apa:** Mendapatkan daftar filter yang tersedia (AdGuard Base, Social, Annoyance, dll) beserta status enable/disable-nya.

**Potensi:**
- Halaman "Pengaturan Filter" baru
- User bisa mengaktifkan/menonaktifkan filter tertentu
- Misal: filter "Annoyances" opsional, tidak semua orang ingin memblokir cookie consent

**Effort:** Sedang. Butuh:
- Method baru di `AdGuardService`
- Endpoint baru untuk baca & update filter
- Halaman UI baru di Settings

---

#### 6. Reset DOH Password (`PUT /devices/{id}/doh_password/reset`)

**Apa:** Membuat password DoH baru untuk perangkat tertentu.

**Potensi:**
- Tombol "Reset Koneksi" di DeviceCard
- Berguna saat device tidak bisa terhubung karena password berubah

**Effort:** Rendah. API endpoint sederhana, UI tinggal satu tombol dengan konfirmasi.

---

### P3 — Niche / Premium

#### 7. Dedicated IP (`GET /dedicated_addresses/ipv4`)

**Apa:** IP khusus untuk koneksi DNS-over-HTTPS/DoT. Fitur **premium** AdGuard.

**Potensi:**
- Informasi di halaman Settings → "IP Khusus"
- Berguna untuk pengguna yang ingin akses DNS tanpa filter ISP

**Effort:** Rendah.

**Catatan:** Hanya relevan untuk akun AdGuard berbayar.

---

#### 8. Manajemen DNS Server (`POST /dns_servers`, `PUT /dns_servers/{id}`, `DELETE /dns_servers/{id}`)

**Apa:** Membuat, mengupdate, atau menghapus DNS server.

**Catatan:** Mayoritas pengguna hanya punya 1 DNS server (default). Fitur ini relevan untuk akun dengan multiple server.

**Effort:** Rendah.

---

## D. Perbandingan dengan Schema yang Mungkin Belum Terekspos

Beberapa field di schema AdGuard API belum sepenuhnya dimanfaatkan meski endpoint-nya sudah terpakai:

| Schema | Field Belum Dipakai | Potensi |
|--------|---------------------|---------|
| `QueryLogItem` | `filtering_info.country_code` | Tampilkan negara asal di log aktivitas |
| `QueryLogItem` | `filtering_info.company` | Tampilkan perusahaan pelacak di log |
| `Device` | `settings.blocked_services` | Sudah ada di DNSServer level, belum per device |
| `Device` | `settings.schedule` | Jadwal aktif perangkat — **fitur paling ditunggu** |
| `DNSServerSettings` | `blocking_mode` | Kustomisasi halaman blokir (default: AdGuard, bisa diganti) |
| `DNSServerSettings` | `access_settings` | Daftar allowlist/blocklist klien DNS |
| `DNSServerSettings` | `user_rules` | Aturan filter kustom per DNS server |

---

## E. Rekomendasi Prioritas Eksekusi

| Urutan | Fitur | Endpoint Baru | Nilai | Effort |
|--------|-------|---------------|-------|--------|
| 1 | Per-Device Settings | `PUT /devices/{id}/settings` | Tinggi | Rendah |
| 2 | Hapus Riwayat | `DELETE /query_log` | Sedang | Rendah |
| 3 | DoT iOS Profile | `GET /devices/{id}/dot.mobileconfig` | Sedang | Rendah |
| 4 | Statistik Perusahaan | `GET /stats/companies` | Sedang | Rendah |
| 5 | Filter Lists | `GET /filter_lists` | Sedang | Sedang |
| 6 | Reset DoH Password | `PUT /devices/{id}/doh_password/reset` | Rendah | Rendah |
| 7 | Schedule (Jadwal) | Via `DNSServerSettings.schedule` | Tinggi | Tinggi |
| 8 | Dedicated IP | `GET /dedicated_addresses/ipv4` | Khusus premium | Rendah |

**Prioritas utama (P1):** Per-Device Settings → paling sering diminta orang tua (kontrol individual per anak), effort paling rendah karena infrastruktur sudah ada.

**Catatan schedule:** `DNSServerSettings` sudah punya field `schedule` untuk membatasi waktu akses. Ini adalah fitur yang **paling sering diminta** oleh orang tua, tapi implementasinya lebih kompleks (butuh UI jadwal mingguan, validasi bentrok waktu, dll). Tidak termasuk dalam dokumen ini karena butuh analisis UX terpisah.
