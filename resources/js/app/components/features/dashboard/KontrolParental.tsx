import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../../contexts/ToastContext';
import { GlobeIcon } from '../../shared/icons';
import ToggleSwitch from '../../shared/ToggleSwitch';
import { DASHBOARD_GROUPS, getGroupState, getBlockedCount, getAllowedCount, type DashboardGroupDef } from '../../../constants/serviceGroups';
import type { ParentalControlSettings } from '../../../types/dashboard';

interface KontrolParentalProps {
  settings: ParentalControlSettings;
  onToggle: (
    key: keyof ParentalControlSettings | 'blocked_service' | 'service_group',
    value: boolean | { id: string; enabled: boolean } | { group: string; enabled: boolean }
  ) => Promise<void>;
}

const MAIN_TOGGLES = [
  { key: 'enabled' as const, label: 'Kontrol Orang Tua', description: 'Aktifkan fitur kontrol orang tua' },
  { key: 'block_adult_websites_enabled' as const, label: 'Blokir Konten Dewasa', description: 'Blokir situs konten dewasa' },
  { key: 'engines_safe_search_enabled' as const, label: 'Pencarian Aman', description: 'Pencarian aman di browser & YouTube' },
];

export default function KontrolParental({ settings, onToggle }: KontrolParentalProps) {
  const [toggling, setToggling] = useState<string | null>(null);
  const { addToast } = useToast();

  const isSafeSearchActive = settings.engines_safe_search_enabled && settings.youtube_safe_search_enabled;

  const handleMainToggle = useCallback(
    async (key: keyof ParentalControlSettings) => {
      setToggling(key);
      const label = MAIN_TOGGLES.find((t) => t.key === key)?.label ?? key;

      if (key === 'engines_safe_search_enabled') {
        const newVal = !isSafeSearchActive;
        try {
          await onToggle('engines_safe_search_enabled', newVal);
          await onToggle('youtube_safe_search_enabled', newVal);
          addToast({ type: 'success', message: `Pencarian Aman berhasil ${newVal ? 'diaktifkan' : 'dinonaktifkan'}.` });
        } catch {
          addToast({ type: 'error', message: 'Gagal memperbarui Pencarian Aman.' });
        } finally {
          setToggling(null);
        }
        return;
      }

      const newVal = !settings[key];
      try {
        await onToggle(key, newVal);
        addToast({ type: 'success', message: `${label} berhasil ${newVal ? 'diaktifkan' : 'dinonaktifkan'}.` });
      } catch {
        addToast({ type: 'error', message: `Gagal memperbarui ${label.toLowerCase()}.` });
      } finally {
        setToggling(null);
      }
    },
    [onToggle, addToast, settings, isSafeSearchActive]
  );

  const handleGroupToggle = useCallback(
    async (group: DashboardGroupDef, enabled: boolean) => {
      const toggleKey = `grp:${group.key}`;
      setToggling(toggleKey);
      try {
        await onToggle('service_group', { group: group.key, enabled });
        addToast({ type: 'success', message: `${group.label} ${enabled ? 'diblokir' : 'diizinkan'}.` });
      } catch {
        addToast({ type: 'error', message: `Gagal memperbarui ${group.label.toLowerCase()}.` });
      } finally {
        setToggling(null);
      }
    },
    [onToggle, addToast]
  );

  return (
    <div className="rounded-xl border border-[rgba(193,198,214,0.2)] bg-white p-4 shadow-[0px_1px_1px_rgba(0,0,0,0.05)]">
      <div className="mb-3 flex items-center gap-2">
        <GlobeIcon className="text-primary" />
        <h3 className="text-sm font-medium text-text-primary">Kontrol Orang Tua</h3>
        <Link
          to="/parental-control"
          className="ml-auto text-xs font-medium text-primary hover:underline"
        >
          Lihat Semua
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        {MAIN_TOGGLES.map((t) => {
          const isEngines = t.key === 'engines_safe_search_enabled';
          const active = isEngines ? isSafeSearchActive : settings[t.key];
          return (
            <div key={t.key} className="flex items-center justify-between rounded-lg bg-bg-card-inner p-3">
              <div className="flex-1 mr-3">
                <p className="text-sm font-medium text-text-primary">{t.label}</p>
                <p className="text-xs text-text-muted">{t.description}</p>
              </div>
              <ToggleSwitch
                active={active}
                disabled={toggling === t.key}
                ariaLabel={t.label}
                onClick={() => handleMainToggle(t.key)}
              />
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-[rgba(193,198,214,0.3)]">
        <h4 className="mb-2 text-xs font-semibold tracking-[0.3px] text-text-secondary uppercase">
          Pembatasan Layanan
        </h4>
        <div className="flex flex-col gap-2">
          {DASHBOARD_GROUPS.map((group) => {
            const state = getGroupState(group, settings.blocked_services);
            const isFullyBlocked = state === 'blocked';
            const isPartial = state === 'partial';
            const blockedCount = getBlockedCount(group, settings.blocked_services);
            const allowedCount = getAllowedCount(group, settings.blocked_services);

            return (
              <div key={group.key} className="flex items-center justify-between rounded-lg bg-bg-card-inner p-3">
                <div className="flex-1 mr-3">
                  <span className="text-sm font-medium text-text-primary">
                    {group.label}
                    {isPartial && <span className="ml-1 text-[10px] text-text-muted font-medium">(Sebagian)</span>}
                  </span>
                  {isPartial ? (
                    <p className="text-[10px] text-text-muted">{blockedCount} Layanan diblokir, {allowedCount} Layanan diizinkan.</p>
                  ) : (
                    <p className="text-[10px] text-text-muted">
                      {isFullyBlocked ? `${blockedCount} Layanan diblokir.` : `${allowedCount} Layanan diizinkan.`}
                    </p>
                  )}
                </div>
                <ToggleSwitch
                  active={isFullyBlocked}
                  disabled={toggling === `grp:${group.key}`}
                  activeColor="bg-danger-bar"
                  ariaLabel={group.label}
                  onClick={() => handleGroupToggle(group, !isFullyBlocked)}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
