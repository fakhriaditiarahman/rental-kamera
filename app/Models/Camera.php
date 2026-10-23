<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Camera extends Model
{
    protected $table = 'produk';

    protected $primaryKey = 'id_produk';

    protected $fillable = ['nama_produk', 'jenis_kamera', 'description', 'image_url', 'harga_sewa', 'stok', 'status_ketersediaan'];

    protected function casts(): array
    {
        return [
            'daily_rate' => 'decimal:2',
            'stock' => 'integer',
        ];
    }

    public function getNameAttribute(): string
    {
        return $this->nama_produk;
    }

    public function getTypeAttribute(): string
    {
        return $this->jenis_kamera;
    }

    public function getDailyRateAttribute(): mixed
    {
        return $this->harga_sewa;
    }

    public function getStockAttribute(): int
    {
        return $this->stok;
    }

    public function rentals()
    {
        return $this->hasMany(Rental::class, 'id_produk', 'id_produk');
    }
}
