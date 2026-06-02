<?php

return [

    'base_url' => env('ADGUARD_BASE_URL', 'https://api.adguard-dns.io/oapi/v1'),

    'device_online_threshold_ms' => 300000,

    'suspicious_threshold_ms' => 21600000,

    'dashboard_cache_ttl_seconds' => 30,

    'http_timeout' => 15,

    'query_log_max_limit' => 1000,

    'default_device_limit' => 5,

    'cache_lock_ttl' => 20,

    'device_types' => ['ANDROID', 'IOS', 'WINDOWS'],

    'device_name_max' => 64,

    'stats_window_ms' => 86400000,

];
