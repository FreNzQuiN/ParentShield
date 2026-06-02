<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class QueryLogRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'time_from_millis' => ['required', 'integer', 'min:0'],
            'time_to_millis' => ['required', 'integer', 'min:0', 'gte:time_from_millis'],
            'devices' => ['nullable', 'array'],
            'devices.*' => ['string'],
            'statuses' => ['nullable', 'array'],
            'statuses.*' => ['string', Rule::in([
                'UNKNOWN', 'NONE', 'REQUEST_BLOCKED', 'RESPONSE_BLOCKED',
                'REQUEST_ALLOWED', 'RESPONSE_ALLOWED', 'MODIFIED',
            ])],
            'search' => ['nullable', 'string', 'max:255'],
            'limit' => ['nullable', 'integer', 'min:1', 'max:1000'],
            'cursor' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'time_from_millis.required' => 'Parameter time_from_millis wajib diisi.',
            'time_to_millis.required' => 'Parameter time_to_millis wajib diisi.',
            'time_to_millis.gte' => 'time_to_millis harus lebih besar atau sama dengan time_from_millis.',
            'statuses.*.in' => 'Status filter tidak valid.',
            'limit.max' => 'Limit maksimal adalah 1000.',
        ];
    }
}
