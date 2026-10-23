# Frontend handoff

Frontend demo berjalan dengan Vite dan memakai mock data sampai Laravel/Inertia tersedia.

## Menjalankan

```bash
npm install
npm run dev
```

## Route frontend

- `/` — halaman beranda publik
- `/admin` — dashboard admin
- `/admin/katalog` — katalog kamera admin
- `/admin/penyewaan` — transaksi penyewaan admin
- `/admin/pelanggan` — daftar pelanggan admin
- `/admin/inventaris` — inventaris admin
- `/pelanggan` — dashboard pelanggan
- `/pelanggan/katalog` — katalog kamera pelanggan
- `/pelanggan/sewa` — riwayat sewa pelanggan
- `/pelanggan/profil` — profil pelanggan

## Integrasi Laravel berikutnya

- Ganti `src/services/mockApi.js` dengan action/props Inertia tanpa mengubah bentuk data view.
- `listCameras({ search, status })` mengembalikan `data` kamera dan `meta` pagination.
- `calculateRental({ startDate, endDate, dailyRate })` menghitung durasi inklusif dan total.
- `createRental(payload)` mengembalikan transaksi baru dengan status `Menunggu persetujuan`.
- Status transaksi yang dipakai UI: `Menunggu persetujuan`, `Disetujui`, `Sedang disewa`, `Selesai`, `Dibatalkan`.

Data pada layar saat ini adalah demonstrasi, bukan inventaris atau pendapatan nyata.
