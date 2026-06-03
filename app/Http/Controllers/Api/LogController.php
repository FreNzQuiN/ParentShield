<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\QueryLogRequest;
use App\Services\AdGuardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class LogController extends Controller
{
    public function __construct(
        private readonly AdGuardService $adGuard
    ) {}

    public function queryLog(QueryLogRequest $request): JsonResponse
    {
        $user = $request->user();

        if (!$this->setupAdGuardService($request, $this->adGuard)) {
            return $this->error('Kunci API tidak ditemukan.', 'API_KEY_REQUIRED', 403);
        }

        $validated = $request->validated();

        try {
            $data = $this->adGuard->getQueryLog(
                timeFrom: (int) $validated['time_from_millis'],
                timeTo: (int) $validated['time_to_millis'],
                devices: $validated['devices'] ?? null,
                statuses: $validated['statuses'] ?? null,
                search: $validated['search'] ?? null,
                limit: $validated['limit'] ?? 100,
                cursor: $validated['cursor'] ?? null,
            );

            return $this->success($data, 'Data log aktivitas berhasil dimuat.');
        } catch (\App\Exceptions\AdGuardApiException $e) {
            Log::warning('Query log API error', [
                'user_id' => $user->id,
                'code' => $e->getErrorCode(),
                'message' => $e->getMessage(),
            ]);

            if ($e->getErrorCode() === 'ADGUARD_UNAUTHORIZED') {
                $user->clearAdguardApiKey();
            }

            return $this->error($e->getMessage(), $e->getErrorCode(), $e->getStatusCode());
        } catch (\Exception $e) {
            Log::error('Query log unexpected error', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);

            return $this->error(
                'Gagal memuat data log aktivitas. Silakan coba lagi.',
                'LOG_ERROR',
                500
            );
        }
    }
}
