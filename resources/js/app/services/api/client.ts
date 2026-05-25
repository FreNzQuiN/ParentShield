import axios, { AxiosError } from 'axios';
import type { ApiErrorResponse } from '../../types/api';

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
  const token = localStorage.getItem('auth_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const AUTH_ROUTES = ['/auth/login', '/auth/register', '/auth/forgot-password'];

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response) {
      const { status, data } = error.response;
      const requestUrl = error.config?.url ?? '';

      if (status === 401 && data?.code === 'ADGUARD_UNAUTHORIZED') {
        window.location.href = '/setup-api-key?reason=revoked';
        return Promise.reject(error);
      }

      if (status === 401 && !AUTH_ROUTES.some((r) => requestUrl.startsWith(r))) {
        window.location.href = '/login';
        return Promise.reject(error);
      }

      if (status === 403 && data?.code === 'API_KEY_REQUIRED') {
        window.location.href = '/setup-api-key';
        return Promise.reject(error);
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
