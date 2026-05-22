<?php

use App\Http\Middleware\AddCorrelationId;
use Illuminate\Support\Facades\Route;

Route::middleware(['api', AddCorrelationId::class])->prefix('v1')->group(function () {
    // Health
    Route::get('/health', function () {
        return response()->json([
            'success' => true,
            'message' => 'API is healthy.',
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
        });
    });
});
