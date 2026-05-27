import { useState, useEffect, useCallback, useRef } from 'react';
import type { DashboardData, ParentalControlSettings, SafebrowsingSettings } from '../types/dashboard';
import { fetchDashboard, updateParentalControl, updateSafebrowsing } from '../services/api/dashboard';
import { applyServiceGroup } from '../utils/parentalControl';
import { getErrorMessage } from '../utils/error';

interface UseDashboardResult {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  lastRefresh: number | null;
  retryCount: number;
  refresh: () => Promise<void>;
  softRefresh: () => Promise<void>;
  isRefreshing: boolean;
  toggleSafebrowsing: (key: keyof SafebrowsingSettings, value: boolean) => Promise<void>;
  toggleParentalControl: (
    key: keyof ParentalControlSettings | 'blocked_service' | 'service_group',
    value: boolean | { id: string; enabled: boolean } | { group: string; enabled: boolean }
  ) => Promise<void>;
}

export function useDashboard(): UseDashboardResult {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<number | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const mountedRef = useRef(true);

  const refresh = useCallback(async () => {
    if (!mountedRef.current) return;
    setLoading(true);
    setError(null);
    setRetryCount(0);
    try {
      const result = await fetchDashboard();
      if (mountedRef.current) {
        setData(result);
        setLastRefresh(Date.now());
      }
    } catch (err: unknown) {
      const msg = getErrorMessage(err, 'Gagal memuat data dashboard.');
      if (mountedRef.current) setError(msg);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  const softRefresh = useCallback(async () => {
    if (!mountedRef.current) return;
    setIsRefreshing(true);
    setError(null);
    try {
      const result = await fetchDashboard();
      if (mountedRef.current) {
        setData(result);
        setLastRefresh(Date.now());
      }
    } catch (err) {
      if (mountedRef.current) {
        console.warn('[useDashboard] softRefresh failed, keeping current data', err);
        setError('Gagal memuat ulang data. Menampilkan data sebelumnya.');
      }
    } finally {
      if (mountedRef.current) setIsRefreshing(false);
    }
  }, []);

  const retryCountRef = useRef(0);
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  function isStaleCache(data: DashboardData): boolean {
    return data.stats.total_queries === 0 && data.time_series.length === 0 && data.top_activities.length > 0;
  }

  useEffect(() => {
    if (!data || retryCountRef.current >= 3 || !isStaleCache(data)) return;

    retryCountRef.current++;
    setRetryCount(retryCountRef.current);
    pollTimerRef.current = setTimeout(() => {
      softRefresh();
    }, 4000);

    return () => {
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    };
  }, [data, softRefresh]);

  const toggleSafebrowsing = useCallback(
    async (key: keyof SafebrowsingSettings, value: boolean) => {
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          safebrowsing: { ...prev.safebrowsing, [key]: value },
        };
      });

      try {
        await updateSafebrowsing(key, value);
      } catch (err) {
        setData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            safebrowsing: { ...prev.safebrowsing, [key]: !value },
          };
        });
        throw err;
      }
    },
    []
  );

  const toggleParentalControl = useCallback(
    async (
      key: keyof ParentalControlSettings | 'blocked_service' | 'service_group',
      value: boolean | { id: string; enabled: boolean } | { group: string; enabled: boolean }
    ) => {
      setData((prev) => {
        if (!prev) return prev;
        if (key === 'blocked_service') {
          const svc = value as { id: string; enabled: boolean };
          const exists = prev.parental_control.blocked_services.some((s) => s.id === svc.id);
          return {
            ...prev,
            parental_control: {
              ...prev.parental_control,
              blocked_services: exists
                ? prev.parental_control.blocked_services.map((s) =>
                    s.id === svc.id ? { ...s, enabled: svc.enabled } : s
                  )
                : [...prev.parental_control.blocked_services, svc],
            },
          };
        }
        if (key === 'service_group') {
          const { group, enabled } = value as { group: string; enabled: boolean };
          return {
            ...prev,
            parental_control: {
              ...prev.parental_control,
              blocked_services: applyServiceGroup(prev.parental_control.blocked_services, group, enabled),
            },
          };
        }
        return {
          ...prev,
          parental_control: {
            ...prev.parental_control,
            [key]: value as boolean,
          },
        };
      });

      try {
        await updateParentalControl(key, value);
      } catch (err) {
        if (key === 'blocked_service' || key === 'service_group') {
          softRefresh();
        } else if (typeof value === 'boolean') {
          setData((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              parental_control: {
                ...prev.parental_control,
                [key]: !value,
              },
            };
          });
        }
        throw err;
      }
    },
    [softRefresh]
  );

  useEffect(() => {
    mountedRef.current = true;
    refresh();
    return () => {
      mountedRef.current = false;
    };
  }, [refresh]);

  return { data, loading, error, lastRefresh, retryCount, refresh, softRefresh, isRefreshing, toggleSafebrowsing, toggleParentalControl };
}
