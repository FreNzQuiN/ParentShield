<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'adguard' => [
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
    ],

];
