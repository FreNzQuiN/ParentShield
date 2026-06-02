<?php

define('LARAVEL_START', microtime(true));

// Read env from any source (Lambda FPM may not populate $_ENV)
function env_val($key, $default = null) {
    return $_ENV[$key] ?? $_SERVER[$key] ?? getenv($key) ?: $default;
}

// --- 1. Bootstrap serverless environment ---
$storage = env_val('APP_STORAGE', '/tmp/storage');
$dbConn = env_val('DB_CONNECTION', 'sqlite');

foreach (['', 'framework/views', 'framework/cache/data', 'framework/sessions', 'logs', 'bootstrap/cache'] as $dir) {
    $path = $storage . '/' . $dir;
    if (!is_dir($path)) {
        @mkdir($path, 0755, true);
    }
}

// Only create SQLite DB when actually using SQLite
if ($dbConn === 'sqlite') {
    $dbPath = env_val('DB_DATABASE', $storage . '/database.sqlite');
    $dbDir = dirname($dbPath);
    if (!is_dir($dbDir)) @mkdir($dbDir, 0755, true);
    if (!file_exists($dbPath)) @touch($dbPath);
} else {
    $dbPath = env_val('DB_DATABASE', 'forge');
}

// --- 2. Force env vars for serverless (both $_ENV + putenv for compatibility) ---
$forcedVars = [
    'APP_STORAGE' => $storage,
    'DB_CONNECTION' => $dbConn,
    'DB_DATABASE' => $dbPath,
    'CACHE_STORE' => 'array',
    'SESSION_DRIVER' => 'array',
    'QUEUE_CONNECTION' => 'sync',
];

foreach ($forcedVars as $key => $value) {
    $_ENV[$key] = $value;
    $_SERVER[$key] = $value;
    putenv("$key=$value");
}

// Ensure APP_KEY from Vercel env is accessible via all PHP superglobals
$appKey = env_val('APP_KEY');
if ($appKey) {
    $_ENV['APP_KEY'] = $appKey;
    $_SERVER['APP_KEY'] = $appKey;
    putenv("APP_KEY=$appKey");
}

// TLS for MySQL/TiDB: write ISRG Root X1 (Let's Encrypt) CA to tmp, set SSL options
if ($dbConn === 'mysql') {
    $tiDbCa = $storage . '/tidb-ca.pem';
    if (!file_exists($tiDbCa)) {
        file_put_contents($tiDbCa, <<<'PEM'
-----BEGIN CERTIFICATE-----
MIIFazCCA1OgAwIBAgIRAIIQz7DSQONZRGPgu2OCiwAwDQYJKoZIhvcNAQELBQAw
TzELMAkGA1UEBhMCVVMxKTAnBgNVBAoTIEludGVybmV0IFNlY3VyaXR5IFJlc2Vh
cmNoIEdyb3VwMRUwEwYDVQQDEwxJU1JHIFJvb3QgWDEwHhcNMTUwNjA0MTEwNDM4
WhcNMzUwNjA0MTEwNDM4WjBPMQswCQYDVQQGEwJVUzEpMCcGA1UEChMgSW50ZXJu
ZXQgU2VjdXJpdHkgUmVzZWFyY2ggR3JvdXAxFTATBgNVBAMTDElTUkcgUm9vdCBY
MTCCAiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBAK3oJHP0FDfzm54rVygc
h77ct984kIxuPOZXoHj3dcKi/vVqbvYATyjb3miGbESTtrFj/RQSa78f0uoxmyF+
0TM8ukj13Xnfs7j/EvEhmkvBioZxaUpmZmyPfjxwv60pIgbz5MDmgK7iS4+3mX6U
A5/TR5d8mUgjU+g4rk8Kb4Mu0UlXjIB0ttov0DiNewNwIRt18jA8+o+u3dpjq+sW
T8KOEUt+zwvo/7V3LvSye0rgTBIlDHCNAymg4VMk7BPZ7hm/ELNKjD+Jo2FR3qyH
B5T0Y3HsLuJvW5iB4YlcNHlsdu87kGJ55tukmi8mxdAQ4Q7e2RCOFvu396j3x+UC
B5iPNgiV5+I3lg02dZ77DnKxHZu8A/lJBdiB3QW0KtZB6awBdpUKD9jf1b0SHzUv
KBds0pjBqAlkd25HN7rOrFleaJ1/ctaJxQZBKT5ZPt0m9STJEadao0xAH0ahmbWn
OlFuhjuefXKnEgV4We0+UXgVCwOPjdAvBbI+e0ocS3MFEvzG6uBQE3xDk3SzynTn
jh8BCNAw1FtxNrQHusEwMFxIt4I7mKZ9YIqioymCzLq9gwQbooMDQaHWBfEbwrbw
qHyGO0aoSCqI3Haadr8faqU9GY/rOPNk3sgrDQoo//fb4hVC1CLQJ13hef4Y53CI
rU7m2Ys6xt0nUW7/vGT1M0NPAgMBAAGjQjBAMA4GA1UdDwEB/wQEAwIBBjAPBgNV
HRMBAf8EBTADAQH/MB0GA1UdDgQWBBR5tFnme7bl5AFzgAiIyBpY9umbbjANBgkq
hkiG9w0BAQsFAAOCAgEAVR9YqbyyqFDQDLHYGmkgJykIrGF1XIpu+ILlaS/V9lZL
ubhzEFnTIZd+50xx+7LSYK05qAvqFyFWhfFQDlnrzuBZ6brJFe+GnY+EgPbk6ZGQ
3BebYhtF8GaV0nxvwuo77x/Py9auJ/GpsMiu/X1+mvoiBOv/2X/qkSsisRcOj/KK
NFtY2PwByVS5uCbMiogziUwthDyC3+6WVwW6LLv3xLfHTjuCvjHIInNzktHCgKQ5
ORAzI4JMPJ+GslWYHb4phowim57iaztXOoJwTdwJx4nLCgdNbOhdjsnvzqvHu7Ur
TkXWStAmzOVyyghqpZXjFaH3pO3JLF+l+/+sKAIuvtd7u+Nxe5AW0wdeRlN8NwdC
jNPElpzVmbUq4JUagEiuTDkHzsxHpFKVK7q4+63SM1N95R1NbdWhscdCb+ZAJzVc
oyi3B43njTOQ5yOf+1CceWxG1bQVs5ZufpsMljq4Ui0/1lvh+wjChP4kqKOJ2qxq
4RgqsahDYVvTH9w7jXbyLeiNdd8XM2w9U/t7y0Ff/9yi0GE44Za4rF2LN9d11TPA
mRGunUHBcnWEvgJBQl9nJEiU0Zsnvgc/ubhPgXRR4Xq37Z0j4r7g1SgEEzwxA57d
emyPxgcYxn/eR44/KJ4EBs+lVDR3veyJm+kXQ99b21/+jh5Xos1AnX5iItreGCc=
-----END CERTIFICATE-----
PEM
);
    }
    $_ENV['MYSQL_ATTR_SSL_CA'] = $tiDbCa;
    $_SERVER['MYSQL_ATTR_SSL_CA'] = $tiDbCa;
    putenv("MYSQL_ATTR_SSL_CA=$tiDbCa");
    if (env_val('MYSQL_ATTR_SSL_VERIFY_SERVER_CERT') === null) {
        $_ENV['MYSQL_ATTR_SSL_VERIFY_SERVER_CERT'] = 'false';
        $_SERVER['MYSQL_ATTR_SSL_VERIFY_SERVER_CERT'] = 'false';
        putenv('MYSQL_ATTR_SSL_VERIFY_SERVER_CERT=false');
    }
}

// Pass through critical user-defined env vars (from Vercel dashboard)
foreach (['DB_HOST', 'DB_PORT', 'DB_USERNAME', 'DB_PASSWORD'] as $key) {
    $val = env_val($key);
    if ($val) {
        $_ENV[$key] = $val;
        $_SERVER[$key] = $val;
        putenv("$key=$val");
    }
}

require __DIR__ . '/../vendor/autoload.php';

// --- 3. Boot Laravel ---
try {
    $app = require_once __DIR__ . '/../bootstrap/app.php';
    $app->useStoragePath($storage);
    $app->useBootstrapPath($storage . '/bootstrap');

    $request = Illuminate\Http\Request::capture();
    $app->instance('request', $request);

    $app->bootstrapWith([
        \Illuminate\Foundation\Bootstrap\LoadConfiguration::class,
        \Illuminate\Foundation\Bootstrap\HandleExceptions::class,
        \Illuminate\Foundation\Bootstrap\RegisterFacades::class,
        \Illuminate\Foundation\Bootstrap\RegisterProviders::class,
        \Illuminate\Foundation\Bootstrap\BootProviders::class,
    ]);

    // Run migrations on cold start for SQLite only (persistent DBs like TiDB/MySQL don't reset)
    if ($dbConn === 'sqlite') {
        try {
            $migrator = $app->make('migrator');
            if (!$migrator->repositoryExists()) {
                $migrator->getRepository()->createRepository();
                $migrator->run($app->databasePath('migrations'));
            }
        } catch (\Throwable $e) {
            // Non-fatal: app may still work without DB
        }
    }

    $kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
    $response = $kernel->handle($request);
    $response->send();
    $kernel->terminate($request, $response);
} catch (\Throwable $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'code' => 'INTERNAL_ERROR',
        'message' => 'Terjadi kesalahan yang tidak terduga.',
    ]) . "\n";
}
