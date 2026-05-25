<?php

namespace App\Providers;

use App\Services\AdGuardService;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(AdGuardService::class, function () {
            return new AdGuardService;
        });
    }

    public function boot(): void
    {
        if (isset($_ENV['APP_URL']) && str_starts_with($_ENV['APP_URL'], 'https')) {
            \Illuminate\Support\Facades\URL::forceScheme('https');
        }
    }
}
