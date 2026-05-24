<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Crypt;
use Tests\TestCase;

class SetupApiKeyTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_user_cannot_setup_api_key(): void
    {
        $response = $this->postJson('/api/v1/setup-api-key', [
            'api_key' => 'ag_test_key',
        ]);

        $response->assertStatus(401);
    }

    public function test_store_validates_required_fields(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('auth_token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/v1/setup-api-key', []);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'code' => 'VALIDATION_ERROR',
            ]);
    }

    public function test_store_validates_api_key_is_string(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('auth_token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/v1/setup-api-key', [
                'api_key' => 123,
            ]);

        $response->assertStatus(422)
            ->assertJson(['success' => false, 'code' => 'VALIDATION_ERROR']);
    }

    public function test_unauthenticated_user_cannot_check_status(): void
    {
        $response = $this->getJson('/api/v1/setup-api-key/status');

        $response->assertStatus(401);
    }

    public function test_status_returns_false_when_no_api_key(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('auth_token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/setup-api-key/status');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => ['has_api_key' => false],
            ]);
    }

    public function test_status_returns_true_when_api_key_exists(): void
    {
        $user = User::factory()->create([
            'adguard_api_key_encrypted' => Crypt::encryptString('ag_test_key'),
            'adguard_api_key_verified_at' => now(),
        ]);
        $token = $user->createToken('auth_token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/setup-api-key/status');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => ['has_api_key' => true],
            ]);
    }

    public function test_me_endpoint_includes_has_api_key(): void
    {
        $user = User::factory()->create([
            'adguard_api_key_verified_at' => now(),
        ]);
        $token = $user->createToken('auth_token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/auth/me');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'has_api_key' => true,
                    ],
                ],
            ]);
    }

    public function test_login_response_includes_has_api_key(): void
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'user' => [
                        'has_api_key' => false,
                    ],
                ],
            ]);
    }
}
