<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_user_cannot_access_dashboard(): void
    {
        $response = $this->getJson('/api/v1/dashboard');

        $response->assertStatus(401)
            ->assertJson(['success' => false, 'code' => 'UNAUTHENTICATED']);
    }

    public function test_user_without_api_key_gets_forbidden(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('auth_token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/dashboard');

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'code' => 'API_KEY_REQUIRED',
            ]);
    }

    public function test_user_without_api_key_cannot_update_safebrowsing(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('auth_token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->putJson('/api/v1/dashboard/safebrowsing', [
                'key' => 'block_nrd_enabled',
                'value' => true,
            ]);

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'code' => 'API_KEY_REQUIRED',
            ]);
    }

    public function test_safebrowsing_validates_key(): void
    {
        $user = User::factory()->withApiKey()->create();
        $token = $user->createToken('auth_token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->putJson('/api/v1/dashboard/safebrowsing', [
                'key' => 'invalid_key',
                'value' => true,
            ]);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'code' => 'INVALID_KEY',
            ]);
    }

    public function test_safebrowsing_validates_value_is_boolean(): void
    {
        $user = User::factory()->withApiKey()->create();
        $token = $user->createToken('auth_token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->putJson('/api/v1/dashboard/safebrowsing', [
                'key' => 'block_nrd_enabled',
                'value' => 'not-a-boolean',
            ]);

        $response->assertStatus(422);
    }
}
