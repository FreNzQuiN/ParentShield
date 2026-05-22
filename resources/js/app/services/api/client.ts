import axios, { AxiosError } from 'axios';
import type { ApiErrorResponse } from '../../types/api';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  timeout: 30000,
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response) {
      const { status, data } = error.response;

      if (status === 401) {
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
        message: data?.message ?? 'An unexpected error occurred.',
        errors: data?.errors,
      } as ApiErrorResponse);
    }

    if (error.code === 'ECONNABORTED') {
      return Promise.reject({
        success: false,
        code: 'TIMEOUT',
        message: 'Request timed out. Please try again.',
      } as ApiErrorResponse);
    }

    return Promise.reject({
      success: false,
      code: 'NETWORK_ERROR',
      message: 'Network error. Please check your connection.',
    } as ApiErrorResponse);
  },
);

export default api;
