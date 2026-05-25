<?php

namespace Tests\Feature;

use Tests\TestCase;

class ApiResponseContractTest extends TestCase
{
    public function test_health_endpoint_returns_success_response(): void
    {
        $response = $this->getJson('/api/v1/health');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => ['app', 'env', 'time'],
            ])
            ->assertJson([
                'success' => true,
                'message' => 'API tersedia.',
            ]);
    }

    public function test_health_endpoint_has_correlation_id_header(): void
    {
        $response = $this->getJson('/api/v1/health');

        $response->assertHeader('X-Correlation-Id');
    }

    public function test_not_found_route_returns_error_response(): void
    {
        $response = $this->getJson('/api/v1/nonexistent');

        $response->assertStatus(404)
            ->assertJsonStructure([
                'success',
                'code',
                'message',
            ])
            ->assertJson([
                'success' => false,
                'code' => 'NOT_FOUND',
            ]);
    }

    public function test_invalid_json_returns_validation_error(): void
    {
        $response = $this->postJson('/api/v1/health', []);

        $response->assertStatus(405)
            ->assertJson([
                'success' => false,
            ]);
    }

    public function test_api_routes_are_resolved(): void
    {
        $response = $this->get('/api/v1/health');

        $response->assertStatus(200);
    }
}
