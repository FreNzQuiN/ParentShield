<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AdGuardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;

class DashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $encryptedKey = $user->adguard_api_key_encrypted;
        if (!$encryptedKey) {
            return $this->error(
                'API key not configured. Please set up your AdGuard API key.',
                'API_KEY_REQUIRED',
                403
            );
        }

        try {
            $apiKey = Crypt::decryptString($encryptedKey);
        } catch (\Exception $e) {
            return $this->error(
                'Failed to decrypt API key. Please reconfigure your API key.',
                'API_KEY_DECRYPT_ERROR',
                500
            );
        }

        $adGuard = new AdGuardService($apiKey);

        try {
            $data = $adGuard->getDashboardData();
            return $this->success($data, 'Dashboard data retrieved.');
        } catch (\App\Exceptions\AdGuardApiException $e) {
            $errorCode = $e->getCode();

            if ($errorCode === 'ADGUARD_UNAUTHORIZED') {
                $user->adguard_api_key_verified_at = null;
                $user->save();
            }

            return $this->error($e->getMessage(), $errorCode, $e->getStatusCode());
        } catch (\Exception $e) {
            return $this->error(
                'Failed to fetch dashboard data: ' . $e->getMessage(),
                'DASHBOARD_ERROR',
                500
            );
        }
    }

    public function updateSafebrowsing(Request $request): JsonResponse
    {
        $user = $request->user();

        $encryptedKey = $user->adguard_api_key_encrypted;
        if (!$encryptedKey) {
            return $this->error(
                'API key not configured.',
                'API_KEY_REQUIRED',
                403
            );
        }

        $validKeys = ['safe_search_enabled', 'block_dangerous_enabled', 'block_nrd_enabled'];
        $key = $request->input('key');
        $value = $request->boolean('value');

        if (!in_array($key, $validKeys, true)) {
            return $this->error('Invalid setting key.', 'INVALID_KEY', 422);
        }

        try {
            $apiKey = Crypt::decryptString($encryptedKey);
        } catch (\Exception $e) {
            return $this->error(
                'Failed to decrypt API key.',
                'API_KEY_DECRYPT_ERROR',
                500
            );
        }

        $adGuard = new AdGuardService($apiKey);

        try {
            $dnsServers = $adGuard->getDnsServers();
            $dnsServerId = $dnsServers[0]['id'] ?? null;

            if (!$dnsServerId) {
                return $this->error('No DNS server found.', 'DNS_SERVER_MISSING', 404);
            }

            $currentSettings = $adGuard->getDnsServerSettings($dnsServerId);

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

            // Merge with existing settings to preserve others
            $merged = array_merge($currentSettings, $updatePayload);

            $adGuard->updateDnsServerSettings($dnsServerId, $merged);

            return $this->success([
                'key' => $key,
                'value' => $value,
            ], 'Setting updated successfully.');
        } catch (\App\Exceptions\AdGuardApiException $e) {
            $errorCode = $e->getCode();

            if ($errorCode === 'ADGUARD_UNAUTHORIZED') {
                $user->adguard_api_key_verified_at = null;
                $user->save();
            }

            return $this->error($e->getMessage(), $errorCode, $e->getStatusCode());
        } catch (\Exception $e) {
            return $this->error(
                'Failed to fetch dashboard data: ' . $e->getMessage(),
                'DASHBOARD_ERROR',
                500
            );
        }
    }
}
