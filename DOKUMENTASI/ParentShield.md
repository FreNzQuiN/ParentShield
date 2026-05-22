## A. Point Aplikasi

Tujuan yang harus dipahami.

- Memudahkan Parent yang Gaptek melakukan pemantauan dan monitor aktivitas device anak.
- Menyederhanakan kompleksitas Adguard dengan menggunakan API Adguard sehingga lebih mudah dipahami.
- Development Best Practice, Modular dan Scallable, Menerapkan Konsep DRY sehingga Manageable dan Memudahkan Debug.

## B. Logika Utama Aplikasi

Pastikan semua kondisi terpenuhi dalam implementasi.

1. Jika Kondisi User belum login = redirect semua halaman >> User Login
2. Flow Aplikasi = Halaman Login >> User memilih Register dan berhasil Register >> User kembali ke Halaman Login dan berhasil Login >> User masuk Halaman Setup API KEY ADGUARD dan berhasil verifikasi API KEY Valid >> User masuk Dashboard >> Sistem Pop Up Untuk menjelaskan dan meminta Add Device (Selalu muncul di semua halaman sampai user berhasil menambahkan device) >> User Redirect Halaman AddDevice >> User Pilih Tipe Device Anak [Android,Windows,IOS] >> User Setup Private DNS sesuai Tipe Device sampai device berhasil terdeteksi >> Penambahan Device berhasil (Flow Wajib Selesai)
3. Device Maksimal = 5 Device untuk akun Adguard biasa, belum implementasi akun Langganan Adguard.
4. API KEY Kosong / Tidak Berlaku lagi dalam keadaan User sudah Login = Redirect semua halaman ke Setup API KEY.
5. Device sudah ada tapi tidak ada di database aplikasi = Sync Device yang belum masuk database sehingga bisa dikelola.
6. Jika gagal setup device = lakukan rollback database ParentShield dan hapus device Adguard dengan API Adguard.
7. State Management = Semua proses yang bisa menghasilkan State berbeda (Berhasil, gagal, loading) harus ditangani dengan elegan.

## C. UI Yang Tersedia di Figma

Gunakan sebagai panduan implementasi UI.

Tanpa Sidebar:

1. Login (Halaman "ParentShield Login", Halaman "ParentShield Forgot Password")
2. Register (Halaman "ParentShield Register")
3. Setup (Halaman "ParentShield API KEY")

Dengan Sidebar:

4. Dashboard (Halaman "ParentShield Dashboard")
5. AddDevice (Halaman "ParentShield Devices" + Pop Up "ParentShield AddDevice Android", Halaman "ParentShield Devices" + Pop Up "ParentShield AddDevice Windows", Halaman "ParentShield Devices" + Pop Up "ParentShield AddDevice IOS")
6. LogActivity (Halaman "ParentShield Activity History")
7. Settings (Halaman "ParentShield Settings")
