import { useState, useEffect, useCallback, useRef } from "react";
import type { ParentalControlSettings, WebServiceInfo } from "../types/dashboard";
import { fetchDashboard, fetchServices, updateParentalControl } from "../services/api/dashboard";
import { applyServiceGroup } from "../utils/parentalControl";
import { getErrorMessage } from "../utils/error";

export interface UseParentalControlPageResult {
  settings: ParentalControlSettings | null;
  services: WebServiceInfo[];
  loading: boolean;
  error: string | null;
  isToggling: string | null;
  refresh: () => Promise<void>;
  toggleSetting: (key: keyof ParentalControlSettings, value?: boolean) => Promise<void>;
  toggleServiceGroup: (group: string, enabled: boolean) => Promise<void>;
  toggleService: (id: string, enabled: boolean) => Promise<void>;
}

export function useParentalControlPage(): UseParentalControlPageResult {
  const [settings, setSettings] = useState<ParentalControlSettings | null>(null);
  const [services, setServices] = useState<WebServiceInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isToggling, setIsToggling] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const refresh = useCallback(async () => {
    if (!mountedRef.current) return;
    setLoading(true);
    setError(null);
    try {
      const [dashData, svcData] = await Promise.all([
        fetchDashboard(),
        fetchServices(),
      ]);
      if (mountedRef.current) {
        setSettings(dashData.parental_control);
        setServices(svcData);
      }
    } catch (err: unknown) {
      const msg = getErrorMessage(err, "Gagal memuat data kontrol orang tua.");
      if (mountedRef.current) setError(msg);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    refresh();
    return () => {
      mountedRef.current = false;
    };
  }, [refresh]);

  const toggleSetting = useCallback(
    async (key: keyof ParentalControlSettings, value?: boolean) => {
      setIsToggling(key);
      const newVal = value ?? !settings?.[key];
      setSettings((prev) =>
        prev ? { ...prev, [key]: newVal } : prev
      );
      try {
        await updateParentalControl(key, newVal);
      } catch {
        setSettings((prev) =>
          prev ? { ...prev, [key]: !newVal } : prev
        );
        throw new Error('Gagal memperbarui pengaturan.');
      } finally {
        setIsToggling(null);
      }
    },
    [settings]
  );

  const toggleServiceGroup = useCallback(
    async (group: string, enabled: boolean) => {
      const toggleKey = `grp:${group}`;
      setIsToggling(toggleKey);
      setSettings((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          blocked_services: applyServiceGroup(prev.blocked_services, group, enabled),
        };
      });
      try {
        await updateParentalControl("service_group", { group, enabled });
      } catch {
        setSettings((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            blocked_services: applyServiceGroup(prev.blocked_services, group, !enabled),
          };
        });
        throw new Error("Gagal memperbarui grup layanan.");
      } finally {
        setIsToggling(null);
      }
    },
    []
  );

  const toggleService = useCallback(
    async (id: string, enabled: boolean) => {
      const toggleKey = `svc:${id}`;
      setIsToggling(toggleKey);
      setSettings((prev) => {
        if (!prev) return prev;
        const exists = prev.blocked_services.some((s) => s.id === id);
        return {
          ...prev,
          blocked_services: exists
            ? prev.blocked_services.map((s) =>
                s.id === id ? { ...s, enabled } : s
              )
            : [...prev.blocked_services, { id, enabled }],
        };
      });
      try {
        await updateParentalControl("blocked_service", { id, enabled });
      } catch {
        setSettings((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            blocked_services: prev.blocked_services.map((s) =>
              s.id === id ? { ...s, enabled: !enabled } : s
            ),
          };
        });
        throw new Error("Gagal memperbarui layanan.");
      } finally {
        setIsToggling(null);
      }
    },
    []
  );

  return {
    settings,
    services,
    loading,
    error,
    isToggling,
    refresh,
    toggleSetting,
    toggleServiceGroup,
    toggleService,
  };
}
