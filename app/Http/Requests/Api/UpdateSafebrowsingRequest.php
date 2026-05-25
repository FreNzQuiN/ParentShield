<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSafebrowsingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'key' => ['required', 'string', Rule::in([
                'safe_search_enabled',
                'block_dangerous_enabled',
                'block_nrd_enabled',
            ])],
            'value' => ['required', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'key.in' => 'Pengaturan tidak valid.',
            'value.boolean' => 'Nilai harus berupa boolean.',
        ];
    }
}
