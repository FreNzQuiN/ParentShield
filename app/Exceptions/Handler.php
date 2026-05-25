<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Throwable;

class Handler extends ExceptionHandler
{
    protected function shouldReturnJson($request, Throwable $e): bool
    {
        return true;
    }
}
