<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\UpdateParentalControlRequest;
use App\Http\Requests\Api\UpdateSafebrowsingRequest;
use App\Services\AdGuardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class DashboardController extends Controller
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
            $data = $this->adGuard->getDashboardData();
            return $this->success($data, 'Data dashboard berhasil dimuat.');
        } catch (\App\Exceptions\AdGuardApiException $e) {
            Log::warning('Dashboard API error', [
                'user_id' => $user->id,
                'code' => $e->getErrorCode(),
                'message' => $e->getMessage(),
            ]);

            if ($e->getErrorCode() === 'ADGUARD_UNAUTHORIZED') {
                $this->adGuard->forgetDashboardCache();
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

        if (!$this->setupAdGuardService($request, $this->adGuard)) {
            return $this->error('Kunci API tidak ditemukan.', 'API_KEY_REQUIRED', 403);
        }

        $key = $request->input('key');
        $value = $request->boolean('value');

        $lock = Cache::lock("dns_settings:{$user->id}", config('adguard.cache_lock_ttl', 20));
        if (!$lock->get()) {
            return $this->error('Mohon tunggu, pengaturan sedang diperbarui.', 'LOCK_TIMEOUT', 429);
        }

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
                $this->adGuard->forgetDashboardCache();
                $user->clearAdguardApiKey();
            }

            return $this->error($e->getMessage(), $e->getErrorCode(), $e->getStatusCode());
        } catch (\Exception $e) {
            Log::error('Safebrowsing update error', [
                'user_id' => $user->id,
                'key' => $key,
                'error' => $e->getMessage(),
            ]);

            return $this->error(
                'Gagal memperbarui pengaturan. Silakan coba lagi.',
                'DASHBOARD_ERROR',
                500
            );
        } finally {
            $lock->release();
        }
    }

    public function listServices(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$this->setupAdGuardService($request, $this->adGuard)) {
            return $this->error('Kunci API tidak ditemukan.', 'API_KEY_REQUIRED', 403);
        }

        try {
            $services = $this->adGuard->getWebServices();
            return $this->success($services, 'Daftar layanan berhasil dimuat.');
        } catch (\App\Exceptions\AdGuardApiException $e) {
            Log::warning('Dashboard services error', [
                'user_id' => $user->id,
                'code' => $e->getErrorCode(),
                'message' => $e->getMessage(),
            ]);

            if ($e->getErrorCode() === 'ADGUARD_UNAUTHORIZED') {
                $user->clearAdguardApiKey();
            }

            return $this->error($e->getMessage(), $e->getErrorCode(), $e->getStatusCode());
        } catch (\Exception $e) {
            Log::error('Dashboard services unexpected error', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);

            return $this->error(
                'Gagal memuat daftar layanan. Silakan coba lagi.',
                'DASHBOARD_ERROR',
                500
            );
        }
    }

    public function updateParentalControl(UpdateParentalControlRequest $request): JsonResponse
    {
        $user = $request->user();

        if (!$this->setupAdGuardService($request, $this->adGuard)) {
            return $this->error('Kunci API tidak ditemukan.', 'API_KEY_REQUIRED', 403);
        }

        $key = $request->input('key');
        $value = $request->input('value');

        $lock = Cache::lock("dns_settings:{$user->id}", config('adguard.cache_lock_ttl', 20));
        if (!$lock->get()) {
            return $this->error('Mohon tunggu, pengaturan sedang diperbarui.', 'LOCK_TIMEOUT', 429);
        }

        try {
            $dnsServer = $this->adGuard->getDefaultDnsServer();

            if (!$dnsServer || !isset($dnsServer['id'])) {
                return $this->error('Tidak ditemukan server DNS.', 'DNS_SERVER_MISSING', 404);
            }

            $dnsServerId = $dnsServer['id'];
            $currentSettings = $dnsServer['settings'] ?? [];
            $currentParental = $currentSettings['parental_control_settings'] ?? [];

            if ($key === 'blocked_service') {
                $serviceId = $value['id'] ?? '';
                $serviceEnabled = filter_var($value['enabled'] ?? false, FILTER_VALIDATE_BOOLEAN);
                $blockedServices = $currentParental['blocked_services'] ?? [];

                $found = false;
                foreach ($blockedServices as &$service) {
                    if (isset($service['id']) && $service['id'] === $serviceId) {
                        $service['enabled'] = $serviceEnabled;
                        $found = true;
                        break;
                    }
                }
                unset($service);

                if (!$found) {
                    $blockedServices[] = ['id' => $serviceId, 'enabled' => $serviceEnabled];
                }

                $currentParental['blocked_services'] = $blockedServices;
            } elseif ($key === 'service_group') {
                $group = $value['group'] ?? '';
                $groupEnabled = filter_var($value['enabled'] ?? false, FILTER_VALIDATE_BOOLEAN);
                $groupServices = $this->adGuard->getGroupServices($group);

                if (empty($groupServices)) {
                    return $this->error('Grup layanan tidak valid.', 'INVALID_GROUP', 400);
                }

                $blockedServices = $currentParental['blocked_services'] ?? [];

                foreach ($groupServices as $serviceId) {
                    $found = false;
                    foreach ($blockedServices as &$svc) {
                        if (isset($svc['id']) && $svc['id'] === $serviceId) {
                            $svc['enabled'] = $groupEnabled;
                            $found = true;
                            break;
                        }
                    }
                    unset($svc);

                    if (!$found) {
                        $blockedServices[] = ['id' => $serviceId, 'enabled' => $groupEnabled];
                    }
                }

                $currentParental['blocked_services'] = $blockedServices;
            } else {
                $currentParental[$key] = filter_var($value, FILTER_VALIDATE_BOOLEAN);
            }

            $updatePayload = [
                'parental_control_settings' => $currentParental,
            ];

            $merged = array_merge($currentSettings, $updatePayload);
            $this->adGuard->updateDnsServerSettings($dnsServerId, $merged);
            $this->adGuard->forgetDashboardCache();

            return $this->success([
                'key' => $key,
                'value' => $value,
            ], 'Pengaturan parental control berhasil diperbarui.');
        } catch (\App\Exceptions\AdGuardApiException $e) {
            Log::warning('Parental control update error', [
                'user_id' => $user->id,
                'key' => $key,
                'code' => $e->getErrorCode(),
                'message' => $e->getMessage(),
            ]);

            if ($e->getErrorCode() === 'ADGUARD_UNAUTHORIZED') {
                $this->adGuard->forgetDashboardCache();
                $user->clearAdguardApiKey();
            }

            return $this->error($e->getMessage(), $e->getErrorCode(), $e->getStatusCode());
        } catch (\Exception $e) {
            Log::error('Parental control update error', [
                'user_id' => $user->id,
                'key' => $key,
                'error' => $e->getMessage(),
            ]);

            return $this->error(
                'Gagal memperbarui pengaturan parental control. Silakan coba lagi.',
                'DASHBOARD_ERROR',
                500
            );
        } finally {
            $lock->release();
        }
    }
}
