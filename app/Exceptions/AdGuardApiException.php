<?php

namespace App\Exceptions;

use RuntimeException;

class AdGuardApiException extends RuntimeException
{
    protected int $statusCode;

    public function __construct(
        string $message = 'AdGuard API error.',
        string $code = 'ADGUARD_ERROR',
        int $statusCode = 502,
        ?\Throwable $previous = null
    ) {
        parent::__construct($message, 0, $previous);
        $this->code = $code;
        $this->statusCode = $statusCode;
    }

    public function getStatusCode(): int
    {
        return $this->statusCode;
    }
}
