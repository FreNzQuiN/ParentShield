<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AdGuardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class LogController extends Controller
{
    public function __construct(
        private readonly AdGuardService $adGuard
    ) {}

    public function queryLog(Request $request): JsonResponse
    {
        $user = $request->user();
        $apiKey = $user->getDecryptedAdguardKey();

        if (!$apiKey) {
            return $this->error(
                'Kunci API tidak ditemukan. Silakan atur ulang kunci API AdGuard Anda.',
                'API_KEY_REQUIRED',
                403
            );
        }

        $timeFrom = $request->input('time_from_millis');
        $timeTo = $request->input('time_to_millis');

        if (!$timeFrom) {
            return $this->error('Parameter time_from_millis wajib diisi.', 'VALIDATION_ERROR', 400);
        }

        if (!$timeTo) {
            return $this->error('Parameter time_to_millis wajib diisi.', 'VALIDATION_ERROR', 400);
        }

        $devices = $request->input('devices');
        $statuses = $request->input('statuses');
        $search = $request->input('search');
        $limit = $request->integer('limit', 100);
        $cursor = $request->input('cursor');

        $this->adGuard->setApiKey($apiKey);

        try {
            $data = $this->adGuard->getQueryLog(
                timeFrom: (int) $timeFrom,
                timeTo: (int) $timeTo,
                devices: $devices !== null ? (is_array($devices) ? $devices : [$devices]) : null,
                statuses: $statuses !== null ? (is_array($statuses) ? $statuses : [$statuses]) : null,
                search: $search,
                limit: $limit,
                cursor: $cursor,
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
