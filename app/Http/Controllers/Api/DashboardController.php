<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\UpdateSafebrowsingRequest;
use App\Services\AdGuardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class DashboardController extends Controller
{
    public function __construct(
        private readonly AdGuardService $adGuard
    ) {}

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $apiKey = $user->getDecryptedAdguardKey();

        if (!$apiKey) {
            return $this->error(
                'Kunci API tidak ditemukan. Silakan atur ulang kunci API AdGuard Anda.',
                'API_KEY_REQUIRED',
                403
            );
        }

        $this->adGuard->setApiKey($apiKey);

        try {
            $data = $this->adGuard->getDashboardData();
            return $this->success($data, 'Data dashboard berhasil dimuat.');
        } catch (\App\Exceptions\AdGuardApiException $e) {
            Log::warning('Dashboard API error', [
                'user_id' => $user->id,
                'code' => $e->getErrorCode(),
                'message' => $e->getMessage(),
            ]);

            if ($e->getErrorCode() === 'ADGUARD_UNAUTHORIZED') {
                $user->clearAdguardApiKey();
            }

            return $this->error($e->getMessage(), $e->getErrorCode(), $e->getStatusCode());
        } catch (\Exception $e) {
            Log::error('Dashboard unexpected error', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);

            return $this->error(
                'Gagal memuat data dashboard. Silakan coba lagi.',
                'DASHBOARD_ERROR',
                500
            );
        }
    }

    public function updateSafebrowsing(UpdateSafebrowsingRequest $request): JsonResponse
    {
        $user = $request->user();
        $apiKey = $user->getDecryptedAdguardKey();

        if (!$apiKey) {
            return $this->error(
                'Kunci API tidak ditemukan.',
                'API_KEY_REQUIRED',
                403
            );
        }

        $key = $request->input('key');
        $value = $request->boolean('value');

        $this->adGuard->setApiKey($apiKey);

        try {
            $dnsServer = $this->adGuard->getDefaultDnsServer();

            if (!$dnsServer || !isset($dnsServer['id'])) {
                return $this->error('Tidak ditemukan server DNS.', 'DNS_SERVER_MISSING', 404);
            }

            $dnsServerId = $dnsServer['id'];
            $currentSettings = $dnsServer['settings'] ?? [];

            $updatePayload = match ($key) {
                'safe_search_enabled' => [
                    'parental_control_settings' => array_merge(
                        $currentSettings['parental_control_settings'] ?? [],
                        [
                            'engines_safe_search_enabled' => $value,
                            'youtube_safe_search_enabled' => $value,
                        ]
                    ),
                ],
                'block_dangerous_enabled' => [
                    'safebrowsing_settings' => array_merge(
                        $currentSettings['safebrowsing_settings'] ?? [],
                        [
                            'enabled' => $value,
                            'block_dangerous_domains' => $value,
                        ]
                    ),
                ],
                'block_nrd_enabled' => [
                    'safebrowsing_settings' => array_merge(
                        $currentSettings['safebrowsing_settings'] ?? [],
                        ['block_nrd' => $value]
                    ),
                ],
                default => [],
            };

            $merged = array_merge($currentSettings, $updatePayload);
            $this->adGuard->updateDnsServerSettings($dnsServerId, $merged);

            $this->adGuard->forgetDashboardCache();

            return $this->success([
                'key' => $key,
                'value' => $value,
            ], 'Pengaturan berhasil diperbarui.');
        } catch (\App\Exceptions\AdGuardApiException $e) {
            Log::warning('Safebrowsing update error', [
                'user_id' => $user->id,
                'key' => $key,
                'code' => $e->getErrorCode(),
                'message' => $e->getMessage(),
            ]);

            if ($e->getErrorCode() === 'ADGUARD_UNAUTHORIZED') {
                $user->clearAdguardApiKey();
            }

            return $this->error($e->getMessage(), $e->getErrorCode(), $e->getStatusCode());
        } catch (\Exception $e) {
            Log::error('Safebrowsing unexpected error', [
                'user_id' => $user->id,
                'key' => $key,
                'error' => $e->getMessage(),
            ]);

            return $this->error(
                'Gagal memperbarui pengaturan. Silakan coba lagi.',
                'DASHBOARD_ERROR',
                500
            );
        }
    }
}
