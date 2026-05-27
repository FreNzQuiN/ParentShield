import api from './client';
import type { ApiSuccessResponse } from '../../types/api';
import type { AuthData, MeData } from '../../types/auth';

export async function login(email: string, password: string): Promise<AuthData> {
  const { data } = await api.post<ApiSuccessResponse<AuthData>>('/auth/login', { email, password });
  return data.data;
}

export async function register(
  name: string,
  email: string,
  password: string,
  password_confirmation: string,
): Promise<AuthData> {
  const { data } = await api.post<ApiSuccessResponse<AuthData>>('/auth/register', {
    name,
    email,
    password,
    password_confirmation,
  });
  return data.data;
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout');
}

export async function me(): Promise<MeData> {
  const { data } = await api.get<ApiSuccessResponse<MeData>>('/auth/me');
  return data.data;
}

export async function forgotPassword(email: string): Promise<void> {
  await api.post('/auth/forgot-password', { email });
}

export async function refresh(): Promise<AuthData> {
  const { data } = await api.post<ApiSuccessResponse<AuthData>>('/auth/refresh');
  return data.data;
}

export async function updateProfile(name: string): Promise<MeData> {
  const { data } = await api.put<ApiSuccessResponse<MeData>>('/auth/profile', { name });
  return data.data;
}

export async function changePassword(
  current_password: string,
  password: string,
  password_confirmation: string,
): Promise<void> {
  await api.put('/auth/password', { current_password, password, password_confirmation });
}
