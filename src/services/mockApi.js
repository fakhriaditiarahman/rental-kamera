/**
 * Temporary frontend contract. Replace implementations with Inertia page props
 * and Laravel actions without changing the view-level data shapes.
 */
export const rentalStatuses = ['Menunggu persetujuan', 'Disetujui', 'Sedang disewa', 'Selesai', 'Dibatalkan'];

export const mockApi = {
  async listCameras({ search = '', status = 'Semua' } = {}) {
    return { data: [], meta: { search, status, page: 1, perPage: 12, total: 0 } };
  },
  async calculateRental({ startDate, endDate, dailyRate }) {
    if (!startDate || !endDate || !dailyRate) return { data: null, errors: { dates: 'Tanggal dan tarif wajib diisi.' } };
    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);
    const duration = Math.floor((end - start) / 86400000) + 1;
    if (Number.isNaN(duration) || duration < 1) return { data: null, errors: { dates: 'Tanggal kembali harus sama atau setelah tanggal sewa.' } };
    return { data: { duration, dailyRate, total: duration * dailyRate }, errors: null };
  },
  async createRental(payload) {
    return { data: { id: `SK-${Date.now()}`, ...payload, status: 'Menunggu persetujuan' }, errors: null };
  },
};
