<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class AddCorrelationId
{
    private const HEADER_NAME = 'X-Correlation-Id';

    public function handle(Request $request, Closure $next): mixed
    {
        $correlationId = $request->header(self::HEADER_NAME);

        if (!$correlationId || !Str::isUuid($correlationId)) {
            $correlationId = (string) Str::uuid();
        }

        $request->headers->set(self::HEADER_NAME, $correlationId);
        Log::withContext(['correlation_id' => $correlationId]);

        $response = $next($request);

        $response->headers->set(self::HEADER_NAME, $correlationId);

        return $response;
    }
}
