import api from './client';
import type { ApiSuccessResponse } from '../../types/api';
import type { DashboardData, ParentalControlSettings, SafebrowsingSettings, WebServiceInfo } from '../../types/dashboard';

export async function fetchDashboard(): Promise<DashboardData> {
  const { data } = await api.get<ApiSuccessResponse<DashboardData>>('/dashboard');
  return data.data;
}

export async function fetchServices(): Promise<WebServiceInfo[]> {
  const { data } = await api.get<ApiSuccessResponse<WebServiceInfo[]>>('/dashboard/services');
  return data.data;
}

export async function updateSafebrowsing(key: keyof SafebrowsingSettings, value: boolean): Promise<void> {
  await api.put('/dashboard/safebrowsing', { key, value });
}

export async function updateParentalControl(
  key: keyof ParentalControlSettings | 'blocked_service' | 'service_group',
  value: boolean | { id: string; enabled: boolean } | { group: string; enabled: boolean }
): Promise<void> {
  await api.put('/dashboard/parental-control', { key, value });
}
