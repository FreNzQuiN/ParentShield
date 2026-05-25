<?php

use App\Exceptions\AdGuardApiException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->api(prepend: [
            \App\Http\Middleware\AddCorrelationId::class,
        ]);

        $middleware->alias([
            'check.api-key' => \App\Http\Middleware\CheckApiKey::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->shouldRenderJsonWhen(function (Request $request, Throwable $e) {
            return $request->expectsJson() || $request->is('api/*');
        });

        $exceptions->render(function (ValidationException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'code' => 'VALIDATION_ERROR',
                    'message' => 'Data yang diberikan tidak valid.',
                    'errors' => $e->errors(),
                ], 422);
            }
        });

        $exceptions->render(function (AuthenticationException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'code' => 'UNAUTHENTICATED',
                    'message' => 'Sesi telah berakhir. Silakan masuk kembali.',
                ], 401);
            }
        });

        $exceptions->render(function (AdGuardApiException $e, Request $request) {
            return response()->json([
                'success' => false,
                'code' => $e->getErrorCode() ?: 'ADGUARD_ERROR',
                'message' => $e->getMessage(),
            ], $e->getStatusCode());
        });

        $exceptions->render(function (HttpException $e, Request $request) {
            if ($request->is('api/*')) {
                $message = match ($e->getStatusCode()) {
                    403 => 'Akses ditolak.',
                    404 => 'Halaman tidak ditemukan.',
                    default => $e->getMessage() ?: 'Terjadi kesalahan.',
                };

                return response()->json([
                    'success' => false,
                    'code' => match ($e->getStatusCode()) {
                        400 => 'BAD_REQUEST',
                        403 => 'FORBIDDEN',
                        404 => 'NOT_FOUND',
                        429 => 'RATE_LIMIT_EXCEEDED',
                        default => 'HTTP_ERROR',
                    },
                    'message' => $message,
                ], $e->getStatusCode());
            }
        });

        $exceptions->render(function (QueryException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'code' => 'DB_CONNECTION_ERROR',
                    'message' => 'Layanan sedang sibuk, silakan coba lagi.',
                ], 503);
            }
        });

        $exceptions->render(function (ConnectionException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'code' => 'SERVICE_UNAVAILABLE',
                    'message' => 'Layanan eksternal tidak dapat dijangkau. Silakan coba lagi.',
                ], 502);
            }
        });

        $exceptions->render(function (TooManyRequestsHttpException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'code' => 'RATE_LIMIT_EXCEEDED',
                    'message' => 'Terlalu banyak permintaan. Silakan tunggu beberapa saat.',
                ], 429);
            }
        });

        $exceptions->render(function (Throwable $e, Request $request) {
            if ($request->is('api/*')) {
                $status = method_exists($e, 'getStatusCode') ? $e->getStatusCode() : 500;

                report($e);

                return response()->json([
                    'success' => false,
                    'code' => 'INTERNAL_ERROR',
                    'message' => 'Terjadi kesalahan yang tidak terduga.',
                ], $status);
            }
        });
    })->create();
