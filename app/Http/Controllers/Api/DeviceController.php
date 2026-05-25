<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AdGuardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class DeviceController extends Controller
{
    public function __construct(
        private readonly AdGuardService $adGuard
    ) {}

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $apiKey = $user->getDecryptedAdguardKey();

        if (!$apiKey) {
            return $this->error('Kunci API tidak ditemukan.', 'API_KEY_REQUIRED', 403);
        }

        $this->adGuard->setApiKey($apiKey);

        try {
            $devices = $this->adGuard->getDevices();
            $limits = $this->adGuard->getAccountLimits();

            $now = now()->valueOf();
            $timeFrom = $now - 86400000;
            $deviceStats = $this->adGuard->getDeviceStats($timeFrom, $now);
            $deviceLastSeen = [];
            foreach (($deviceStats['stats'] ?? []) as $ds) {
                if (isset($ds['device_id']) && isset($ds['last_activity_time_millis'])) {
                    $deviceLastSeen[$ds['device_id']] = $ds['last_activity_time_millis'];
                }
            }

            $enrichedDevices = array_map(function ($device) use ($deviceLastSeen) {
                $deviceId = $device['id'] ?? '';
                return [
                    'id' => $deviceId,
                    'name' => $device['name'] ?? 'Unknown',
                    'device_type' => $device['device_type'] ?? 'unknown',
                    'dns_addresses' => $device['dns_addresses'] ?? null,
                    'last_seen' => $deviceLastSeen[$deviceId] ?? null,
                ];
            }, $devices);

            return $this->success([
                'devices' => $enrichedDevices,
                'account_limits' => $limits,
            ], 'Daftar perangkat berhasil dimuat.');
        } catch (\App\Exceptions\AdGuardApiException $e) {
            Log::warning('Devices list error', ['user_id' => $user->id, 'code' => $e->getErrorCode()]);

            if ($e->getErrorCode() === 'ADGUARD_UNAUTHORIZED') {
                $this->adGuard->forgetDashboardCache();
                $user->clearAdguardApiKey();
            }

            return $this->error($e->getMessage(), $e->getErrorCode(), $e->getStatusCode());
        }
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();
        $apiKey = $user->getDecryptedAdguardKey();

        if (!$apiKey) {
            return $this->error('Kunci API tidak ditemukan.', 'API_KEY_REQUIRED', 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:64',
            'device_type' => 'required|string|in:ANDROID,IOS,WINDOWS',
        ]);

        $this->adGuard->setApiKey($apiKey);

        try {
            $dnsServerId = $this->adGuard->getDefaultDnsServerId();

            if (!$dnsServerId) {
                return $this->error('Tidak ditemukan server DNS.', 'DNS_SERVER_MISSING', 404);
            }

            $device = $this->adGuard->createDevice(
                $validated['name'],
                $validated['device_type'],
                $dnsServerId
            );

            $this->adGuard->forgetDashboardCache();

            return $this->success([
                'id' => $device['id'],
                'name' => $device['name'],
                'device_type' => $device['device_type'],
                'dns_addresses' => [
                    'dns_over_tls_url' => ($device['dns_addresses'] ?? [])['dns_over_tls_url'] ?? null,
                    'dns_over_https_url' => ($device['dns_addresses'] ?? [])['dns_over_https_url'] ?? null,
                ],
            ], 'Perangkat berhasil dibuat.');
        } catch (\App\Exceptions\AdGuardApiException $e) {
            Log::warning('Device create error', ['user_id' => $user->id, 'code' => $e->getErrorCode()]);

            if ($e->getErrorCode() === 'ADGUARD_UNAUTHORIZED') {
                $this->adGuard->forgetDashboardCache();
                $user->clearAdguardApiKey();
            }

            return $this->error($e->getMessage(), $e->getErrorCode(), $e->getStatusCode());
        }
    }

    public function show(Request $request, string $deviceId): JsonResponse
    {
        $user = $request->user();
        $apiKey = $user->getDecryptedAdguardKey();

        if (!$apiKey) {
            return $this->error('Kunci API tidak ditemukan.', 'API_KEY_REQUIRED', 403);
        }

        $this->adGuard->setApiKey($apiKey);

        try {
            $device = $this->adGuard->getDevice($deviceId);

            if (!$device) {
                return $this->error('Perangkat tidak ditemukan.', 'DEVICE_NOT_FOUND', 404);
            }

            return $this->success([
                'id' => $device['id'],
                'name' => $device['name'],
                'device_type' => $device['device_type'],
                'dns_addresses' => [
                    'dns_over_tls_url' => ($device['dns_addresses'] ?? [])['dns_over_tls_url'] ?? null,
                    'dns_over_https_url' => ($device['dns_addresses'] ?? [])['dns_over_https_url'] ?? null,
                ],
            ], 'Detail perangkat berhasil dimuat.');
        } catch (\App\Exceptions\AdGuardApiException $e) {
            Log::warning('Device show error', ['user_id' => $user->id, 'code' => $e->getErrorCode()]);

            if ($e->getErrorCode() === 'ADGUARD_UNAUTHORIZED') {
                $this->adGuard->forgetDashboardCache();
                $user->clearAdguardApiKey();
            }

            return $this->error($e->getMessage(), $e->getErrorCode(), $e->getStatusCode());
        }
    }

    public function update(Request $request, string $deviceId): JsonResponse
    {
        $user = $request->user();
        $apiKey = $user->getDecryptedAdguardKey();

        if (!$apiKey) {
            return $this->error('Kunci API tidak ditemukan.', 'API_KEY_REQUIRED', 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:64',
        ]);

        $this->adGuard->setApiKey($apiKey);

        try {
            $success = $this->adGuard->updateDevice($deviceId, [
                'name' => $validated['name'],
            ]);

            if (!$success) {
                return $this->error('Gagal memperbarui perangkat.', 'DEVICE_UPDATE_FAILED', 400);
            }

            $this->adGuard->forgetDashboardCache();

            $updated = ['id' => $deviceId, 'name' => $validated['name'], 'device_type' => 'unknown'];

            try {
                $device = $this->adGuard->getDevice($deviceId);
                $updated['name'] = $device['name'] ?? $validated['name'];
                $updated['device_type'] = $device['device_type'] ?? 'unknown';
            } catch (\Exception $e) {
                Log::warning('Device re-fetch after update failed', ['device_id' => $deviceId]);
            }

            return $this->success($updated, 'Nama perangkat berhasil diperbarui.');
        } catch (\App\Exceptions\AdGuardApiException $e) {
            Log::warning('Device update error', ['user_id' => $user->id, 'code' => $e->getErrorCode()]);

            if ($e->getErrorCode() === 'ADGUARD_UNAUTHORIZED') {
                $this->adGuard->forgetDashboardCache();
                $user->clearAdguardApiKey();
            }

            return $this->error($e->getMessage(), $e->getErrorCode(), $e->getStatusCode());
        }
    }

    public function destroy(Request $request, string $deviceId): JsonResponse
    {
        $user = $request->user();
        $apiKey = $user->getDecryptedAdguardKey();

        if (!$apiKey) {
            return $this->error('Kunci API tidak ditemukan.', 'API_KEY_REQUIRED', 403);
        }

        $this->adGuard->setApiKey($apiKey);

        try {
            $success = $this->adGuard->deleteDevice($deviceId);

            if (!$success) {
                return $this->error('Gagal menghapus perangkat.', 'DEVICE_DELETE_FAILED', 400);
            }

            $this->adGuard->forgetDashboardCache();

            return $this->success(null, 'Perangkat berhasil dihapus.');
        } catch (\App\Exceptions\AdGuardApiException $e) {
            Log::warning('Device delete error', ['user_id' => $user->id, 'code' => $e->getErrorCode()]);

            if ($e->getErrorCode() === 'ADGUARD_UNAUTHORIZED') {
                $this->adGuard->forgetDashboardCache();
                $user->clearAdguardApiKey();
            }

            return $this->error($e->getMessage(), $e->getErrorCode(), $e->getStatusCode());
        }
    }

    public function downloadMobileConfig(Request $request, string $deviceId): \Illuminate\Http\Response|\Illuminate\Http\JsonResponse
    {
        $user = $request->user();
        $apiKey = $user->getDecryptedAdguardKey();

        if (!$apiKey) {
            return response()->json([
                'success' => false,
                'code' => 'API_KEY_REQUIRED',
                'message' => 'Kunci API tidak ditemukan.',
            ], 403);
        }

        $this->adGuard->setApiKey($apiKey);

        try {
            $device = $this->adGuard->getDevice($deviceId);

            if (!$device) {
                return response()->json([
                    'success' => false,
                    'code' => 'DEVICE_NOT_FOUND',
                    'message' => 'Perangkat tidak ditemukan.',
                ], 404);
            }

            $adguardResponse = $this->adGuard->getMobileConfigRaw($deviceId);
            $deviceName = preg_replace('/[^a-zA-Z0-9_-]/', '_', $device['name']);

            return response($adguardResponse->body(), 200, [
                'Content-Type' => 'application/x-apple-aspen-config',
                'Content-Disposition' => 'attachment; filename="adguard-dns-' . $deviceName . '.mobileconfig"',
            ]);
        } catch (\App\Exceptions\AdGuardApiException $e) {
            Log::warning('Device mobileconfig error', ['user_id' => $user->id, 'code' => $e->getErrorCode()]);

            if ($e->getErrorCode() === 'ADGUARD_UNAUTHORIZED') {
                $user->clearAdguardApiKey();
            }

            return response()->json([
                'success' => false,
                'code' => $e->getErrorCode(),
                'message' => $e->getMessage(),
            ], $e->getStatusCode());
        }
    }
}
