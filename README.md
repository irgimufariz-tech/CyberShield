# CyberShield — Network Security Simulator

Aplikasi dashboard pemantauan jaringan berbasis HTML, CSS, JavaScript dengan simulasi firewall. Tema gelap mengikuti referensi desain.

## Menjalankan aplikasi (cara cepat)
1. Ekstrak `CyberShield.zip`.
2. Buka folder `CyberShield`.
3. Klik dua kali `index.html`, atau buka folder dengan VS Code lalu jalankan memakai ekstensi Live Server.
4. Data aturan, blacklist, log, dan statistik disimpan di `localStorage` browser. Gunakan browser yang sama agar data tetap tersedia.

## Fitur yang dapat diuji
- Dashboard: paket diperiksa, koneksi diizinkan, ancaman diblokir, aturan aktif, grafik traffic, dan port serangan.
- Aturan firewall: tambah aturan, aktif/nonaktifkan, hapus; gunakan `*` untuk semua IP atau port.
- Simulasi: masukkan IP dan port, lalu jalankan pemeriksaan. Blacklist diprioritaskan, kemudian aturan firewall aktif.
- Skenario serangan: Port Scan, Brute Force, dan Malware Payload.
- Log keamanan: riwayat kejadian dan ekspor CSV.
- Blacklist: tambah dan hapus IP.

## Pengujian contoh
| Kasus | Input / tindakan | Hasil yang diharapkan |
|---|---|---|
| HTTPS diizinkan | IP `192.168.1.25`, port `443` | DIIZINKAN |
| SSH diblokir | IP `192.168.1.25`, port `22` | DIBLOKIR |
| IP blacklist | IP `198.51.100.23`, port `443` | DIBLOKIR |
| Port tidak memiliki aturan | IP `192.168.1.25`, port `8081` | DIIZINKAN (default) |
| Firewall nonaktif | Matikan firewall lalu uji port `22` | DIIZINKAN |
| Pencatatan | Jalankan salah satu pengujian | Aktivitas masuk ke Log Keamanan |

> Catatan: Ini adalah simulator pembelajaran. Aplikasi tidak memonitor NIC, tidak memfilter paket sistem operasi, dan tidak melakukan pemblokiran jaringan sungguhan.

## Opsi database PHP + MySQL (XAMPP/Laragon)
1. Salin folder `CyberShield` ke `htdocs` (XAMPP) atau folder web server Laragon.
2. Jalankan Apache dan MySQL.
3. Buka phpMyAdmin, impor `database.sql`.
4. Sesuaikan host, nama database, username, dan password pada `config.php`.
5. API tersedia di `api.php?resource=rules`, `api.php?resource=logs`, dan `api.php?resource=blacklist` untuk operasi CRUD dasar.
6. Antarmuka `index.html` saat ini memakai penyimpanan lokal browser; API PHP disediakan sebagai backend awal untuk pengembangan integrasi berikutnya.

## Struktur folder
- `index.html` — struktur halaman.
- `style.css` — tema gelap responsif.
- `app.js` — interaksi, simulasi keputusan firewall, grafik, dan localStorage.
- `database.sql` — tiga tabel database dan data awal.
- `config.php`, `api.php` — koneksi dan endpoint PHP.
