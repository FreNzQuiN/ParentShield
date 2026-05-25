<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Password;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create($request->validated());

        $token = $user->createToken('auth_token')->plainTextToken;

        return $this->created([
            'user' => $user->only(['id', 'name', 'email']) + ['has_api_key' => false],
            'token' => $token,
        ], 'Registrasi berhasil.');
    }

    public function login(LoginRequest $request): JsonResponse
    {
        if (!Auth::attempt($request->only('email', 'password'))) {
            return $this->error('Email atau kata sandi salah. Silakan periksa kembali.', 'INVALID_CREDENTIALS', 401);
        }

        $user = $request->user();
        $token = $user->createToken('auth_token')->plainTextToken;

        return $this->success([
            'user' => $user->only(['id', 'name', 'email']) + ['has_api_key' => $user->has_api_key],
            'token' => $token,
        ], 'Berhasil masuk.');
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return $this->success(null, 'Berhasil keluar.');
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        return $this->success([
            'user' => $user->only(['id', 'name', 'email']) + ['has_api_key' => $user->has_api_key],
        ]);
    }

    public function refresh(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->currentAccessToken()->delete();
        $token = $user->createToken('auth_token')->plainTextToken;

        return $this->success([
            'user' => $user->only(['id', 'name', 'email']) + ['has_api_key' => $user->has_api_key],
            'token' => $token,
        ], 'Token berhasil diperbarui.');
    }

    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        try {
            $status = Password::sendResetLink($request->only('email'));

            if ($status !== Password::RESET_LINK_SENT) {
                Log::info('Password reset requested for non-existent or invalid email', [
                    'email' => $request->input('email'),
                ]);
            }
        } catch (\Throwable $e) {
            Log::error('Password reset failed unexpectedly', [
                'email' => $request->input('email'),
                'error' => $e->getMessage(),
            ]);
        }

        return $this->success(null, 'Jika email terdaftar, tautan reset telah dikirim.');
    }
}
