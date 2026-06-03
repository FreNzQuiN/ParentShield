<?php

namespace Tests\Unit;

use Tests\TestCase;

class AdguardConfigTest extends TestCase
{
    public function test_adguard_config_exists(): void
    {
        $config = config('adguard');
        $this->assertIsArray($config);
        $this->assertNotEmpty($config);
    }

    public function test_adguard_base_url_is_configured(): void
    {
        $baseUrl = config('adguard.base_url');
        $this->assertIsString($baseUrl);
        $this->assertNotEmpty($baseUrl);
        $this->assertStringContainsString('adguard', $baseUrl);
    }

    public function test_adguard_device_online_threshold_ms(): void
    {
        $threshold = config('adguard.device_online_threshold_ms');
        $this->assertIsInt($threshold);
        $this->assertGreaterThan(0, $threshold);
    }

    public function test_adguard_suspicious_threshold_ms(): void
    {
        $threshold = config('adguard.suspicious_threshold_ms');
        $this->assertIsInt($threshold);
        $this->assertGreaterThan(0, $threshold);
    }

    public function test_adguard_http_timeout(): void
    {
        $timeout = config('adguard.http_timeout');
        $this->assertIsInt($timeout);
        $this->assertGreaterThan(0, $timeout);
    }

    public function test_adguard_device_types(): void
    {
        $types = config('adguard.device_types');
        $this->assertIsArray($types);
        $this->assertContains('ANDROID', $types);
        $this->assertContains('IOS', $types);
        $this->assertContains('WINDOWS', $types);
    }

    public function test_adguard_config_not_in_services(): void
    {
        $servicesAdguard = config('services.adguard');
        $this->assertNull($servicesAdguard, 'adguard config should not be under services namespace');
    }
}
