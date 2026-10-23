<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('pengaturan', function (Blueprint $table) {
            $table->id('id_pengaturan');
            $table->string('nama_usaha', 150)->default('Kamera Kita');
            $table->string('email', 150)->nullable();
            $table->string('no_telepon', 30)->nullable();
            $table->text('alamat')->nullable();
            $table->string('jam_buka', 5)->default('09:00');
            $table->string('jam_tutup', 5)->default('20:00');
            $table->unsignedSmallInteger('durasi_minimum')->default(1);
            $table->decimal('deposit', 12, 2)->default(0);
            $table->decimal('denda_per_hari', 12, 2)->default(0);
            $table->boolean('notifikasi_email')->default(true);
            $table->boolean('notifikasi_whatsapp')->default(false);
            $table->boolean('pengingat_pengembalian')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pengaturan');
    }
};
