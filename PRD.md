# PRD — Sistem Informasi Penyewaan Kamera

## Camera Rental Management System

Versi 1.0 · Dokumen kebutuhan produk

Draft

Platform

Web responsif

Database

MySQL atau PostgreSQL

Pengguna

Pelanggan dan Admin

Domain

Penyewaan peralatan kamera

## 1. Latar belakang

Proses penyewaan kamera membutuhkan pencatatan data pelanggan, inventaris kamera, jadwal sewa, biaya, serta status pengembalian. Jika dikelola secara manual, proses ini berpotensi menyebabkan kesalahan pencatatan, bentrok jadwal penyewaan, dan kesulitan melacak transaksi.

Sistem ini dirancang untuk mengelola proses penyewaan secara terpusat melalui aplikasi web, sehingga pelanggan dapat melihat kamera yang tersedia dan mengajukan penyewaan, sementara admin mengelola inventaris dan memproses transaksi.

## 2. Tujuan produk

- Mempermudah pelanggan mencari kamera dan mengajukan penyewaan.
- Mempermudah admin mengelola data kamera, pelanggan, dan transaksi.
- Mencegah penyewaan yang bentrok dengan jadwal kamera yang sudah dipesan.
- Menghitung biaya sewa berdasarkan durasi dan tarif kamera.
- Memantau status penyewaan dari pengajuan hingga pengembalian.

## 3. Target pengguna

Pelanggan

- Registrasi dan login menggunakan nomor telepon.
- Melihat daftar kamera dan tarif sewa.
- Memilih tanggal sewa dan pengembalian.
- Mengajukan penyewaan dan melihat status transaksi.
- Melihat riwayat penyewaan.

Admin

- Login ke dashboard admin.
- Mengelola data kamera dan ketersediaannya.
- Melihat data pelanggan.
- Memproses pengajuan penyewaan.
- Mencatat pengambilan, pengembalian, dan status transaksi.
- Melihat laporan penyewaan.

Admin dan pelanggan memiliki hak akses berbeda. Admin tidak boleh mengakses akun pelanggan hanya dengan mengetahui nomor teleponnya.

## 4. Ruang lingkup MVP

Versi pertama berfokus pada fitur inti agar sistem dapat selesai dikembangkan dan diuji.

| Modul           | Fitur                                                     |
| --------------- | --------------------------------------------------------- |
| Autentikasi     | Registrasi, login, logout, validasi sesi                  |
| Katalog kamera  | Daftar kamera, detail, foto, tarif, ketersediaan          |
| Pelanggan       | Profil dan riwayat penyewaan                              |
| Penyewaan       | Pilih kamera, tanggal sewa, tanggal kembali, hitung biaya |
| Transaksi       | Pengajuan, persetujuan, pembatalan, status sewa           |
| Pengembalian    | Pencatatan tanggal kembali dan penyelesaian sewa          |
| Dashboard admin | Ringkasan penyewaan, inventaris, dan transaksi            |
| Laporan         | Riwayat transaksi dan rekap penyewaan                     |

Fitur pembayaran online, integrasi payment gateway, denda otomatis, dan notifikasi WhatsApp belum termasuk MVP.

## 5. Kebutuhan fungsional

FR-01

Registrasi pelanggan

Pelanggan membuat akun menggunakan nama, nomor telepon, alamat, dan password.

FR-02

Autentikasi

Sistem memverifikasi nomor telepon dan password. Password disimpan menggunakan hashing Argon2id atau bcrypt.

FR-03

Katalog kamera

Pelanggan dapat melihat foto, nama, jenis kamera, tarif sewa per hari, dan ketersediaan.

FR-04

Pengajuan penyewaan

Pelanggan memilih kamera, tanggal mulai, dan tanggal kembali. Sistem memvalidasi tanggal serta menghitung biaya.

FR-05

Validasi ketersediaan

Sistem memeriksa jadwal agar kamera tidak disewakan kepada pelanggan lain pada periode yang bertabrakan.

FR-06

Persetujuan admin

Admin dapat menyetujui atau menolak pengajuan penyewaan.

FR-07

Pengelolaan transaksi

Sistem mencatat status pengajuan, disetujui, sedang disewa, selesai, atau dibatalkan.

FR-08

Pengembalian kamera

Admin mencatat pengembalian dan memperbarui status transaksi serta ketersediaan kamera.

FR-09

Riwayat dan laporan

Pelanggan melihat transaksi miliknya; admin dapat melihat dan memfilter seluruh transaksi.

## 6. Aturan bisnis

1. Nomor telepon harus unik untuk setiap akun pelanggan.
2. Setiap transaksi memiliki satu `id_transaksi` yang unik.
3. Setiap transaksi pada MVP mengacu pada satu pelanggan dan satu produk kamera.
4. Durasi sewa dihitung berdasarkan tanggal sewa dan tanggal kembali. Untuk MVP, kedua tanggal dihitung inklusif: sewa satu hari berarti tanggal sewa sama dengan tanggal kembali.
5. Total biaya dihitung dengan rumus:

\\[ \text{Total Biaya}=\text{Durasi Sewa}\times\text{Harga Sewa per Hari} \\]

6. Tarif yang disepakati saat transaksi harus disimpan agar perubahan tarif produk tidak mengubah transaksi lama.
7. Kamera yang sudah dipesan atau sedang disewa tidak boleh dipesan untuk periode yang bertabrakan.
8. Pengajuan belum menjadi penyewaan terkonfirmasi sampai disetujui admin.
9. Hanya admin yang dapat mengubah status persetujuan dan mencatat pengembalian.
10. Data transaksi tidak boleh dihapus sembarangan karena diperlukan untuk riwayat dan laporan.

## 7. Rancangan database

### Entitas `Pelanggan`

| Atribut          | Tipe data    | Keterangan        |
| ---------------- | ------------ | ----------------- |
| `id_pelanggan`   | BIGINT       | PK                |
| `nama_pelanggan` | VARCHAR(100) | Nama pelanggan    |
| `no_telepon`     | VARCHAR(20)  | Unik, untuk login |
| `password_hash`  | VARCHAR(255) | Hash password     |
| `alamat`         | TEXT         | Alamat pelanggan  |
| `created_at`     | TIMESTAMP    | Waktu pendaftaran |

### Entitas `Produk`

| Atribut               | Tipe data     | Keterangan                        |
| --------------------- | ------------- | --------------------------------- |
| `id_produk`           | BIGINT        | PK                                |
| `nama_produk`         | VARCHAR(150)  | Nama kamera                       |
| `jenis_kamera`        | VARCHAR(100)  | Jenis atau kategori               |
| `harga_sewa`          | DECIMAL(12,2) | Tarif per hari                    |
| `stok`                | INT           | Jumlah unit tersedia secara fisik |
| `status_ketersediaan` | VARCHAR(30)   | Status inventaris                 |

### Entitas `Transaksi`

| Atribut                     | Tipe data     | Keterangan                             |
| --------------------------- | ------------- | -------------------------------------- |
| `id_transaksi`              | BIGINT        | PK                                     |
| `id_pelanggan`              | BIGINT        | FK ke Pelanggan                        |
| `id_produk`                 | BIGINT        | FK ke Produk                           |
| `tanggal_sewa`              | DATE          | Tanggal mulai                          |
| `tanggal_kembali`           | DATE          | Tanggal pengembalian yang direncanakan |
| `durasi_sewa`               | INT           | Durasi dalam hari                      |
| `harga_sewa_saat_transaksi` | DECIMAL(12,2) | Tarif historis per hari                |
| `total_biaya`               | DECIMAL(12,2) | Total biaya sewa                       |
| `status_sewa`               | VARCHAR(30)   | Status transaksi                       |
| `created_at`                | TIMESTAMP     | Waktu pengajuan                        |

Catatan penting: rancangan tiga entitas ini membatasi satu transaksi untuk satu jenis kamera. Jika satu transaksi dapat memuat beberapa kamera, tambahkan tabel `Detail_Transaksi` dengan `id_transaksi`, `id_produk`, jumlah unit, tarif, dan subtotal. Untuk inventaris dengan beberapa unit kamera yang dapat dipesan bersamaan, dibutuhkan pula pencatatan unit atau jadwal ketersediaan per unit.

### Relasi ERD

PELANGGAN

PK: id_pelanggan

1 : N

melakukan

TRANSAKSI

PK: id_transaksi

FK: id_pelanggan, id_produk

N : 1

mengacu pada produk

PRODUK

PK: id_produk

## 8. Alur pengguna

\#chatgpt-mermaid-\_r_kb\_{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;fill:rgb(237, 237, 237);}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#chatgpt-mermaid-\_r_kb\_ .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_kb\_ .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_kb\_ .error-icon{fill:rgb(48, 48, 48);}#chatgpt-mermaid-\_r_kb\_ .error-text{fill:rgb(237, 237, 237);stroke:rgb(237, 237, 237);}#chatgpt-mermaid-\_r_kb\_ .edge-thickness-normal{stroke-width:1px;}#chatgpt-mermaid-\_r_kb\_ .edge-thickness-thick{stroke-width:3.5px;}#chatgpt-mermaid-\_r_kb\_ .edge-pattern-solid{stroke-dasharray:0;}#chatgpt-mermaid-\_r_kb\_ .edge-thickness-invisible{stroke-width:0;fill:none;}#chatgpt-mermaid-\_r_kb\_ .edge-pattern-dashed{stroke-dasharray:3;}#chatgpt-mermaid-\_r_kb\_ .edge-pattern-dotted{stroke-dasharray:2;}#chatgpt-mermaid-\_r_kb\_ .marker{fill:rgb(175, 175, 175);stroke:rgb(175, 175, 175);}#chatgpt-mermaid-\_r_kb\_ .marker.cross{stroke:rgb(175, 175, 175);}#chatgpt-mermaid-\_r_kb\_ svg{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;}#chatgpt-mermaid-\_r_kb\_ p{margin:0;}#chatgpt-mermaid-\_r_kb\_ .label{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";color:rgb(237, 237, 237);}#chatgpt-mermaid-\_r_kb\_ .cluster-label text{fill:rgb(237, 237, 237);}#chatgpt-mermaid-\_r_kb\_ .cluster-label span{color:rgb(237, 237, 237);}#chatgpt-mermaid-\_r_kb\_ .cluster-label span p{background-color:transparent;}#chatgpt-mermaid-\_r_kb\_ .label text,#chatgpt-mermaid-\_r_kb\_ span{fill:rgb(237, 237, 237);color:rgb(237, 237, 237);}#chatgpt-mermaid-\_r_kb\_ .node rect,#chatgpt-mermaid-\_r_kb\_ .node circle,#chatgpt-mermaid-\_r_kb\_ .node ellipse,#chatgpt-mermaid-\_r_kb\_ .node polygon,#chatgpt-mermaid-\_r_kb\_ .node path{fill:rgb(52, 24, 11);stroke:rgb(172, 79, 35);stroke-width:1px;}#chatgpt-mermaid-\_r_kb\_ .rough-node .label text,#chatgpt-mermaid-\_r_kb\_ .node .label text,#chatgpt-mermaid-\_r_kb\_ .image-shape .label,#chatgpt-mermaid-\_r_kb\_ .icon-shape .label{text-anchor:middle;}#chatgpt-mermaid-\_r_kb\_ .node .katex path{fill:#000;stroke:#000;stroke-width:1px;}#chatgpt-mermaid-\_r_kb\_ .rough-node .label,#chatgpt-mermaid-\_r_kb\_ .node .label,#chatgpt-mermaid-\_r_kb\_ .image-shape .label,#chatgpt-mermaid-\_r_kb\_ .icon-shape .label{text-align:center;}#chatgpt-mermaid-\_r_kb\_ .node.clickable{cursor:pointer;}#chatgpt-mermaid-\_r_kb\_ .root .anchor path{fill:rgb(175, 175, 175)!important;stroke-width:0;stroke:rgb(175, 175, 175);}#chatgpt-mermaid-\_r_kb\_ .arrowheadPath{fill:rgb(175, 175, 175);}#chatgpt-mermaid-\_r_kb\_ .edgePath .path{stroke:rgb(175, 175, 175);stroke-width:1px;}#chatgpt-mermaid-\_r_kb\_ .flowchart-link{stroke:rgb(175, 175, 175);fill:none;}#chatgpt-mermaid-\_r_kb\_ .edgeLabel{background-color:rgb(0, 0, 0);text-align:center;}#chatgpt-mermaid-\_r_kb\_ .edgeLabel p{background-color:rgb(0, 0, 0);}#chatgpt-mermaid-\_r_kb\_ .edgeLabel rect{opacity:0.5;background-color:rgb(0, 0, 0);fill:rgb(0, 0, 0);}#chatgpt-mermaid-\_r_kb\_ .labelBkg{background-color:rgba(0, 0, 0, 0.5);}#chatgpt-mermaid-\_r_kb\_ .cluster rect{fill:rgb(48, 48, 48);stroke:rgba(255, 255, 255, 0.15);stroke-width:1px;}#chatgpt-mermaid-\_r_kb\_ .cluster text{fill:rgb(237, 237, 237);}#chatgpt-mermaid-\_r_kb\_ .cluster span{color:rgb(237, 237, 237);}#chatgpt-mermaid-\_r_kb\_ div.mermaidTooltip{position:absolute;text-align:center;max-width:200px;padding:2px;font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:12px;background:rgb(48, 48, 48);border:1px solid rgba(255, 255, 255, 0.15);border-radius:2px;pointer-events:none;z-index:100;}#chatgpt-mermaid-\_r_kb\_ .flowchartTitleText{text-anchor:middle;font-size:18px;fill:rgb(237, 237, 237);}#chatgpt-mermaid-\_r_kb\_ rect.text{fill:none;stroke-width:0;}#chatgpt-mermaid-\_r_kb\_ .icon-shape,#chatgpt-mermaid-\_r_kb\_ .image-shape{background-color:rgb(0, 0, 0);text-align:center;}#chatgpt-mermaid-\_r_kb\_ .icon-shape p,#chatgpt-mermaid-\_r_kb\_ .image-shape p{background-color:rgb(0, 0, 0);padding:2px;}#chatgpt-mermaid-\_r_kb\_ .icon-shape .label rect,#chatgpt-mermaid-\_r_kb\_ .image-shape .label rect{opacity:0.5;background-color:rgb(0, 0, 0);fill:rgb(0, 0, 0);}#chatgpt-mermaid-\_r_kb\_ .label-icon{display:inline-block;height:1em;overflow:visible;vertical-align:-0.125em;}#chatgpt-mermaid-\_r_kb\_ .node .label-icon path{fill:currentColor;stroke:revert;stroke-width:revert;}#chatgpt-mermaid-\_r_kb\_ .node .neo-node{stroke:rgb(172, 79, 35);}#chatgpt-mermaid-\_r_kb\_ [data-look="neo"].node rect,#chatgpt-mermaid-\_r_kb\_ [data-look="neo"].cluster rect,#chatgpt-mermaid-\_r_kb\_ [data-look="neo"].node polygon{stroke:url(#chatgpt-mermaid-\_r_kb\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_kb\_ [data-look="neo"].swimlane.cluster rect{filter:none;}#chatgpt-mermaid-\_r_kb\_ [data-look="neo"].node path{stroke:url(#chatgpt-mermaid-\_r_kb\_-gradient);stroke-width:1px;}#chatgpt-mermaid-\_r_kb\_ [data-look="neo"].node .outer-path{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_kb\_ [data-look="neo"].node .neo-line path{stroke:rgb(172, 79, 35);filter:none;}#chatgpt-mermaid-\_r_kb\_ [data-look="neo"].node circle{stroke:url(#chatgpt-mermaid-\_r_kb\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_kb\_ [data-look="neo"].node circle .state-start{fill:#000000;}#chatgpt-mermaid-\_r_kb\_ [data-look="neo"].icon-shape .icon{fill:url(#chatgpt-mermaid-\_r_kb\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_kb\_ [data-look="neo"].icon-shape .icon-neo path{stroke:url(#chatgpt-mermaid-\_r_kb\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_kb\_ .node text{font-size:14px;font-weight:600;letter-spacing:normal;fill:rgb(255, 183, 144);}#chatgpt-mermaid-\_r_kb\_ .edgeLabels text{font-size:13px;font-weight:600;letter-spacing:-0.08px;fill:rgb(255, 183, 144);}#chatgpt-mermaid-\_r_kb\_ .node tspan[font-weight="normal"],#chatgpt-mermaid-\_r_kb\_ .edgeLabels tspan[font-weight="normal"]{font-weight:600;}#chatgpt-mermaid-\_r_kb\_ .edgeLabel .label rect{opacity:1;rx:13px;ry:13px;fill:rgb(40, 17, 5);stroke:rgb(92, 56, 31);stroke-width:1px;}#chatgpt-mermaid-\_r_kb\_ .node rect,#chatgpt-mermaid-\_r_kb\_ .node circle,#chatgpt-mermaid-\_r_kb\_ .node ellipse,#chatgpt-mermaid-\_r_kb\_ .node polygon,#chatgpt-mermaid-\_r_kb\_ .node path{fill:rgb(74, 34, 6);stroke:rgba(255, 255, 255, 0.1);stroke-width:1px;}#chatgpt-mermaid-\_r_kb\_ .node rect{rx:16px;ry:16px;}#chatgpt-mermaid-\_r_kb\_ .node.mermaid-decision .label-container{fill:rgb(40, 17, 5);stroke:rgb(92, 56, 31);stroke-dasharray:2,2;}#chatgpt-mermaid-\_r_kb\_ .edgePaths .flowchart-link{stroke:rgb(175, 175, 175);stroke-width:1px;stroke-linecap:round;stroke-linejoin:round;}#chatgpt-mermaid-\_r_kb\_ .marker{fill:rgb(175, 175, 175);stroke:rgb(175, 175, 175);}#chatgpt-mermaid-\_r_kb\_ :root{--mermaid-font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";}Pengunjung membuka webSudah punya akun?Registrasi pelangganLogin nomor telepon danpasswordLihat katalog kameraPilih kamera dan tanggalsewaSistem cek ketersediaan danhitung biayaAjukan penyewaanAdmin memeriksa pengajuanDisetujui?Status ditolakStatus disetujuiPengambilan kameraPengembalian kameraAdmin konfirmasipengembalianTransaksi selesaiTidakYaTidakYa

## 9. Kebutuhan nonfungsional

- Keamanan: password di-hash, validasi input, proteksi CSRF, otorisasi berdasarkan peran, dan pembatasan percobaan login.
- Integritas data: gunakan foreign key, transaksi database, dan pemeriksaan bentrok jadwal.
- Responsivitas: antarmuka dapat digunakan pada laptop, tablet, dan ponsel.
- Usability: proses pemesanan mudah dipahami, dengan status transaksi yang jelas.
- Maintainability: struktur kode modular, validasi backend, logging, dan pengujian otomatis.
- Backup: sediakan prosedur backup dan pemulihan database.

## 10. Rekomendasi teknologi

Stack final bisa mengikuti kemampuan dan lingkungan deployment proyek. Sebagai rancangan awal, kombinasi berikut layak digunakan.

| Lapisan     | Teknologi                                         |
| ----------- | ------------------------------------------------- |
| Backend     | Laravel                                           |
| Frontend    | React + Inertia.js                                |
| UI          | Tailwind CSS + shadcn/ui                          |
| Database    | MySQL                                             |
| Autentikasi | Session-based authentication                      |
| Testing     | PHPUnit atau Pest + pengujian frontend            |
| Deployment  | VPS atau hosting yang mendukung kebutuhan Laravel |

Untuk akun admin, gunakan autentikasi dan otorisasi khusus admin. Jangan memberikan akses admin hanya berdasarkan kolom yang bisa diubah pelanggan.

## 11. Kriteria penerimaan

- Pelanggan bisa mendaftar dan login dengan nomor telepon serta password yang benar.
- Login ditolak jika password salah.
- Pelanggan bisa melihat katalog kamera dan tarifnya.
- Sistem menolak tanggal sewa yang tidak valid atau bertabrakan.
- Total biaya sesuai durasi dan tarif yang berlaku.
- Admin bisa menyetujui atau menolak pengajuan.
- Pelanggan hanya bisa melihat transaksi miliknya.
- Pengembalian memperbarui status transaksi dengan benar.
- Data transaksi tetap konsisten jika dua pelanggan mencoba memesan kamera bersamaan.
- Laporan dapat difilter berdasarkan tanggal dan status.

## 12. Tahapan implementasi

Tahap 1

Fondasi

Setup proyek, database, migration, autentikasi, dan role admin.

Tahap 2

Inventaris kamera

CRUD produk, upload foto, tarif sewa, dan stok.

Tahap 3

Penyewaan

Pemilihan tanggal, pemeriksaan ketersediaan, kalkulasi biaya, dan pengajuan.

Tahap 4

Operasional admin

Persetujuan, status sewa, pengembalian, dan riwayat transaksi.

Tahap 5

Pengujian dan deployment

Pengujian alur, keamanan, validasi jadwal bersamaan, backup, dan rilis.

## 13. Di luar cakupan MVP

- Pembayaran otomatis melalui payment gateway.
- Verifikasi identitas dengan OCR atau face recognition.
- Integrasi WhatsApp atau SMS.
- Pengelolaan denda dan deposit yang kompleks.
- Aplikasi mobile native.

## 14. Keputusan desain yang perlu dikunci

Ada satu keputusan penting sebelum mulai coding: apakah satu transaksi hanya boleh menyewa satu kamera atau bisa menyewa beberapa kamera sekaligus?

Untuk PRD versi ini, asumsi awalnya adalah satu transaksi untuk satu produk kamera. Jika kebutuhan operasional sebenarnya mengizinkan beberapa kamera dalam satu transaksi, sebaiknya kita revisi ERD terlebih dahulu dengan menambahkan `Detail_Transaksi`.

Dokumen PRD ini dapat digunakan sebagai dasar pembuatan migration database, backlog tugas, rancangan UI, API, dan test case implementasi.
