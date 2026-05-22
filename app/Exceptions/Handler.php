<?php

namespace App\Exceptions;

use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Throwable;

class Handler extends ExceptionHandler
{
    protected function shouldReturnJson($request, Throwable $e): bool
    {
        return true;
    }

    public function render($request, Throwable $e)
    {
        if ($request->expectsJson() || $request->is('api/*')) {
            return $this->renderApiException($request, $e);
        }

        return parent::render($request, $e);
    }

    protected function renderApiException(Request $request, Throwable $e): JsonResponse
    {
        $correlationId = $request->header('X-Correlation-Id');

        if ($e instanceof ValidationException) {
            return response()->json([
                'success' => false,
                'code' => 'VALIDATION_ERROR',
                'message' => 'The given data was invalid.',
                'errors' => $e->errors(),
            ], 422);
        }

        if ($e instanceof AuthenticationException) {
            return response()->json([
                'success' => false,
                'code' => 'UNAUTHENTICATED',
                'message' => $e->getMessage() ?: 'Unauthenticated.',
            ], 401);
        }

        if ($e instanceof HttpException) {
            $status = $e->getStatusCode();

            return response()->json([
                'success' => false,
                'code' => $this->statusToCode($status),
                'message' => $e->getMessage() ?: 'HTTP error.',
            ], $status);
        }

        if ($e instanceof AdGuardApiException) {
            return response()->json([
                'success' => false,
                'code' => $e->getCode() ?: 'ADGUARD_ERROR',
                'message' => $e->getMessage(),
            ], $e->getStatusCode());
        }

        $status = $this->isHttpException($e) ? $e->getStatusCode() : 500;

        $payload = [
            'success' => false,
            'code' => 'INTERNAL_ERROR',
            'message' => config('app.debug')
                ? $e->getMessage()
                : 'An unexpected error occurred.',
        ];

        if (config('app.debug')) {
            $payload['debug'] = [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => collect($e->getTrace())->take(5),
            ];
        }

        if ($correlationId) {
            $payload['correlation_id'] = $correlationId;
        }

        report($e);

        return response()->json($payload, $status);
    }

    protected function statusToCode(int $status): string
    {
        return match ($status) {
            400 => 'BAD_REQUEST',
            401 => 'UNAUTHENTICATED',
            403 => 'FORBIDDEN',
            404 => 'NOT_FOUND',
            405 => 'METHOD_NOT_ALLOWED',
            409 => 'CONFLICT',
            422 => 'VALIDATION_ERROR',
            429 => 'RATE_LIMIT_EXCEEDED',
            500 => 'INTERNAL_ERROR',
            503 => 'SERVICE_UNAVAILABLE',
            default => 'HTTP_ERROR',
        };
    }
}
