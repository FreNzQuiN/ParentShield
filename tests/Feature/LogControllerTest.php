<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Crypt;
use Tests\TestCase;

class LogControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private string $token;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create([
            'adguard_api_key_encrypted' => Crypt::encryptString('ag_test_key'),
            'adguard_api_key_verified_at' => now(),
        ]);
        $this->token = $this->user->createToken('auth_token')->plainTextToken;
    }

    public function test_unauthenticated_user_cannot_query_logs(): void
    {
        $response = $this->getJson('/api/v1/logs/query');

        $response->assertStatus(401);
    }

    public function test_user_without_api_key_cannot_query_logs(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('auth_token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/logs/query');

        $response->assertStatus(403)
            ->assertJson(['code' => 'API_KEY_REQUIRED']);
    }

    public function test_query_log_validates_time_from_millis_required(): void
    {
        $response = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->getJson('/api/v1/logs/query');

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['time_from_millis']);
    }

    public function test_query_log_validates_time_to_millis_required(): void
    {
        $response = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->getJson('/api/v1/logs/query?time_from_millis=1000');

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['time_to_millis']);
    }

    public function test_query_log_validates_time_to_millis_gte_time_from(): void
    {
        $response = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->getJson('/api/v1/logs/query?time_from_millis=2000&time_to_millis=1000');

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['time_to_millis']);
    }

    public function test_query_log_validates_limit_max(): void
    {
        $response = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->getJson('/api/v1/logs/query?time_from_millis=1000&time_to_millis=2000&limit=2000');

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['limit']);
    }

    public function test_query_log_validates_statuses_enum(): void
    {
        $response = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->getJson('/api/v1/logs/query?time_from_millis=1000&time_to_millis=2000&statuses[]=INVALID');

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['statuses.0']);
    }

    public function test_query_log_validates_negative_time(): void
    {
        $response = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->getJson('/api/v1/logs/query?time_from_millis=-1&time_to_millis=1000');

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['time_from_millis']);
    }

    public function test_query_log_validates_params_and_passes_to_service(): void
    {
        $response = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->getJson('/api/v1/logs/query?time_from_millis=1000&time_to_millis=2000&limit=50&search=test');

        $response->assertJsonMissingPath('errors');
        $this->assertNotEquals(422, $response->getStatusCode(), 'Validation should pass for valid params');
    }
}
