import api from './client';
import type { DashboardData } from '../../types/dashboard';

export async function fetchDashboard(): Promise<DashboardData> {
  const response = await api.get<{ success: boolean; data: DashboardData }>('/dashboard');
  return response.data.data;
}

export async function updateSafebrowsing(key: string, value: boolean): Promise<void> {
  await api.put('/dashboard/safebrowsing', { key, value });
}
