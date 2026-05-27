<?php

namespace App\Http\Controllers;

use App\Helpers\ApiResponse;
use App\Services\AdGuardService;
use Illuminate\Http\Request;

abstract class Controller
{
    use ApiResponse;

    protected function setupAdGuardService(Request $request, AdGuardService $adGuard): bool
    {
        $user = $request->user();
        $apiKey = $user->getDecryptedAdguardKey();
        if (!$apiKey) {
            return false;
        }
        $adGuard->setApiKey($apiKey);
        return true;
    }
}
