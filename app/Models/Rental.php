<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Rental extends Model
{
    public const ACTIVE_STATUSES = ['menunggu_persetujuan', 'disetujui', 'sedang_disewa'];

    public const STATUS_LABELS = [
        'menunggu_persetujuan' => 'Menunggu persetujuan',
        'disetujui' => 'Disetujui',
        'sedang_disewa' => 'Sedang disewa',
        'selesai' => 'Selesai',
        'ditolak' => 'Ditolak',
        'dibatalkan' => 'Dibatalkan',
    ];

    protected $table = 'transaksi';

    protected $primaryKey = 'id_transaksi';

    protected $fillable = [
        'kode_transaksi', 'id_pelanggan', 'id_produk', 'tanggal_sewa', 'tanggal_kembali',
        'durasi_sewa', 'harga_sewa_saat_transaksi', 'total_biaya', 'status_sewa',
        'picked_up_at', 'returned_at',
    ];

    protected function casts(): array
    {
        return [
            'tanggal_sewa' => 'date',
            'tanggal_kembali' => 'date',
            'harga_sewa_saat_transaksi' => 'decimal:2',
            'total_biaya' => 'decimal:2',
            'picked_up_at' => 'datetime',
            'returned_at' => 'datetime',
        ];
    }

    public function getTransactionCodeAttribute(): string
    {
        return $this->kode_transaksi;
    }

    public function getStartDateAttribute(): mixed
    {
        return $this->tanggal_sewa;
    }

    public function getEndDateAttribute(): mixed
    {
        return $this->tanggal_kembali;
    }

    public function getTotalAmountAttribute(): mixed
    {
        return $this->total_biaya;
    }

    public function getStatusLabelAttribute(): string
    {
        return self::STATUS_LABELS[$this->status_sewa] ?? 'Dibatalkan';
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'id_pelanggan', 'id_pelanggan');
    }

    public function camera()
    {
        return $this->belongsTo(Camera::class, 'id_produk', 'id_produk');
    }
}
