<?php

namespace Tests\Unit;

use App\Exceptions\AdGuardApiException;
use Tests\TestCase;

class AdGuardApiExceptionTest extends TestCase
{
    public function test_exception_has_status_code(): void
    {
        $exception = new AdGuardApiException(
            message: 'Invalid API key',
            code: 'API_KEY_INVALID',
            statusCode: 401
        );

        $this->assertEquals(401, $exception->getStatusCode());
        $this->assertEquals('Invalid API key', $exception->getMessage());
        $this->assertEquals('API_KEY_INVALID', $exception->getCode());
    }

    public function test_exception_defaults(): void
    {
        $exception = new AdGuardApiException();

        $this->assertEquals(502, $exception->getStatusCode());
        $this->assertEquals('AdGuard API error.', $exception->getMessage());
        $this->assertEquals('ADGUARD_ERROR', $exception->getCode());
    }
}
