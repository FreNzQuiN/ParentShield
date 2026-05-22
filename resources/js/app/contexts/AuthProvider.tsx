import { useState, useCallback, useEffect, type ReactNode } from 'react';
import { AuthContext } from './AuthContext';
import type { User } from '../types/auth';
import * as authApi from '../services/api/auth';

const TOKEN_KEY = 'auth_token';

function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);

  const isAuthenticated = user !== null;

  const setAuthToken = useCallback((token: string) => {
    setStoredToken(token);
  }, []);

  const removeAuthToken = useCallback(() => {
    clearStoredToken();
  }, []);

  const onLogin = useCallback(async (email: string, password: string) => {
    setLoginError(null);
    setLoading(true);
    try {
      await authApi.csrfCookie();
      const { user: userData, token } = await authApi.login(email, password);
      setAuthToken(token);
      setUser(userData);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setLoginError(e?.message ?? 'Login failed. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setAuthToken]);

  const onRegister = useCallback(async (
    name: string,
    email: string,
    password: string,
    password_confirmation: string,
  ) => {
    setLoginError(null);
    setLoading(true);
    try {
      await authApi.csrfCookie();
      const { user: userData, token } = await authApi.register(
        name, email, password, password_confirmation,
      );
      setAuthToken(token);
      setUser(userData);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setLoginError(e?.message ?? 'Registration failed. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setAuthToken]);

  const onLogout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      removeAuthToken();
      setUser(null);
    }
  }, [removeAuthToken]);

  const clearError = useCallback(() => setLoginError(null), []);

  const checkAuth = useCallback(async (token: string) => {
    try {
      const { user: userData } = await authApi.me();
      setUser(userData);
    } catch {
      clearStoredToken();
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const token = getStoredToken();
    if (token) {
      setAuthToken(token);
      checkAuth(token).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [checkAuth, setAuthToken]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginError,
        isAuthenticated,
        onLogin,
        onRegister,
        onLogout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
