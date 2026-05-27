import { useCallback, useMemo, useState } from 'react';
import type { BlockedWebService, WebServiceInfo } from '../../../types/dashboard';
import { getGroupForService } from '../../../constants/serviceGroups';

interface Props {
  blockedServices: BlockedWebService[];
  services: WebServiceInfo[];
  isToggling: string | null;
  onToggleService: (id: string, enabled: boolean) => Promise<void>;
  parentalControlEnabled: boolean;
}

function ToggleSwitch({ active, disabled, ariaLabel, onClick }: { active: boolean; disabled?: boolean; ariaLabel: string; onClick: () => void }) {
  return (
    <button onClick={onClick} disabled={disabled} className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${disabled ? 'opacity-60' : ''} ${active ? 'bg-danger-bar' : 'bg-inactive'}`} aria-label={ariaLabel}>
      <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${active ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );
}

export default function ServiceBlocklistProvider({ blockedServices, services, isToggling, onToggleService, parentalControlEnabled }: Props) {
  const [search, setSearch] = useState('');
  const [localToggling, setLocalToggling] = useState<string | null>(null);

  const getCategoryLabel = useCallback((serviceId: string): string | null => {
    return getGroupForService(serviceId);
  }, []);

  const sortedServices = useMemo(() => {
    return [...services]
      .filter((s) => s.name.toLowerCase().includes(search.toLowerCase()) || s.id.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [services, search]);

  const handleToggle = useCallback(async (id: string, enabled: boolean) => {
    const toggleKey = `svc:${id}`;
    if (isToggling) return;
    setLocalToggling(toggleKey);
    try {
      await onToggleService(id, enabled);
    } catch {
      // parent handles error
    } finally {
      setLocalToggling(null);
    }
  }, [isToggling, onToggleService]);

  const disabled = isToggling !== null || localToggling !== null || !parentalControlEnabled;

  return (
    <div className={`rounded-xl border border-[rgba(193,198,214,0.2)] bg-white p-5 shadow-[0px_1px_1px_rgba(0,0,0,0.05)] transition-opacity ${!parentalControlEnabled ? 'opacity-50' : ''}`}>
      <div className="mb-4">
        <h3 className="text-base font-bold text-text-primary">Semua Layanan</h3>
        <p className="mt-1 text-xs text-text-muted">Aktifkan/nonaktifkan pembatasan per layanan individual</p>
      </div>

      <div className="mb-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari layanan..."
          disabled={disabled}
          className="w-full rounded-lg border border-border/30 bg-bg-page px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none disabled:opacity-50"
        />
      </div>

      <div className={`flex flex-col gap-1 max-h-[400px] overflow-y-auto ${disabled ? 'pointer-events-none' : ''}`}>
        {sortedServices.map((svc) => {
          const blocked = blockedServices.find((b) => b.id === svc.id);
          const isBlocked = blocked?.enabled ?? false;
          const categoryLabel = getCategoryLabel(svc.id);
          const busy = localToggling === `svc:${svc.id}`;

          return (
            <div key={svc.id} className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-bg-card-inner transition-colors">
              <div className="flex items-center gap-2 flex-1 mr-3 min-w-0">
                {svc.icon_svg ? (
                  <span className="shrink-0 w-5 h-5 flex items-center justify-center" dangerouslySetInnerHTML={{ __html: svc.icon_svg }} />
                ) : (
                  <span className="shrink-0 w-5 h-5 rounded bg-bg-tag" />
                )}
                <span className="text-sm text-text-primary truncate">{svc.name}</span>
                {categoryLabel && <span className="text-[10px] text-text-muted bg-bg-tag rounded px-1.5 py-0.5 shrink-0">{categoryLabel}</span>}
                {busy && <span className="text-[10px] text-primary font-medium animate-pulse shrink-0">Menyimpan...</span>}
              </div>
              <ToggleSwitch active={isBlocked} disabled={disabled} ariaLabel={svc.name} onClick={() => handleToggle(svc.id, !isBlocked)} />
            </div>
          );
        })}
        {sortedServices.length === 0 && (
          <p className="text-sm text-text-muted text-center py-4">Tidak ada layanan ditemukan</p>
        )}
      </div>
    </div>
  );
}
