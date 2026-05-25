import api from './client';
import type { ApiSuccessResponse } from '../../types/api';

export interface HasApiKeyResponse {
  has_api_key: boolean;
}

export async function storeApiKey(apiKey: string): Promise<HasApiKeyResponse> {
  const { data } = await api.post<ApiSuccessResponse<HasApiKeyResponse>>('/setup-api-key', {
    api_key: apiKey,
  });
  return data.data;
}

export async function checkStatus(): Promise<HasApiKeyResponse> {
  const { data } = await api.get<ApiSuccessResponse<HasApiKeyResponse>>('/setup-api-key/status');
  return data.data;
}
