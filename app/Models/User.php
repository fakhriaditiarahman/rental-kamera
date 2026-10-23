<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['nama_pelanggan', 'no_telepon', 'alamat', 'password_hash', 'role'])]
#[Hidden(['password_hash', 'remember_token'])]
class User extends Authenticatable
{
    protected $table = 'pelanggan';

    protected $primaryKey = 'id_pelanggan';

    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
        ];
    }

    public function getAuthPassword(): string
    {
        return $this->password_hash;
    }

    public function getNameAttribute(): string
    {
        return $this->nama_pelanggan;
    }

    public function getPhoneAttribute(): string
    {
        return $this->no_telepon;
    }

    public function getAddressAttribute(): string
    {
        return $this->alamat;
    }

    public function rentals()
    {
        return $this->hasMany(Rental::class, 'id_pelanggan', 'id_pelanggan');
    }
}
