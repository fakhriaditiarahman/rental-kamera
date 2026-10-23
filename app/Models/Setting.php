<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $table = 'pengaturan';

    protected $primaryKey = 'id_pengaturan';

    protected $fillable = [
        'nama_usaha',
        'email',
        'no_telepon',
        'alamat',
        'jam_buka',
        'jam_tutup',
        'durasi_minimum',
        'deposit',
        'denda_per_hari',
        'notifikasi_email',
        'notifikasi_whatsapp',
        'pengingat_pengembalian',
    ];

    protected function casts(): array
    {
        return [
            'durasi_minimum' => 'integer',
            'deposit' => 'decimal:2',
            'denda_per_hari' => 'decimal:2',
            'notifikasi_email' => 'boolean',
            'notifikasi_whatsapp' => 'boolean',
            'pengingat_pengembalian' => 'boolean',
        ];
    }

    /**
     * Settings are a singleton row. Create it with sensible defaults on first use.
     */
    public static function current(): self
    {
        return static::query()->firstOrCreate([], [
            'nama_usaha' => 'Kamera Kita',
            'email' => null,
            'no_telepon' => null,
            'alamat' => null,
            'jam_buka' => '09:00',
            'jam_tutup' => '20:00',
            'durasi_minimum' => 1,
            'deposit' => 0,
            'denda_per_hari' => 0,
            'notifikasi_email' => true,
            'notifikasi_whatsapp' => false,
            'pengingat_pengembalian' => true,
        ]);
    }

    /**
     * Stable shape consumed by the frontend contract.
     *
     * @return array<string, mixed>
     */
    public function toContract(): array
    {
        return [
            'nama_usaha' => $this->nama_usaha,
            'email' => $this->email,
            'no_telepon' => $this->no_telepon,
            'alamat' => $this->alamat,
            'jam_buka' => $this->jam_buka,
            'jam_tutup' => $this->jam_tutup,
            'durasi_minimum' => (int) $this->durasi_minimum,
            'deposit' => (float) $this->deposit,
            'denda_per_hari' => (float) $this->denda_per_hari,
            'notifikasi_email' => (bool) $this->notifikasi_email,
            'notifikasi_whatsapp' => (bool) $this->notifikasi_whatsapp,
            'pengingat_pengembalian' => (bool) $this->pengingat_pengembalian,
        ];
    }
}
