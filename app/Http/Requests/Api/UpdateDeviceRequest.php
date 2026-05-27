<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class UpdateDeviceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:' . config('adguard.device_name_max', 64)],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama perangkat wajib diisi.',
            'name.max' => 'Nama perangkat maksimal 64 karakter.',
        ];
    }
}
