# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React + Inertia.js + Tailwind CSS + shadcn/ui, with a Laravel backend contract to be implemented later.

## Users

Pelanggan yang ingin menemukan kamera, memilih periode sewa, mengajukan penyewaan, dan memantau status transaksi. Admin mengelola inventaris, pelanggan, pengajuan, pengembalian, dan laporan.

## Product Purpose

Sistem memusatkan katalog kamera dan operasional penyewaan agar pelanggan dapat mengajukan sewa dengan jelas, sementara admin dapat memproses transaksi dan memantau ketersediaan tanpa pencatatan manual yang rawan bentrok.

## Positioning

Produk menghubungkan katalog, validasi ketersediaan berbasis tanggal, kalkulasi biaya inklusif, dan workflow persetujuan dalam satu alur penyewaan kamera.

## Operating Context

Pelanggan menggunakan web pada laptop, tablet, atau ponsel untuk mencari kamera dan mengajukan sewa. Admin menggunakan dashboard operasional untuk memproses pengajuan, mencatat pengambilan dan pengembalian, serta memfilter laporan.

## Capabilities and Constraints

- MVP frontend mencakup alur pelanggan dan dashboard admin.
- Satu transaksi mengacu pada satu produk kamera.
- Durasi sewa menghitung tanggal mulai dan tanggal kembali secara inklusif.
- Frontend tahap ini menggunakan mock API contract; persistence, otorisasi server, dan konsistensi transaksi menjadi tanggung jawab backend berikutnya.
- Pembayaran online, denda otomatis, WhatsApp/SMS, verifikasi identitas, dan native mobile berada di luar MVP.

## Evidence on Hand

`PRD.md` adalah sumber kebutuhan produk. Belum ada logo, foto produk, font, testimoni, pricing bisnis, atau aset brand yang boleh dianggap final.

## Product Principles

- Ketersediaan dan status transaksi harus mudah dipahami.
- Booking harus menjelaskan tanggal, durasi, tarif, dan total sebelum diajukan.
- Admin membutuhkan scanability dan kontrol status yang jelas.
- UI harus tetap berguna pada layar kecil.
- Data demonstrasi tidak boleh menyamar sebagai bukti bisnis nyata.

## Accessibility & Inclusion

Frontend harus menyediakan label form yang jelas, navigasi keyboard, focus state terlihat, kontras memadai, status yang tidak hanya bergantung pada warna, dan dukungan reduced motion.
