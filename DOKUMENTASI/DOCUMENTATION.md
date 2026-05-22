# Technical Specification: ParentShield x AdGuard DNS API (v1.13)

**Source of Truth untuk Integrasi Backend (Laravel) & Frontend (React)**

## 1. Arsitektur & Konfigurasi Dasar

- **Topologi:** Frontend (React) ↔ Internal REST API (Laravel) ↔ AdGuard DNS API. _Direct call_ dari Frontend ke AdGuard dilarang.
- **Base URL AdGuard:** `https://api.adguard-dns.io/oapi/v1`
- **Otentikasi:** Server-to-Server menggunakan API Key.
    - Header: `Authorization: ApiKey {api_key}`
- **Tipe Data Waktu:** Gunakan _Epoch Milliseconds_ (tipe `long`) untuk semua parameter waktu (`time_from_millis`, `time_to_millis`).

## 2. Pemetaan Fitur & Payload Wajib (DNS Server Settings)

Endpoint utama untuk mengontrol perlindungan anak adalah:  
**`PUT /dns_servers/{dns_server_id}/settings`**

Berikut adalah struktur JSON v1.13 penuh beserta pemetaan fitur (UX) di sisi Frontend:

```json
{
    // UX: Level Perlindungan (Switch Utama ON/OFF)
    "protection_enabled": true,
    "block_chrome_prefetch": true,
    "ip_log_enabled": true,

    // UX: Tameng Anti-Bahaya
    "safebrowsing_settings": {
        "enabled": true,
        "block_dangerous_domains": true,
        "block_nrd": true,
        "typosquatting_protection_enabled": true,
        "blocking_mode_settings": "NXDOMAIN"
    },

    "access_settings": {
        // UX: Kunci Aplikasi (Web Services)
        // Ambil daftar ID layanan dari GET /web_services
        "blocked_services": ["tiktok", "roblox", "youtube"],

        // UX: Blacklist Kustom (Blokir Manual)
        "blocked_domain_rules": ["||judionline.com^"],

        // UX: Whitelist Kustom (Pengecualian/Izinkan)
        "allowed_domain_rules": ["||wikipedia.org^"],

        "allowed_clients": [],
        "blocked_clients": []
    }
}
```

_Catatan: Parameter `safebrowsing_enabled` lama sudah usang. Gunakan blok `safebrowsing_settings` secara konsisten._

## 3. Manajemen Perangkat (Device Registration)

Merepresentasikan perangkat fisik anak. Relasikan `device_id` AdGuard dengan entitas `children` di database Laravel.

| Method | Endpoint                         | Fungsi                                            |
| :----- | :------------------------------- | :------------------------------------------------ |
| `POST` | `/devices`                       | Register perangkat baru.                          |
| `GET`  | `/devices/{id}/doh.mobileconfig` | Download profil _DNS-over-HTTPS_ (Apple Devices). |
| `PUT`  | `/devices/{id}/settings`         | Update security config.                           |

**Payload Pengamanan Perangkat (Mencegah Bypass DNS):**

```json
{
    "detect_doh_auth_only": true
}
```

## 4. Log & Statistik (Dashboard Data)

Data yang di-return berukuran besar, perhatikan parsing di sisi client (terutama ID/angka bertipe `BigInt`).

- **Query Log (Riwayat):** `GET /query_log`
    - _Paginasi:_ Gunakan parameter `cursor` dari response sebelumnya (bukan _offset/page_).
    - _Wajib:_ `time_from_millis`, `time_to_millis`.
- **Statistik Kategori:** `GET /stats/categories`
- **Kepadatan Waktu (Grafik):** `GET /stats/time`

## 5. Limitasi Sistem & Workaround (Server-Side)

Fitur berikut **tidak didukung secara native** oleh AdGuard DNS API dan wajib di-handle oleh arsitektur internal Laravel:

1.  **Penjadwalan / Jam Malam (Time-based Blocking):**
    - AdGuard tidak memiliki payload penjadwalan.
    - **Implementasi:** Laravel menyimpan jadwal di database dan menggunakan _Task Scheduler (Cron)_. Pada jam target, eksekusi `PUT /dns_servers/{id}/settings` untuk memodifikasi array `blocked_services` atau mematikan/menyalakan `protection_enabled`.
2.  **Pemblokiran URL Spesifik (Granular URL Blocking):**
    - Sistem bersifat DNS-level (resolusi domain). Pemblokiran hanya berlaku di level FQDN/Domain (contoh: `youtube.com`), bukan path spesifik (`youtube.com/watch?v=...`). Validasi input dari Frontend agar hanya menerima format domain.
3.  **Account Limits Validation:**
    - Cek sisa kuota (rules/devices) via `GET /account/limits`.
    - Jika payload `blocked_domain_rules` melebihi limit, API merespons dengan HTTP 400 (`FIELD_REACHED_LIMIT`). Laravel harus me-return error yang _graceful_ ke React.
