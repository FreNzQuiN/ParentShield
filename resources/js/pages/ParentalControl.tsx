import { useState, useCallback } from 'react';
import type { ParentalControlSettings } from '../app/types/dashboard';
import { useParentalControlPage } from '../app/hooks/useParentalControlPage';
import { InlineError } from '../app/components/shared';
import { ParentalControlSidebar, ServiceBlocklistByCategory, ServiceBlocklistProvider } from '../app/components/features/parentalControl';
import ParentalControlSkeleton from '../app/components/features/parentalControl/ParentalControlSkeleton';
import { useToast } from '../app/contexts/ToastContext';
import { MAIN_TOGGLES_LABELS } from '../app/components/features/parentalControl/constants';

export default function ParentalControl() {
  const { settings, services, loading, error, refresh, toggleSetting, toggleServiceGroup, toggleService } = useParentalControlPage();
  const { addToast } = useToast();
  const [togglingGroup, setTogglingGroup] = useState<string | null>(null);

  const handleToggleSetting = useCallback(async (key: keyof ParentalControlSettings) => {
    const label = MAIN_TOGGLES_LABELS[key] ?? key;
    try {
      await toggleSetting(key);
      addToast({ type: 'success', message: `${label} berhasil diperbarui.` });
    } catch {
      addToast({ type: 'error', message: `Gagal memperbarui ${label.toLowerCase()}.` });
    }
  }, [toggleSetting, addToast]);

  const handleToggleGroup = useCallback(async (group: string, enabled: boolean) => {
    setTogglingGroup(group);
    try {
      await toggleServiceGroup(group, enabled);
      addToast({ type: 'success', message: `Grup layanan ${enabled ? 'diblokir' : 'diizinkan'}.` });
    } catch {
      addToast({ type: 'error', message: 'Gagal memperbarui grup layanan.' });
    } finally {
      setTogglingGroup(null);
    }
  }, [toggleServiceGroup, addToast]);

  const handleToggleService = useCallback(async (id: string, enabled: boolean) => {
    const svc = services.find((s) => s.id === id);
    const label = svc?.name ?? id;
    try {
      await toggleService(id, enabled);
      addToast({ type: 'success', message: `${label} ${enabled ? 'diblokir' : 'diizinkan'}.` });
    } catch {
      addToast({ type: 'error', message: `Gagal memperbarui ${label}.` });
    }
  }, [toggleService, addToast, services]);

  if (loading && !settings) {
    return <ParentalControlSkeleton />;
  }

  if (error && !settings) {
    return (
      <div className="flex h-[calc(100vh-128px)] items-center justify-center">
        <InlineError message={error} onRetry={refresh} />
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:gap-6">
        <ParentalControlSidebar
          settings={settings}
          onToggleSetting={handleToggleSetting}
        />

        <div className="flex-1 flex flex-col gap-5 lg:overflow-y-auto lg:max-h-[calc(100vh-128px)]">
          <ServiceBlocklistByCategory
            blockedServices={settings?.blocked_services ?? []}
            togglingGroup={togglingGroup}
            onToggleGroup={handleToggleGroup}
            parentalControlEnabled={settings?.enabled ?? false}
          />

          <ServiceBlocklistProvider
            blockedServices={settings?.blocked_services ?? []}
            services={services}
            togglingGroup={togglingGroup}
            onToggleService={handleToggleService}
            parentalControlEnabled={settings?.enabled ?? false}
          />
        </div>
      </div>
    </div>
  );
}
