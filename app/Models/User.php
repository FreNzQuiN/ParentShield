<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Log;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'adguard_api_key_encrypted',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'adguard_api_key_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function getDecryptedAdguardKey(): ?string
    {
        if (!$this->adguard_api_key_encrypted) {
            return null;
        }

        try {
            return Crypt::decryptString($this->adguard_api_key_encrypted);
        } catch (\Exception $e) {
            Log::warning('Gagal mendekripsi kunci API AdGuard', [
                'user_id' => $this->id,
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }

    public function clearAdguardApiKey(): void
    {
        $this->adguard_api_key_verified_at = null;
        $this->adguard_api_key_encrypted = null;
        $this->save();
    }

    public function getHasApiKeyAttribute(): bool
    {
        return $this->adguard_api_key_verified_at !== null
            && $this->adguard_api_key_encrypted !== null;
    }
}
