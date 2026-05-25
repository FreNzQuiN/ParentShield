import axios, { AxiosError } from 'axios';
import type { ApiErrorResponse } from '../../types/api';
import { getStoredToken, clearStoredToken } from '../../utils/storage';

const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const AUTH_ROUTES = ['/auth/login', '/auth/register', '/auth/forgot-password'];

function redirect(href: string): never {
  clearStoredToken();
  window.location.href = href;
  return new Promise(() => {}) as never;
}

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response) {
      const { status, data } = error.response;
      const requestUrl = error.config?.url ?? '';

      if (status === 401 && data?.code === 'ADGUARD_UNAUTHORIZED') {
        return redirect('/setup-api-key?reason=revoked');
      }

      if (status === 401 && !AUTH_ROUTES.some((r) => requestUrl.startsWith(r))) {
        return redirect('/login');
      }

      if (status === 403 && data?.code === 'API_KEY_REQUIRED') {
        return redirect('/setup-api-key');
      }

      return Promise.reject({
        success: false,
        code: data?.code ?? 'NETWORK_ERROR',
        message: data?.message ?? 'Terjadi kesalahan tak terduga.',
        errors: data?.errors,
      } as ApiErrorResponse);
    }

    if (error.code === 'ECONNABORTED') {
      return Promise.reject({
        success: false,
        code: 'TIMEOUT',
        message: 'Permintaan waktu habis. Silakan coba lagi.',
      } as ApiErrorResponse);
    }

    return Promise.reject({
      success: false,
      code: 'NETWORK_ERROR',
      message: 'Gangguan jaringan. Periksa koneksi Anda.',
    } as ApiErrorResponse);
  },
);

export default api;
