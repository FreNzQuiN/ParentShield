<?php

use App\Http\Middleware\AddCorrelationId;
use Illuminate\Support\Facades\Route;

Route::middleware(['api', AddCorrelationId::class])->prefix('v1')->group(function () {
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
});
