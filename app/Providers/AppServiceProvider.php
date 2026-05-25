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
        //
    }
}
