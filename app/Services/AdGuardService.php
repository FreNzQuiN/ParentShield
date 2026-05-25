<?php

namespace App\Services;

use App\Exceptions\AdGuardApiException;
use GuzzleHttp\Exception\RequestException;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Pool;
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
        $cacheKey = $this->dashboardCacheKey();

        return Cache::remember($cacheKey, self::DASHBOARD_CACHE_TTL_SECONDS, function () {
            return $this->fetchDashboardData();
        });
    }

    public function forgetDashboardCache(): void
    {
        Cache::forget($this->dashboardCacheKey());
    }

    private function dashboardCacheKey(): string
    {
        return 'adguard_dashboard_' . hash('sha256', $this->apiKey ?? '');
    }

    private function fetchDashboardData(): array
    {
        $now = now();
        $twentyFourHoursAgo = $now->copy()->subDay();

        $timeFrom = $twentyFourHoursAgo->valueOf();
        $timeTo = $now->valueOf();

        $responses = $this->sendMany([
            'timeStats'      => ['method' => 'get', 'endpoint' => '/stats/time',       'data' => ['time_from_millis' => $timeFrom, 'time_to_millis' => $timeTo]],
            'categoryStats'  => ['method' => 'get', 'endpoint' => '/stats/categories',  'data' => ['time_from_millis' => $timeFrom, 'time_to_millis' => $timeTo]],
            'devices'        => ['method' => 'get', 'endpoint' => '/devices',           'data' => []],
            'limits'         => ['method' => 'get', 'endpoint' => '/account/limits',    'data' => []],
            'deviceStats'    => ['method' => 'get', 'endpoint' => '/stats/devices',     'data' => ['time_from_millis' => $timeFrom, 'time_to_millis' => $timeTo]],
            'dnsServers'     => ['method' => 'get', 'endpoint' => '/dns_servers',       'data' => []],
        ]);

        $timeStats = $this->safeGet(fn() => $this->parsePoolJson($responses['timeStats']));
        $categoryStats = $this->safeGet(fn() => $this->parsePoolJson($responses['categoryStats']));
        $devices = $this->safeGet(fn() => $this->parsePoolJson($responses['devices']), []);
        $limits = $this->safeGet(fn() => $this->parsePoolJson($responses['limits']), []);
        $deviceStats = $this->safeGet(fn() => $this->parsePoolJson($responses['deviceStats']), []);
        $dnsServers = $this->safeGet(fn() => $this->parsePoolJson($responses['dnsServers']), []);

        $dnsServer = $this->findDefaultDnsServer($dnsServers);
        $settings = $dnsServer['settings'] ?? null;

        $aggregated = $this->aggregateTimeStats($timeStats);
        $blockedCategories = $this->aggregateCategoryStats($categoryStats);
        $deviceList = $this->buildDeviceList($devices, $deviceStats, $now);
        $safebrowsing = $this->extractSafebrowsingSettings($settings);

        $deviceCount = count($devices);

        return [
            'stats' => [
                'total_queries' => $aggregated['total'],
                'blocked_count' => $aggregated['blocked'],
                'blocked_categories' => array_slice(array_map(fn($c) => $c['name'], $blockedCategories), 0, 3),
                'active_devices' => $deviceList['active_count'],
            ],
            'time_series' => $aggregated['series'],
            'top_activities' => array_slice($this->safeGet(fn() => $this->getTopDomains($timeFrom, $timeTo), []), 0, 5),
            'categories_blocked' => array_slice($blockedCategories, 0, 5),
            'safebrowsing' => $safebrowsing,
            'devices' => $deviceList['list'],
            'account_limits' => [
                'devices' => [
                    'used' => $deviceCount,
                    'max' => $limits['devices']['max'] ?? 5,
                ],
            ],
        ];
    }

    private function safeGet(callable $callback, mixed $default = null): mixed
    {
        try {
            return $callback();
        } catch (AdGuardApiException $e) {
            throw $e;
        } catch (\Throwable $e) {
            Log::warning('AdGuard API partial failure', [
                'error' => $e->getMessage(),
            ]);
            report($e);
            return $default;
        }
    }

    private function aggregateTimeStats(?array $timeStats): array
    {
        $total = 0;
        $blocked = 0;
        $series = [];

        if (!$timeStats) {
            return ['total' => $total, 'blocked' => $blocked, 'series' => $series];
        }

        foreach (($timeStats['stats'] ?? []) as $hour) {
            $value = $hour['value'] ?? [];
            $q = $value['queries'] ?? 0;
            $b = $value['blocked'] ?? 0;
            $total += $q;
            $blocked += $b;
            $series[] = [
                'hour' => $hour['time_millis'] ?? 0,
                'allowed' => $q - $b,
                'blocked' => $b,
            ];
        }

        return ['total' => $total, 'blocked' => $blocked, 'series' => $series];
    }

    private function aggregateCategoryStats(?array $categoryStats): array
    {
        if (!$categoryStats) {
            return [];
        }

        $statsList = $categoryStats['stats'] ?? [];
        $total = array_sum(array_column($statsList, 'queries')) ?: 1;
        $categories = [];

        foreach ($statsList as $cat) {
            $count = $cat['queries'] ?? 0;
            $categories[] = [
                'name' => $cat['category_type'] ?? 'Unknown',
                'count' => $count,
                'percentage' => round(($count / $total) * 100, 1),
            ];
        }

        usort($categories, fn($a, $b) => $b['count'] <=> $a['count']);

        return $categories;
    }

    private function buildDeviceList(array $devices, array $deviceStats, \Illuminate\Support\Carbon $now): array
    {
        $activeCount = 0;
        $list = [];

        if (!$devices) {
            return ['active_count' => $activeCount, 'list' => $list];
        }

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
                $activeCount++;
            }

            $list[] = [
                'id' => $deviceId,
                'name' => $device['name'] ?? 'Unknown',
                'device_type' => $device['device_type'] ?? 'unknown',
                'is_online' => $isOnline,
                'last_seen' => $lastSeen,
                'protection_enabled' => $device['settings']['protection_enabled'] ?? true,
            ];
        }

        return ['active_count' => $activeCount, 'list' => $list];
    }

    private function extractSafebrowsingSettings(?array $settings): array
    {
        if (!$settings) {
            return [
                'safe_search_enabled' => false,
                'block_dangerous_enabled' => false,
                'block_nrd_enabled' => false,
            ];
        }

        $parental = $settings['parental_control_settings'] ?? [];
        $safebrowsing = $settings['safebrowsing_settings'] ?? [];

        return [
            'safe_search_enabled' => !empty($parental['engines_safe_search_enabled'])
                || !empty($parental['youtube_safe_search_enabled']),
            'block_dangerous_enabled' => !empty($safebrowsing['block_dangerous_domains'])
                || !empty($safebrowsing['enabled']),
            'block_nrd_enabled' => !empty($safebrowsing['block_nrd']),
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

    public function getDefaultDnsServer(): ?array
    {
        $dnsServers = $this->safeGet(fn() => $this->getDnsServers(), []);
        if (empty($dnsServers)) {
            return null;
        }
        foreach ($dnsServers as $server) {
            if (!empty($server['default'])) {
                return $server;
            }
        }
        return $dnsServers[0];
    }

    public function getDnsServer(string $dnsServerId): ?array
    {
        $response = $this->get("/dns_servers/{$dnsServerId}");
        $data = $response->json();
        return is_array($data) ? $data : null;
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
        usort($domains, fn($a, $b) => ($b['value']['queries'] ?? 0) <=> ($a['value']['queries'] ?? 0));
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

    private function sendMany(array $requests, int $timeout = 15): array
    {
        if (!$this->apiKey) {
            throw new AdGuardApiException('Kunci API tidak ditemukan.', 'API_KEY_MISSING', 401);
        }

        $headers = [
            'Authorization' => 'ApiKey ' . $this->apiKey,
            'Accept' => 'application/json',
        ];

        try {
            $responses = Http::pool(function (Pool $pool) use ($requests, $headers, $timeout) {
                foreach ($requests as $key => $spec) {
                    $url = $this->baseUrl . $spec['endpoint'];
                    $method = strtolower($spec['method']);

                    Log::debug("AdGuard API pool {$method}", ['url' => $url, 'data' => $spec['data']]);

                    $pool->as($key)->withHeaders($headers)
                        ->timeout($timeout)
                        ->{$method}($url, $spec['data']);
                }
            });

            foreach ($responses as $key => $response) {
                if ($response instanceof \Exception) {
                    if ($response instanceof ConnectionException) {
                        throw new AdGuardApiException(
                            'Layanan sedang sibuk, silakan coba beberapa saat lagi.',
                            'ADGUARD_CONNECTION_ERROR',
                            503
                        );
                    }
                    if ($response instanceof RequestException && $response->hasResponse()) {
                        $this->handleError(
                            new Response($response->getResponse()),
                            $this->baseUrl . $requests[$key]['endpoint']
                        );
                    }
                    throw $response;
                }
                if ($response instanceof Response && $response->failed()) {
                    $this->handleError($response, $this->baseUrl . $requests[$key]['endpoint']);
                }
            }

            return $responses;
        } catch (AdGuardApiException $e) {
            throw $e;
        } catch (\Exception $e) {
            throw new AdGuardApiException(
                'Layanan sedang sibuk, silakan coba beberapa saat lagi.',
                'ADGUARD_API_ERROR',
                502
            );
        }
    }

    private function parsePoolJson(Response|\Exception $response): ?array
    {
        if ($response instanceof \Exception) {
            throw $response;
        }
        $data = $response->json();
        return is_array($data) ? $data : null;
    }

    private function findDefaultDnsServer(array $dnsServers): ?array
    {
        if (empty($dnsServers)) {
            return null;
        }
        foreach ($dnsServers as $server) {
            if (!empty($server['default'])) {
                return $server;
            }
        }
        return $dnsServers[0];
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
