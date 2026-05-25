import axios, { AxiosError } from 'axios';
import type { ApiErrorResponse } from '../../types/api';
import { getStoredToken } from '../../utils/storage';

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

const AUTH_ROUTES = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/logout'];

let navigateTimeout: ReturnType<typeof setTimeout> | null = null;

function navigateApp(path: string): void {
  if (navigateTimeout) return;
  navigateTimeout = setTimeout(() => { navigateTimeout = null; }, 2000);
  window.dispatchEvent(new CustomEvent('app:navigate', { detail: { path } }));
}

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response) {
      const { status, data } = error.response;
      const requestUrl = error.config?.url ?? '';

      if (status === 401 && data?.code === 'ADGUARD_UNAUTHORIZED') {
        navigateApp('/setup-api-key?reason=revoked');
        return Promise.reject({
          success: false,
          code: 'ADGUARD_UNAUTHORIZED',
          message: 'Kunci API tidak valid atau telah kedaluwarsa.',
        } as ApiErrorResponse);
      }

      if (status === 401 && !AUTH_ROUTES.some((r) => requestUrl.startsWith(r))) {
        navigateApp('/login');
        return Promise.reject({
          success: false,
          code: 'SESSION_EXPIRED',
          message: 'Sesi Anda telah berakhir.',
        } as ApiErrorResponse);
      }

      if (status === 403 && data?.code === 'API_KEY_REQUIRED') {
        navigateApp('/setup-api-key');
        return Promise.reject({
          success: false,
          code: 'API_KEY_REQUIRED',
          message: 'Kunci API diperlukan.',
        } as ApiErrorResponse);
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
