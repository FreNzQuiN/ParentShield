<?php

namespace App\Services;

use App\Exceptions\AdGuardApiException;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AdGuardService
{
    private const DEVICE_ONLINE_THRESHOLD_MS = 300000;
    private const DASHBOARD_CACHE_TTL_SECONDS = 30;

    private string $baseUrl;
    private ?string $apiKey;

    public function __construct(?string $apiKey = null)
    {
        $this->baseUrl = config('services.adguard.base_url');
        $this->apiKey = $apiKey;
    }

    public function setApiKey(string $apiKey): self
    {
        $this->apiKey = $apiKey;
        return $this;
    }

    public function getDashboardData(): array
    {
        $cacheKey = 'adguard_dashboard_' . md5($this->apiKey ?? '');

        return Cache::remember($cacheKey, self::DASHBOARD_CACHE_TTL_SECONDS, function () {
            return $this->fetchDashboardData();
        });
    }

    private function fetchDashboardData(): array
    {
        $now = now();
        $twentyFourHoursAgo = $now->copy()->subDay();

        $timeFrom = $twentyFourHoursAgo->valueOf();
        $timeTo = $now->valueOf();

        $timeStats = $this->getTimeStats($timeFrom, $timeTo);
        $categoryStats = $this->getCategoryStats($timeFrom, $timeTo);
        $devices = $this->getDevices();
        $limits = $this->getAccountLimits();
        $dnsServers = $this->getDnsServers();
        $deviceStats = $this->getDeviceStats($timeFrom, $timeTo);

        $dnsServerId = $dnsServers[0]['id'] ?? null;
        $settings = $dnsServerId ? $this->getDnsServerSettings($dnsServerId) : null;

        $totalQueries = 0;
        $blockedCount = 0;
        $timeSeries = [];
        $blockedCategories = [];

        if ($timeStats) {
            $statsList = $timeStats['stats'] ?? [];
            foreach ($statsList as $hour) {
                $value = $hour['value'] ?? [];
                $totalQueries += ($value['queries'] ?? 0) + ($value['blocked'] ?? 0);
                $blockedCount += $value['blocked'] ?? 0;
                $timeSeries[] = [
                    'hour' => $hour['time_millis'] ?? 0,
                    'allowed' => $value['queries'] ?? 0,
                    'blocked' => $value['blocked'] ?? 0,
                ];
            }
        }

        if ($categoryStats) {
            $statsList = $categoryStats['stats'] ?? [];
            $totalCats = array_sum(array_column($statsList, 'queries')) ?: 1;
            foreach ($statsList as $cat) {
                $count = $cat['queries'] ?? 0;
                $blockedCategories[] = [
                    'name' => $cat['category_type'] ?? 'Unknown',
                    'count' => $count,
                    'percentage' => round(($count / $totalCats) * 100, 1),
                ];
            }
            usort($blockedCategories, fn($a, $b) => $b['count'] - $a['count']);
        }

        $activeDevices = 0;
        $deviceList = [];
        if ($devices) {
            $deviceLastSeen = [];
            foreach (($deviceStats['stats'] ?? []) as $ds) {
                if (isset($ds['device_id']) && isset($ds['last_activity_time_millis'])) {
                    $deviceLastSeen[$ds['device_id']] = $ds['last_activity_time_millis'];
                }
            }

            foreach ($devices as $device) {
                $deviceId = $device['id'] ?? '';
                $lastSeen = $deviceLastSeen[$deviceId] ?? null;
                $isOnline = $lastSeen && ($now->valueOf() - $lastSeen) < self::DEVICE_ONLINE_THRESHOLD_MS;

                if ($isOnline) {
                    $activeDevices++;
                }

                $deviceList[] = [
                    'id' => $deviceId,
                    'name' => $device['name'] ?? 'Unknown',
                    'device_type' => $device['device_type'] ?? 'unknown',
                    'is_online' => $isOnline,
                    'last_seen' => $lastSeen,
                    'protection_enabled' => $device['settings']['protection_enabled'] ?? true,
                ];
            }
        }

        $safeSearchEnabled = false;
        $blockDangerousEnabled = false;
        $blockNrdEnabled = false;

        if ($settings) {
            $parentalSettings = $settings['parental_control_settings'] ?? [];
            $safebrowsingSettings = $settings['safebrowsing_settings'] ?? [];
            $safeSearchEnabled = !empty($parentalSettings['engines_safe_search_enabled'])
                || !empty($parentalSettings['youtube_safe_search_enabled']);
            $blockDangerousEnabled = !empty($safebrowsingSettings['block_dangerous_domains'])
                || !empty($safebrowsingSettings['enabled']);
            $blockNrdEnabled = !empty($safebrowsingSettings['block_nrd']);
        }

        return [
            'stats' => [
                'total_queries' => $totalQueries,
                'blocked_count' => $blockedCount,
                'blocked_categories' => array_slice(array_map(fn($c) => $c['name'], $blockedCategories), 0, 3),
                'active_devices' => $activeDevices,
            ],
            'time_series' => $timeSeries,
            'top_activities' => array_slice($this->getTopDomains($timeFrom, $timeTo), 0, 5),
            'categories_blocked' => array_slice($blockedCategories, 0, 5),
            'safebrowsing' => [
                'safe_search_enabled' => $safeSearchEnabled,
                'block_dangerous_enabled' => $blockDangerousEnabled,
                'block_nrd_enabled' => $blockNrdEnabled,
            ],
            'devices' => $deviceList,
            'account_limits' => [
                'devices' => [
                    'used' => count($devices),
                    'max' => $limits['devices']['max'] ?? 5,
                ],
            ],
        ];
    }

    public function verifyApiKey(): bool
    {
        try {
            $response = $this->get('/dns_servers');
            return $response->successful();
        } catch (AdGuardApiException $e) {
            if ($e->getErrorCode() === 'ADGUARD_UNAUTHORIZED') {
                return false;
            }
            throw $e;
        }
    }

    public function getDnsServers(): array
    {
        $response = $this->get('/dns_servers');
        return $response->json() ?? [];
    }

    public function getDnsServer(string $dnsServerId): ?array
    {
        $response = $this->get("/dns_servers/{$dnsServerId}");
        $data = $response->json();
        return is_array($data) ? $data : null;
    }

    public function getDnsServerSettings(string $dnsServerId): ?array
    {
        $server = $this->getDnsServer($dnsServerId);

        return $server['settings'] ?? null;
    }

    public function updateDnsServerSettings(string $dnsServerId, array $settings): bool
    {
        $response = $this->send('put', "/dns_servers/{$dnsServerId}/settings", $settings);
        return $response->successful();
    }

    public function getDevices(): array
    {
        $response = $this->get('/devices');
        return $response->json() ?? [];
    }

    public function getDeviceStats(int $timeFrom, int $timeTo): array
    {
        $response = $this->get('/stats/devices', [
            'time_from_millis' => $timeFrom,
            'time_to_millis' => $timeTo,
        ]);
        return $response->json() ?? [];
    }

    public function getTimeStats(int $timeFrom, int $timeTo): ?array
    {
        $response = $this->get('/stats/time', [
            'time_from_millis' => $timeFrom,
            'time_to_millis' => $timeTo,
        ]);
        $data = $response->json();
        return is_array($data) ? $data : null;
    }

    public function getCategoryStats(int $timeFrom, int $timeTo): ?array
    {
        $response = $this->get('/stats/categories', [
            'time_from_millis' => $timeFrom,
            'time_to_millis' => $timeTo,
        ]);
        $data = $response->json();
        return is_array($data) ? $data : null;
    }

    public function getDomainStats(int $timeFrom, int $timeTo): ?array
    {
        $response = $this->get('/stats/domains', [
            'time_from_millis' => $timeFrom,
            'time_to_millis' => $timeTo,
        ]);
        $data = $response->json();
        return is_array($data) ? $data : null;
    }

    public function getAccountLimits(): ?array
    {
        $response = $this->get('/account/limits');
        $data = $response->json();
        return is_array($data) ? $data : null;
    }

    private function getTopDomains(int $timeFrom, int $timeTo): array
    {
        $stats = $this->getDomainStats($timeFrom, $timeTo);
        $domains = $stats['stats'] ?? [];
        $total = array_sum(array_map(fn($d) => $d['value']['queries'] ?? 0, $domains)) ?: 1;
        usort($domains, fn($a, $b) => ($b['value']['queries'] ?? 0) - ($a['value']['queries'] ?? 0));
        return array_map(fn($d) => [
            'domain' => $d['domain'] ?? 'Unknown',
            'count' => $d['value']['queries'] ?? 0,
            'percentage' => round(($d['value']['queries'] ?? 0) / $total * 100, 1),
        ], $domains);
    }

    private function get(string $endpoint, array $query = []): Response
    {
        return $this->send('get', $endpoint, $query);
    }

    private function send(string $method, string $endpoint, array $data = []): Response
    {
        if (!$this->apiKey) {
            throw new AdGuardApiException('Kunci API tidak ditemukan.', 'API_KEY_MISSING', 401);
        }

        $url = $this->baseUrl . $endpoint;
        $method = strtolower($method);

        Log::debug("AdGuard API {$method}", ['url' => $url, 'data' => $data]);

        try {
            $response = Http::withHeaders([
                'Authorization' => 'ApiKey ' . $this->apiKey,
                'Accept' => 'application/json',
            ])->timeout(15)->{$method}($url, $data);
        } catch (ConnectionException $e) {
            throw new AdGuardApiException(
                'Layanan sedang sibuk, silakan coba beberapa saat lagi.',
                'ADGUARD_CONNECTION_ERROR',
                503
            );
        }

        if ($response->failed()) {
            $this->handleError($response, $url);
        }

        return $response;
    }

    private function handleError(Response $response, string $url): never
    {
        $status = $response->status();
        $body = $response->json();
        $errorMsg = $body['error_description'] ?? $body['message'] ?? $response->body();

        Log::error('AdGuard API error', [
            'url' => $url,
            'status' => $status,
            'response' => $errorMsg,
        ]);

        [$errorCode, $message, $httpStatus] = match ($status) {
            401 => ['ADGUARD_UNAUTHORIZED', 'Kunci API tidak valid atau telah kedaluwarsa. Silakan perbarui kunci API.', 401],
            405 => ['ADGUARD_METHOD_NOT_ALLOWED', 'Layanan AdGuard sedang sibuk.', 502],
            429 => ['ADGUARD_RATE_LIMITED', 'Terlalu banyak permintaan ke layanan AdGuard. Silakan tunggu beberapa saat.', 429],
            default => ['ADGUARD_API_ERROR', 'Layanan sedang sibuk, silakan coba beberapa saat lagi.', $status],
        };

        throw new AdGuardApiException($message, $errorCode, $httpStatus);
    }
}
