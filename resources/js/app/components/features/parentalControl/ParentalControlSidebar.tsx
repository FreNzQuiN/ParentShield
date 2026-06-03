import { useCallback, useState } from 'react';
import { GlobeIcon } from '../../shared/icons';
import ToggleSwitch from '../../shared/ToggleSwitch';
import type { ParentalControlSettings } from '../../../types/dashboard';

interface ParentalControlSidebarProps {
  settings: ParentalControlSettings | null;
  onToggleSetting: (key: keyof ParentalControlSettings) => Promise<void>;
}

const MAIN_TOGGLES = [
  { key: 'enabled' as const, label: 'Kontrol Orang Tua', description: 'Aktifkan fitur kontrol orang tua' },
  { key: 'block_adult_websites_enabled' as const, label: 'Blokir Konten Dewasa', description: 'Blokir situs konten dewasa' },
  { key: 'engines_safe_search_enabled' as const, label: 'Pencarian Aman', description: 'Terapkan pencarian aman di mesin pencari' },
  { key: 'youtube_safe_search_enabled' as const, label: 'YouTube Mode Terbatas', description: 'Batasi konten yang bisa diakses di YouTube' },
];

export default function ParentalControlSidebar({
  settings,
  onToggleSetting,
}: ParentalControlSidebarProps) {
  const [togglingKey, setTogglingKey] = useState<string | null>(null);
  const parentalEnabled = settings?.enabled ?? false;

  const handleToggle = useCallback(
    async (key: keyof ParentalControlSettings) => {
      setTogglingKey(key);
      try {
        await onToggleSetting(key);
      } catch {
        // error handled by parent
      } finally {
        setTogglingKey(null);
      }
    },
    [onToggleSetting]
  );

  return (
    <aside className="shrink-0 w-full lg:w-[320px] lg:sticky lg:top-6">
      <div className="rounded-xl border border-[rgba(193,198,214,0.2)] bg-white p-5 shadow-[0px_1px_1px_rgba(0,0,0,0.05)]">
        <div className="mb-4 flex items-center gap-2">
          <GlobeIcon className="text-primary" />
          <h3 className="text-base font-bold text-text-primary">Kontrol Orang Tua</h3>
        </div>

        <div className="flex flex-col gap-2">
          {MAIN_TOGGLES.map((t) => {
            const isMaster = t.key === 'enabled';
            const isDisabled =
              togglingKey !== null ||
              (!parentalEnabled && !isMaster);
            const isSubDisabled = !parentalEnabled && !isMaster;
            const active = settings?.[t.key] ?? false;

            return (
              <div
                key={t.key}
                className={`flex items-center justify-between rounded-lg bg-bg-card-inner p-3 transition-opacity ${
                  isSubDisabled ? 'opacity-50' : ''
                }`}
              >
                <div className="flex-1 mr-3">
                  <p className="text-sm font-medium text-text-primary">{t.label}</p>
                  <p className="text-xs text-text-muted">{t.description}</p>
                </div>
                <ToggleSwitch
                  active={active}
                  disabled={isDisabled}
                  ariaLabel={t.label}
                  onClick={() => handleToggle(t.key)}
                />
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
