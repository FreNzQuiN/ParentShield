import type { ParentalControlSettings } from '../app/types/dashboard';
import { useParentalControlPage } from '../app/hooks/useParentalControlPage';
import { LoadingOverlay, InlineError } from '../app/components/shared';
import { ParentalControlSidebar, ServiceBlocklistByCategory, ServiceBlocklistProvider } from '../app/components/features/parentalControl';
import { useToast } from '../app/contexts/ToastContext';
import { useCallback } from 'react';
import { MAIN_TOGGLES_LABELS } from '../app/components/features/parentalControl/constants';

export default function ParentalControl() {
  const { settings, services, loading, error, isToggling, refresh, toggleSetting, toggleServiceGroup, toggleService } = useParentalControlPage();
  const { addToast } = useToast();

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
    try {
      await toggleServiceGroup(group, enabled);
      addToast({ type: 'success', message: `Grup layanan ${enabled ? 'diblokir' : 'diizinkan'}.` });
    } catch {
      addToast({ type: 'error', message: 'Gagal memperbarui grup layanan.' });
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
    return (
      <div className="flex h-[calc(100vh-128px)] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-text-muted">Memuat kontrol orang tua...</p>
        </div>
      </div>
    );
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
      <LoadingOverlay visible={!!isToggling && !!settings} />

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:gap-6">
        <ParentalControlSidebar
          settings={settings}
          isToggling={isToggling}
          onToggleSetting={handleToggleSetting}
        />

        <div className="flex-1 flex flex-col gap-5 lg:overflow-y-auto lg:max-h-[calc(100vh-128px)]">
          <ServiceBlocklistByCategory
            blockedServices={settings?.blocked_services ?? []}
            isToggling={isToggling}
            onToggleGroup={handleToggleGroup}
            parentalControlEnabled={settings?.enabled ?? false}
          />

          <ServiceBlocklistProvider
            blockedServices={settings?.blocked_services ?? []}
            services={services}
            isToggling={isToggling}
            onToggleService={handleToggleService}
            parentalControlEnabled={settings?.enabled ?? false}
          />
        </div>
      </div>
    </div>
  );
}
