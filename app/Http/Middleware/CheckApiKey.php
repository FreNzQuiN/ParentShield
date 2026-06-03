<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckApiKey
{
    public function handle(Request $request, Closure $next): mixed
    {
        $user = $request->user();

        if (!$user
            || !$user->adguard_api_key_encrypted
            || !$user->adguard_api_key_verified_at
        ) {
            return response()->json([
                'success' => false,
                'code' => 'API_KEY_REQUIRED',
                'message' => 'Kunci API AdGuard belum diatur. Silakan atur kunci API terlebih dahulu.',
            ], 403);
        }

        return $next($request);
    }
}
