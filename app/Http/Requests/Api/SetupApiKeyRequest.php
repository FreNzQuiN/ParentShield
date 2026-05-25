<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class SetupApiKeyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'api_key' => ['required', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'api_key.required' => 'Kunci API wajib diisi.',
        ];
    }
}
