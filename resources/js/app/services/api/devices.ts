import api from './client';
import type { ApiSuccessResponse } from '../../types/api';
import type { DeviceDetail, DeviceListResponse, SetupDeviceType } from '../../types/device';

export async function fetchDevices(): Promise<DeviceListResponse> {
  const { data } = await api.get<ApiSuccessResponse<DeviceListResponse>>('/devices');
  return data.data;
}

export async function createDevice(name: string, deviceType: SetupDeviceType): Promise<DeviceDetail> {
  const { data } = await api.post<ApiSuccessResponse<DeviceDetail>>('/devices', { name, device_type: deviceType });
  return data.data;
}

export async function getDevice(id: string): Promise<DeviceDetail> {
  const { data } = await api.get<ApiSuccessResponse<DeviceDetail>>(`/devices/${id}`);
  return data.data;
}

export async function updateDevice(id: string, name: string): Promise<DeviceDetail> {
  const { data } = await api.put<ApiSuccessResponse<DeviceDetail>>(`/devices/${id}`, { name });
  return data.data;
}

export async function deleteDevice(id: string): Promise<void> {
  await api.delete(`/devices/${id}`);
}

export async function downloadMobileConfig(id: string, deviceName: string): Promise<void> {
  const response = await api.get(`/devices/${id}/doh.mobileconfig`, {
    responseType: 'blob',
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  const safeName = deviceName.replace(/[^a-zA-Z0-9_-]/g, '_');
  link.setAttribute('download', `adguard-dns-${safeName}.mobileconfig`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
