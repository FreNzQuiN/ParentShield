<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreDeviceRequest;
use App\Http\Requests\Api\UpdateDeviceRequest;
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

        if (!$this->setupAdGuardService($request, $this->adGuard)) {
            return $this->error('Kunci API tidak ditemukan.', 'API_KEY_REQUIRED', 403);
        }

        try {
            $devices = $this->adGuard->getDevices();
            $limits = $this->adGuard->getAccountLimits();

            $now = now()->valueOf();
            $timeFrom = $now - config('adguard.stats_window_ms', 86400000);
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
        } catch (\Throwable $e) {
            Log::error('Device list unexpected error', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);

            return $this->error('Terjadi kesalahan yang tidak terduga.', 'INTERNAL_ERROR', 500);
        }
    }

    public function store(StoreDeviceRequest $request): JsonResponse
    {
        $user = $request->user();

        if (!$this->setupAdGuardService($request, $this->adGuard)) {
            return $this->error('Kunci API tidak ditemukan.', 'API_KEY_REQUIRED', 403);
        }

        $validated = $request->validated();

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
        } catch (\Throwable $e) {
            Log::error('Device create unexpected error', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);

            return $this->error('Terjadi kesalahan yang tidak terduga.', 'INTERNAL_ERROR', 500);
        }
    }

    public function show(Request $request, string $deviceId): JsonResponse
    {
        $user = $request->user();

        if (!$this->setupAdGuardService($request, $this->adGuard)) {
            return $this->error('Kunci API tidak ditemukan.', 'API_KEY_REQUIRED', 403);
        }

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
        } catch (\Throwable $e) {
            Log::error('Device detail unexpected error', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);

            return $this->error('Terjadi kesalahan yang tidak terduga.', 'INTERNAL_ERROR', 500);
        }
    }

    public function update(UpdateDeviceRequest $request, string $deviceId): JsonResponse
    {
        $user = $request->user();

        if (!$this->setupAdGuardService($request, $this->adGuard)) {
            return $this->error('Kunci API tidak ditemukan.', 'API_KEY_REQUIRED', 403);
        }

        $validated = $request->validated();

        try {
            $device = $this->adGuard->getDevice($deviceId);

            $success = $this->adGuard->updateDevice($deviceId, [
                'name' => $validated['name'],
            ]);

            if (!$success) {
                return $this->error('Gagal memperbarui perangkat.', 'DEVICE_UPDATE_FAILED', 400);
            }

            $this->adGuard->forgetDashboardCache();

            return $this->success([
                'id' => $deviceId,
                'name' => $validated['name'],
                'device_type' => $device['device_type'] ?? 'unknown',
            ], 'Nama perangkat berhasil diperbarui.');
        } catch (\App\Exceptions\AdGuardApiException $e) {
            Log::warning('Device update error', ['user_id' => $user->id, 'code' => $e->getErrorCode()]);

            if ($e->getErrorCode() === 'ADGUARD_UNAUTHORIZED') {
                $this->adGuard->forgetDashboardCache();
                $user->clearAdguardApiKey();
            }

            return $this->error($e->getMessage(), $e->getErrorCode(), $e->getStatusCode());
        } catch (\Throwable $e) {
            Log::error('Device update unexpected error', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);

            return $this->error('Terjadi kesalahan yang tidak terduga.', 'INTERNAL_ERROR', 500);
        }
    }

    public function destroy(Request $request, string $deviceId): JsonResponse
    {
        $user = $request->user();

        if (!$this->setupAdGuardService($request, $this->adGuard)) {
            return $this->error('Kunci API tidak ditemukan.', 'API_KEY_REQUIRED', 403);
        }

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
        } catch (\Throwable $e) {
            Log::error('Device delete unexpected error', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);

            return $this->error('Terjadi kesalahan yang tidak terduga.', 'INTERNAL_ERROR', 500);
        }
    }

    public function downloadMobileConfig(Request $request, string $deviceId): \Illuminate\Http\Response|\Illuminate\Http\JsonResponse
    {
        $user = $request->user();

        if (!$this->setupAdGuardService($request, $this->adGuard)) {
            return $this->error('Kunci API tidak ditemukan.', 'API_KEY_REQUIRED', 403);
        }

        try {
            $device = $this->adGuard->getDevice($deviceId);

            if (!$device) {
                return $this->error('Perangkat tidak ditemukan.', 'DEVICE_NOT_FOUND', 404);
            }

            $mobileConfig = $this->adGuard->getMobileConfigRaw($deviceId);
            $deviceName = preg_replace('/[^a-zA-Z0-9_-]/', '_', $device['name']);

            return response($mobileConfig, 200, [
                'Content-Type' => 'application/x-apple-aspen-config',
                'Content-Disposition' => 'attachment; filename="adguard-dns-' . $deviceName . '.mobileconfig"',
            ]);
        } catch (\App\Exceptions\AdGuardApiException $e) {
            Log::warning('Device mobileconfig error', ['user_id' => $user->id, 'code' => $e->getErrorCode()]);

            if ($e->getErrorCode() === 'ADGUARD_UNAUTHORIZED') {
                $user->clearAdguardApiKey();
            }

            return $this->error($e->getMessage(), $e->getErrorCode(), $e->getStatusCode());
        } catch (\Throwable $e) {
            Log::error('Device mobileconfig unexpected error', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);

            return $this->error('Terjadi kesalahan saat mengunduh konfigurasi.', 'INTERNAL_ERROR', 500);
        }
    }
}
