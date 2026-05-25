<?php

use Illuminate\Support\Facades\Route;

Route::middleware('api')->prefix('v1')->group(function () {
    // Health
    Route::get('/health', function () {
        return response()->json([
            'success' => true,
                'message' => 'API tersedia.',
            'data' => [
                'app' => config('app.name'),
                'env' => config('app.env'),
                'time' => now()->toIso8601String(),
            ],
        ]);
    });

    // Auth
    Route::prefix('auth')->group(function () {
        Route::post('/register', [\App\Http\Controllers\Api\AuthController::class, 'register'])
            ->middleware('throttle:10,1');
        Route::post('/login', [\App\Http\Controllers\Api\AuthController::class, 'login'])
            ->middleware('throttle:5,1');
        Route::post('/forgot-password', [\App\Http\Controllers\Api\AuthController::class, 'forgotPassword'])
            ->middleware('throttle:3,1');

        Route::middleware('auth:sanctum')->group(function () {
            Route::post('/logout', [\App\Http\Controllers\Api\AuthController::class, 'logout']);
            Route::get('/me', [\App\Http\Controllers\Api\AuthController::class, 'me']);
            Route::post('/refresh', [\App\Http\Controllers\Api\AuthController::class, 'refresh']);
        });
    });

    // Setup API key (requires auth, no API key needed)
    Route::middleware(['auth:sanctum'])->prefix('setup-api-key')->group(function () {
        Route::post('/', [\App\Http\Controllers\Api\SetupApiKeyController::class, 'store'])
            ->middleware('throttle:5,1');
        Route::get('/status', [\App\Http\Controllers\Api\SetupApiKeyController::class, 'status']);
    });

    // Protected — requires auth + API key
    Route::middleware(['auth:sanctum', 'check.api-key'])->group(function () {
        Route::get('/dashboard', [\App\Http\Controllers\Api\DashboardController::class, 'index']);
        Route::put('/dashboard/safebrowsing', [\App\Http\Controllers\Api\DashboardController::class, 'updateSafebrowsing']);
    });
});
