import { useState, useEffect, useCallback } from 'react';
import type { DashboardData, SafebrowsingSettings } from '../types/dashboard';
import { fetchDashboard, updateSafebrowsing } from '../services/api/dashboard';

interface UseDashboardResult {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  softRefresh: () => Promise<void>;
  isRefreshing: boolean;
  toggleSafebrowsing: (key: keyof SafebrowsingSettings, value: boolean) => Promise<void>;
}

export function useDashboard(): UseDashboardResult {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchDashboard();
      setData(result);
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'message' in err
          ? (err as { message: string }).message
          : 'Gagal memuat data dashboard.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const softRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const result = await fetchDashboard();
      setData(result);
    } catch {
      // silent – keep current data
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const toggleSafebrowsing = useCallback(
    async (key: keyof SafebrowsingSettings, value: boolean) => {
      await updateSafebrowsing(key, value);
    },
    []
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, error, refresh, softRefresh, isRefreshing, toggleSafebrowsing };
}
