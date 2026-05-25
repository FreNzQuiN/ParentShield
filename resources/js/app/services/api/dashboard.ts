import api from './client';
import type { DashboardData, ParentalControlSettings, SafebrowsingSettings } from '../../types/dashboard';

export async function fetchDashboard(): Promise<DashboardData> {
  const response = await api.get<{ success: boolean; data: DashboardData }>('/dashboard');
  return response.data.data;
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
