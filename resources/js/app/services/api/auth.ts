import api from './client';
import type { ApiSuccessResponse } from '../../types/api';
import type { AuthData, MeData } from '../../types/auth';

export async function csrfCookie(): Promise<void> {
  const response = await fetch('/sanctum/csrf-cookie', { credentials: 'include' });
  if (!response.ok) {
    throw new Error('Gagal mendapatkan CSRF cookie.');
  }
}

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
