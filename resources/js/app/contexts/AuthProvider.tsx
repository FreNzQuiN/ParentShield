import { useState, useCallback, useEffect, type ReactNode } from 'react';
import { AuthContext } from './AuthContext';
import { getStoredToken, setStoredToken, clearStoredToken } from '../utils/storage';
import type { User } from '../types/auth';
import * as authApi from '../services/api/auth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);

  const isAuthenticated = user !== null;
  const hasApiKey = user?.has_api_key === true;

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
      const { user: userData, token } = await authApi.login(email, password);
      setAuthToken(token);
      setUser(userData);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setLoginError(e?.message ?? 'Login gagal. Silakan coba lagi.');
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
      const { user: userData, token } = await authApi.register(
        name, email, password, password_confirmation,
      );
      setAuthToken(token);
      setUser(userData);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setLoginError(e?.message ?? 'Registrasi gagal. Silakan coba lagi.');
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

  const refreshUser = useCallback(async () => {
    try {
      const { user: userData } = await authApi.me();
      setUser(userData);
    } catch {
      // ignore — user stays logged in with stale data
    }
  }, []);

  const clearError = useCallback(() => setLoginError(null), []);

  const checkAuth = useCallback(async () => {
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
      checkAuth().finally(() => setLoading(false));
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
        hasApiKey,
        onLogin,
        onRegister,
        onLogout,
        clearError,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
