<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class StoreDeviceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:64'],
            'device_type' => ['required', 'string', 'in:ANDROID,IOS,WINDOWS'],
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
