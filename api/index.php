<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Use /tmp for writable paths on Vercel (read-only filesystem elsewhere)
$storage = $_ENV['APP_STORAGE'] ?? __DIR__ . '/../storage';
$GLOBALS['vercel_storage'] = $storage;

if (file_exists($maintenance = $storage . '/framework/maintenance.php')) {
    require $maintenance;
}

require __DIR__ . '/../vendor/autoload.php';

/** @var Application $app */
$app = require_once __DIR__ . '/../bootstrap/app.php';

$app->useStoragePath($storage);

$app->handleRequest(Request::capture());
