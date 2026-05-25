<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\AdGuardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Log;

class SetupApiKeyController extends Controller
{
    public function __construct(
        private readonly AdGuardService $adGuard
    ) {}

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'api_key' => ['required', 'string'],
        ], [
            'api_key.required' => 'Kunci API wajib diisi.',
        ]);

        $apiKey = $request->input('api_key');
        $this->adGuard->setApiKey($apiKey);

        try {
            $isValid = $this->adGuard->verifyApiKey();
        } catch (\Exception $e) {
            Log::error('Setup API key verification failed', [
                'user_id' => $request->user()->id,
                'error' => $e->getMessage(),
            ]);

            return $this->error(
                'Tidak dapat terhubung ke AdGuard DNS. Periksa koneksi Anda.',
                'ADGUARD_CONNECTION_ERROR',
                503
            );
        }

        if (!$isValid) {
            return $this->error(
                'Kunci API tidak valid. Periksa kembali kunci Anda.',
                'INVALID_API_KEY',
                422
            );
        }

        $user = $request->user();
        $user->adguard_api_key_encrypted = Crypt::encryptString($apiKey);
        $user->adguard_api_key_verified_at = now();
        $user->save();

        return $this->success([
            'has_api_key' => true,
        ], 'Kunci API berhasil diverifikasi dan disimpan.');
    }

    public function status(Request $request): JsonResponse
    {
        $user = $request->user();

        return $this->success([
            'has_api_key' => $user->adguard_api_key_verified_at !== null,
        ]);
    }
}
