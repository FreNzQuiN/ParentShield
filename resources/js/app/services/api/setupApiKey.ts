import api from './client';
import type { ApiSuccessResponse } from '../../types/api';

export interface SetupApiKeyData {
  has_api_key: boolean;
}

export interface StatusData {
  has_api_key: boolean;
}

export async function storeApiKey(apiKey: string): Promise<SetupApiKeyData> {
  const { data } = await api.post<ApiSuccessResponse<SetupApiKeyData>>('/setup-api-key', {
    api_key: apiKey,
  });
  return data.data;
}

export async function checkStatus(): Promise<StatusData> {
  const { data } = await api.get<ApiSuccessResponse<StatusData>>('/setup-api-key/status');
  return data.data;
}
