<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;

class Camera extends Model
{
    protected $table = 'produk';

    public $timestamps = false;

    protected $primaryKey = 'id_produk';

    protected $fillable = ['nama_produk', 'jenis_kamera', 'harga_sewa', 'stok', 'status_ketersediaan'];

    /**
     * Shape used by the admin workspace views.
     *
     * @return Collection<int, array<string, mixed>>
     */
    public static function adminList(): Collection
    {
        return static::query()->orderBy('nama_produk')->get()->values()->map(fn ($camera, $index) => [
            'id' => $camera->id_produk,
            'name' => $camera->nama_produk,
            'type' => $camera->jenis_kamera,
            'rate' => (float) $camera->harga_sewa,
            'stock' => (int) $camera->stok,
            'status' => $camera->status_ketersediaan,
            'tone' => ['sand', 'clay', 'sage', 'ink'][$index % 4],
            'tag' => 'Koleksi',
        ]);
    }

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
