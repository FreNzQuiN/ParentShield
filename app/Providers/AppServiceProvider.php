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
        if (str_starts_with((string) env('APP_URL', 'http://localhost'), 'https')) {
            \Illuminate\Support\Facades\URL::forceScheme('https');
        }
    }
}
