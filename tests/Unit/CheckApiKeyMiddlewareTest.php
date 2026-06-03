<?php

namespace Tests\Unit;

use App\Http\Middleware\CheckApiKey;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Symfony\Component\HttpFoundation\Response;
use Tests\TestCase;

class CheckApiKeyMiddlewareTest extends TestCase
{
    use RefreshDatabase;

    public function test_middleware_allows_user_with_api_key(): void
    {
        $user = User::factory()->create([
            'adguard_api_key_encrypted' => Crypt::encryptString('ag_test_key'),
            'adguard_api_key_verified_at' => now(),
        ]);

        $request = Request::create('/test', 'GET');
        $request->setUserResolver(fn () => $user);

        $middleware = new CheckApiKey;
        $response = $middleware->handle($request, fn () => response()->json(['ok' => true]));

        $this->assertEquals(Response::HTTP_OK, $response->getStatusCode());
    }

    public function test_middleware_rejects_user_without_api_key(): void
    {
        $user = User::factory()->create();

        $request = Request::create('/test', 'GET');
        $request->setUserResolver(fn () => $user);

        $middleware = new CheckApiKey;
        $response = $middleware->handle($request, fn () => response()->json(['ok' => true]));

        $this->assertEquals(Response::HTTP_FORBIDDEN, $response->getStatusCode());
        $this->assertEquals('API_KEY_REQUIRED', json_decode($response->getContent())->code);
    }

    public function test_middleware_rejects_user_with_only_encrypted_key_but_no_verified_at(): void
    {
        $user = User::factory()->create([
            'adguard_api_key_encrypted' => Crypt::encryptString('ag_test_key'),
            'adguard_api_key_verified_at' => null,
        ]);

        $request = Request::create('/test', 'GET');
        $request->setUserResolver(fn () => $user);

        $middleware = new CheckApiKey;
        $response = $middleware->handle($request, fn () => response()->json(['ok' => true]));

        $this->assertEquals(Response::HTTP_FORBIDDEN, $response->getStatusCode());
    }

    public function test_middleware_rejects_unauthenticated_user(): void
    {
        $request = Request::create('/test', 'GET');
        $request->setUserResolver(fn () => null);

        $middleware = new CheckApiKey;
        $response = $middleware->handle($request, fn () => response()->json(['ok' => true]));

        $this->assertEquals(Response::HTTP_FORBIDDEN, $response->getStatusCode());
    }
}
