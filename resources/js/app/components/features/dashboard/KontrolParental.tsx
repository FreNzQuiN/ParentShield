import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../../contexts/ToastContext';
import { GlobeIcon } from '../../shared/icons';
import { SERVICE_GROUPS, getGroupState, type ServiceGroupKey } from '../../../constants/serviceGroups';
import type { ParentalControlSettings } from '../../../types/dashboard';

interface KontrolParentalProps {
  settings: ParentalControlSettings;
  onToggle: (
    key: keyof ParentalControlSettings | 'blocked_service' | 'service_group',
    value: boolean | { id: string; enabled: boolean } | { group: string; enabled: boolean }
  ) => Promise<void>;
}

const MAIN_TOGGLES = [
  { key: 'enabled' as const, label: 'Kontrol Parental', description: 'Aktifkan fitur kontrol parental' },
  { key: 'block_adult_websites_enabled' as const, label: 'Blokir Konten Dewasa', description: 'Blokir situs konten dewasa (porno)' },
  { key: 'engines_safe_search_enabled' as const, label: 'Pencarian Aman', description: 'Terapkan pencarian aman di mesin pencari & YouTube' },
];

function groupLabel(key: ServiceGroupKey): string {
  const def = SERVICE_GROUPS[key];
  return def ? `${def.label} (${def.services.length})` : key;
}

function ToggleSwitch({
  active,
  disabled,
  activeColor,
  ariaLabel,
  onClick,
}: {
  active: boolean;
  disabled?: boolean;
  activeColor?: string;
  ariaLabel: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
        disabled ? 'opacity-60' : ''
      } ${active ? activeColor ?? 'bg-[#1b6d24]' : 'bg-[#dfe3e8]'}`}
      aria-label={ariaLabel}
    >
      <span
        className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
          active ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

export default function KontrolParental({ settings, onToggle }: KontrolParentalProps) {
  const [toggling, setToggling] = useState<string | null>(null);
  const { addToast } = useToast();

  const handleMainToggle = useCallback(
    async (key: keyof ParentalControlSettings) => {
      setToggling(key);
      const newVal = !settings[key];
      const label = MAIN_TOGGLES.find((t) => t.key === key)?.label ?? key;
      try {
        await onToggle(key, newVal);
        addToast({ type: 'success', message: `${label} berhasil ${newVal ? 'diaktifkan' : 'dinonaktifkan'}.` });
      } catch {
        addToast({ type: 'error', message: `Gagal memperbarui ${label.toLowerCase()}.` });
      } finally {
        setToggling(null);
      }
    },
    [onToggle, addToast, settings]
  );

  const handleGroupToggle = useCallback(
    async (group: string, enabled: boolean) => {
      const toggleKey = `grp:${group}`;
      setToggling(toggleKey);
      const label = groupLabel(group as ServiceGroupKey);
      try {
        await onToggle('service_group', { group, enabled });
        addToast({ type: 'success', message: `${label} ${enabled ? 'diblokir' : 'diizinkan'}.` });
      } catch {
        addToast({ type: 'error', message: `Gagal memperbarui ${label.toLowerCase()}.` });
      } finally {
        setToggling(null);
      }
    },
    [onToggle, addToast]
  );

  const groupKeys = Object.keys(SERVICE_GROUPS) as ServiceGroupKey[];

  return (
    <div className="rounded-xl border border-[rgba(193,198,214,0.2)] bg-white p-4 shadow-[0px_1px_1px_rgba(0,0,0,0.05)]">
      <div className="mb-3 flex items-center gap-2">
        <GlobeIcon className="text-[#005bbf]" />
        <h3 className="font-['Roboto',sans-serif] text-sm font-medium text-[#181c20]">Kontrol Parental</h3>
        <Link
          to="/parental-control"
          className="ml-auto text-xs font-medium text-[#005bbf] hover:underline"
        >
          Lihat Semua
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        {MAIN_TOGGLES.map((t) => (
          <div key={t.key} className="flex items-center justify-between rounded-lg bg-[#f7f9ff] p-3">
            <div className="flex-1 mr-3">
              <p className="font-['Roboto',sans-serif] text-sm font-medium text-[#181c20]">{t.label}</p>
              <p className="font-['Roboto',sans-serif] text-xs text-[#727785]">{t.description}</p>
            </div>
            <ToggleSwitch
              active={settings[t.key]}
              disabled={toggling === t.key}
              ariaLabel={t.label}
              onClick={() => handleMainToggle(t.key)}
            />
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-[rgba(193,198,214,0.3)]">
        <h4 className="mb-2 font-['Roboto',sans-serif] text-xs font-semibold tracking-[0.3px] text-[#414754] uppercase">
          Pembatasan Layanan
        </h4>
        <div className="flex flex-col gap-2">
          {groupKeys.map((key) => {
            const state = getGroupState(key, settings.blocked_services);
            const isBlocked = state !== 'allowed';
            const isPartial = state === 'partial';

            return (
              <div key={key} className="flex items-center justify-between rounded-lg bg-[#f7f9ff] p-3">
                <div className="flex items-center gap-2 flex-1 mr-3">
                  <span className="font-['Roboto',sans-serif] text-sm font-medium text-[#181c20]">
                    {groupLabel(key)}
                  </span>
                  {isPartial && (
                    <span className="text-[10px] text-[#727785] font-medium">Sebagian</span>
                  )}
                </div>
                <ToggleSwitch
                  active={isBlocked}
                  disabled={toggling === `grp:${key}`}
                  activeColor="bg-[#dd3635]"
                  ariaLabel={groupLabel(key)}
                  onClick={() => handleGroupToggle(key, !isBlocked)}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
