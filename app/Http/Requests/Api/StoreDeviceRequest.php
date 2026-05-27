<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreDeviceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:' . config('adguard.device_name_max', 64)],
            'device_type' => ['required', 'string', Rule::in(config('adguard.device_types', ['ANDROID', 'IOS', 'WINDOWS']))],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama perangkat wajib diisi.',
            'name.max' => 'Nama perangkat maksimal 64 karakter.',
            'device_type.required' => 'Tipe perangkat wajib diisi.',
            'device_type.in' => 'Tipe perangkat harus ANDROID, IOS, atau WINDOWS.',
        ];
    }
}
