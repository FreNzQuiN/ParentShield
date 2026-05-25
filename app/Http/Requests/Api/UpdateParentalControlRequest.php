<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateParentalControlRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'key' => ['required', 'string', Rule::in([
                'enabled',
                'block_adult_websites_enabled',
                'engines_safe_search_enabled',
                'youtube_safe_search_enabled',
                'blocked_service',
                'service_group',
            ])],
            'value' => ['required'],
        ];
    }

    public function after(): array
    {
        return [
            function ($validator) {
                $key = $this->input('key');
                $value = $this->input('value');

                if (in_array($key, ['blocked_service', 'service_group'])) {
                    if (!is_array($value)) {
                        $validator->errors()->add('value', 'Nilai harus berupa objek.');
                        return;
                    }
                    if ($key === 'blocked_service' && (empty($value['id']) || !is_string($value['id']))) {
                        $validator->errors()->add('value.id', 'ID layanan tidak valid.');
                    }
                    if ($key === 'service_group' && (empty($value['group']) || !is_string($value['group']))) {
                        $validator->errors()->add('value.group', 'Grup layanan tidak valid.');
                    }
                }
            },
        ];
    }

    public function messages(): array
    {
        return [
            'key.in' => 'Pengaturan parental control tidak valid.',
            'value.required' => 'Nilai pengaturan harus diisi.',
        ];
    }
}
