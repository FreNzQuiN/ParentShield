<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class AddCorrelationId
{
    public function handle(Request $request, Closure $next): mixed
    {
        $correlationId = $request->header('X-Correlation-Id');

        if (!$correlationId || !Str::isUuid($correlationId)) {
            $correlationId = (string) Str::uuid();
        }

        $request->headers->set('X-Correlation-Id', $correlationId);
        Log::withContext(['correlation_id' => $correlationId]);

        $response = $next($request);

        $response->headers->set('X-Correlation-Id', $correlationId);

        return $response;
    }
}
