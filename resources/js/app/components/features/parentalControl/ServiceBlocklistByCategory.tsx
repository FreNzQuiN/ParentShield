import { useCallback, useState } from 'react';
import { SERVICE_GROUPS, getGroupState, getBlockedCount, getAllowedCount, type ServiceGroupKey } from '../../../constants/serviceGroups';
import type { BlockedWebService } from '../../../types/dashboard';

interface Props {
  blockedServices: BlockedWebService[];
  isToggling: string | null;
  onToggleGroup: (group: string, enabled: boolean) => Promise<void>;
  parentalControlEnabled: boolean;
}

function ToggleSwitch({ active, disabled, ariaLabel, onClick }: { active: boolean; disabled?: boolean; ariaLabel: string; onClick: () => void }) {
  return (
    <button onClick={onClick} disabled={disabled} className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${disabled ? 'opacity-60' : ''} ${active ? 'bg-danger-bar' : 'bg-inactive'}`} aria-label={ariaLabel}>
      <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${active ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );
}

function groupLabel(key: ServiceGroupKey): string {
  const def = SERVICE_GROUPS[key];
  return def ? def.label : key;
}

export default function ServiceBlocklistByCategory({ blockedServices, isToggling, onToggleGroup, parentalControlEnabled }: Props) {
  const [localToggling, setLocalToggling] = useState<string | null>(null);
  const groupKeys = Object.keys(SERVICE_GROUPS) as ServiceGroupKey[];

  const handleToggle = useCallback(async (group: string, enabled: boolean) => {
    const toggleKey = `grp:${group}`;
    if (isToggling) return;
    setLocalToggling(toggleKey);
    try {
      await onToggleGroup(group, enabled);
    } catch {
      // parent handles error
    } finally {
      setLocalToggling(null);
    }
  }, [isToggling, onToggleGroup]);

  const disabled = isToggling !== null || localToggling !== null || !parentalControlEnabled;

  return (
    <div className={`rounded-xl border border-[rgba(193,198,214,0.2)] bg-white p-5 shadow-[0px_1px_1px_rgba(0,0,0,0.05)] transition-opacity ${!parentalControlEnabled ? 'opacity-50' : ''}`}>
      <div className="mb-4">
        <h3 className="text-base font-bold text-text-primary">Pembatasan Layanan per Kategori</h3>
        <p className="mt-1 text-xs text-text-muted">Aktifkan pembatasan untuk seluruh kategori layanan</p>
      </div>
      <div className={`flex flex-col gap-2 ${disabled ? 'pointer-events-none' : ''}`}>
        {groupKeys.map((key) => {
          const state = getGroupState(key, blockedServices);
          const isFullyBlocked = state === 'blocked';
          const isPartial = state === 'partial';
          const toggleKey = `grp:${key}`;
          const busy = localToggling === toggleKey;
          const blocked = getBlockedCount(key, blockedServices);
          const allowed = getAllowedCount(key, blockedServices);

          return (
            <div key={key} className="flex items-center justify-between rounded-lg bg-bg-card-inner p-3">
              <div className="flex-1 mr-3">
                <span className="text-sm font-medium text-text-primary">
                  {groupLabel(key)}
                  {isPartial && <span className="ml-1 text-[10px] text-text-muted font-medium">(Sebagian)</span>}
                </span>
                {busy && <span className="ml-1 text-[10px] text-primary font-medium animate-pulse">Menyimpan...</span>}
                {isPartial ? (
                  <p className="text-[10px] text-text-muted">{blocked} Layanan diblokir, {allowed} Layanan diizinkan.</p>
                ) : (
                  <p className="text-[10px] text-text-muted">
                    {isFullyBlocked ? `${blocked} Layanan diblokir.` : `${allowed} Layanan diizinkan.`}
                  </p>
                )}
              </div>
              <ToggleSwitch active={isFullyBlocked} disabled={disabled} ariaLabel={groupLabel(key)} onClick={() => handleToggle(key, !isFullyBlocked)} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
