import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

let requestHandler: ((config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig) | null = null;
let responseErrorHandler: ((error: unknown) => Promise<never>) | null = null;

vi.mock('axios', () => {
  const mockAxiosInstance: AxiosInstance = {
    interceptors: {
      request: { use: vi.fn((h: any) => { requestHandler = h; }), eject: vi.fn(), clear: vi.fn() },
      response: { use: vi.fn((_s: any, e: any) => { responseErrorHandler = e; }), eject: vi.fn(), clear: vi.fn() },
    },
  } as any;

  const mockCreate = vi.fn(() => mockAxiosInstance);

  return {
    default: { create: mockCreate },
  };
});

beforeEach(() => {
  vi.resetModules();
  localStorage.clear();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.advanceTimersByTime(3000);
  vi.useRealTimers();
});

function listenForNavigate(): Promise<string> {
  return new Promise((resolve) => {
    window.addEventListener('app:navigate', (e: Event) => {
      const detail = (e as CustomEvent).detail;
      resolve(detail.path);
    }, { once: true });
  });
}

describe('API Client interceptors', () => {
  describe('request interceptor', () => {
    it('attaches Bearer token when token exists in storage', async () => {
      localStorage.setItem('auth_token', 'my-token');
      await import('../../../app/services/api/client');
      const config = { headers: {} } as InternalAxiosRequestConfig;
      const result = requestHandler!(config);
      expect(result.headers!.Authorization).toBe('Bearer my-token');
    });

    it('does not attach token when no token in storage', async () => {
      await import('../../../app/services/api/client');
      const config = { headers: {} } as InternalAxiosRequestConfig;
      const result = requestHandler!(config);
      expect(result.headers!.Authorization).toBeUndefined();
    });
  });

  describe('response error interceptor — ADGUARD_UNAUTHORIZED', () => {
    it('redirects to /setup-api-key?reason=revoked on 401 + ADGUARD_UNAUTHORIZED', async () => {
      await import('../../../app/services/api/client');
      const navPromise = listenForNavigate();
      const error = {
        response: { status: 401, data: { code: 'ADGUARD_UNAUTHORIZED' } },
        config: { url: '/dashboard' },
      };

      await expect(responseErrorHandler!(error)).rejects.toMatchObject({
        code: 'ADGUARD_UNAUTHORIZED',
      });

      const path = await navPromise;
      expect(path).toBe('/setup-api-key?reason=revoked');
    });

    it('redirects to /login on 401 without ADGUARD code on non-auth route', async () => {
      await import('../../../app/services/api/client');
      const navPromise = listenForNavigate();
      const error = {
        response: { status: 401, data: { code: 'SESSION_EXPIRED' } },
        config: { url: '/dashboard' },
      };

      await expect(responseErrorHandler!(error)).rejects.toMatchObject({
        code: 'SESSION_EXPIRED',
      });

      const path = await navPromise;
      expect(path).toBe('/login');
    });

    it('does NOT redirect on 401 on auth routes (login, register, forgot-password)', async () => {
      await import('../../../app/services/api/client');
      const authRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/logout'];

      for (const url of authRoutes) {
        const error = {
          response: { status: 401, data: { code: 'SESSION_EXPIRED' } },
          config: { url },
        };
        await expect(responseErrorHandler!(error)).rejects.toMatchObject({
          code: 'SESSION_EXPIRED',
        });
      }
    });

    it('redirects to /setup-api-key on 403 + API_KEY_REQUIRED', async () => {
      await import('../../../app/services/api/client');
      const navPromise = listenForNavigate();
      const error = {
        response: { status: 403, data: { code: 'API_KEY_REQUIRED' } },
        config: { url: '/dashboard' },
      };

      await expect(responseErrorHandler!(error)).rejects.toMatchObject({
        code: 'API_KEY_REQUIRED',
      });

      const path = await navPromise;
      expect(path).toBe('/setup-api-key');
    });

    it('passes through 422 with errors field', async () => {
      await import('../../../app/services/api/client');
      const error = {
        response: {
          status: 422,
          data: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed.',
            errors: { email: ['The email field is required.'] },
          },
        },
        config: { url: '/auth/register' },
      };

      const result = responseErrorHandler!(error);
      await expect(result).rejects.toMatchObject({
        code: 'VALIDATION_ERROR',
        errors: { email: ['The email field is required.'] },
      });
    });

    it('passes through 5xx with generic message', async () => {
      await import('../../../app/services/api/client');
      const error = {
        response: { status: 500, data: { code: 'SERVER_ERROR', message: 'Internal error.' } },
        config: { url: '/dashboard' },
      };

      await expect(responseErrorHandler!(error)).rejects.toMatchObject({
        code: 'SERVER_ERROR',
        message: 'Internal error.',
      });
    });

    it('handles timeout (ECONNABORTED) with TIMEOUT code', async () => {
      await import('../../../app/services/api/client');
      const error = {
        code: 'ECONNABORTED',
        response: undefined,
        config: { url: '/dashboard' },
      };

      await expect(responseErrorHandler!(error)).rejects.toMatchObject({
        code: 'TIMEOUT',
        message: 'Permintaan waktu habis. Silakan coba lagi.',
      });
    });

    it('handles network error with NETWORK_ERROR code', async () => {
      await import('../../../app/services/api/client');
      const error = {
        code: 'ERR_NETWORK',
        response: undefined,
        config: { url: '/dashboard' },
      };

      await expect(responseErrorHandler!(error)).rejects.toMatchObject({
        code: 'NETWORK_ERROR',
        message: 'Gangguan jaringan. Periksa koneksi Anda.',
      });
    });

    it('throttles rapid duplicate navigate calls', async () => {
      await import('../../../app/services/api/client');

      const navSpy = vi.fn();
      window.addEventListener('app:navigate', navSpy);

      const error = {
        response: { status: 401, data: { code: 'ADGUARD_UNAUTHORIZED' } },
        config: { url: '/dashboard' },
      };

      await responseErrorHandler!(error).catch(() => {});
      await responseErrorHandler!(error).catch(() => {});

      expect(navSpy).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(2000);

      await responseErrorHandler!(error).catch(() => {});
      expect(navSpy).toHaveBeenCalledTimes(2);
    });

    it('dispatches different redirect paths within throttle window', async () => {
      await import('../../../app/services/api/client');

      const navSpy = vi.fn();
      window.addEventListener('app:navigate', navSpy);

      const adguardError = {
        response: { status: 401, data: { code: 'ADGUARD_UNAUTHORIZED' } },
        config: { url: '/dashboard' },
      };

      const sessionError = {
        response: { status: 401, data: { code: 'SESSION_EXPIRED' } },
        config: { url: '/settings' },
      };

      await responseErrorHandler!(adguardError).catch(() => {});
      expect(navSpy).toHaveBeenCalledTimes(1);

      await responseErrorHandler!(sessionError).catch(() => {});
      expect(navSpy).toHaveBeenCalledTimes(2);
    });
  });
});
