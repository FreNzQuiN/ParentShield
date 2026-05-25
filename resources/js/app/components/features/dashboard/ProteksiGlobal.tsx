import { useState, useCallback, useEffect, useRef } from 'react';
import { useToast } from '../../../contexts/ToastContext';
import { GlobeIcon } from '../../shared/icons';
import type { SafebrowsingSettings } from '../../../types/dashboard';

interface ProteksiGlobalProps {
  settings: SafebrowsingSettings;
  onToggle: (key: keyof SafebrowsingSettings, value: boolean) => Promise<void>;
}

interface ToggleRow {
  key: keyof SafebrowsingSettings;
  label: string;
  description: string;
}

const toggles: ToggleRow[] = [
  {
    key: 'safe_search_enabled',
    label: 'Filter Pencarian Aman',
    description: 'Terapkan Pencarian Aman',
  },
  {
    key: 'block_dangerous_enabled',
    label: 'Tingkatkan Keamanan',
    description: 'Blokir Halaman Berbahaya',
  },
  {
    key: 'block_nrd_enabled',
    label: 'Blokir Website Baru',
    description: 'Jangan Percaya Website Baru',
  },
];

export default function ProteksiGlobal({ settings, onToggle }: ProteksiGlobalProps) {
  const [optimistic, setOptimistic] = useState<SafebrowsingSettings>(settings);
  const [toggling, setToggling] = useState<keyof SafebrowsingSettings | null>(null);
  const syncingRef = useRef(false);
  const { addToast } = useToast();

  useEffect(() => {
    if (!syncingRef.current) {
      setOptimistic(settings);
    }
  }, [settings]);

  const handleToggle = useCallback(
    async (key: keyof SafebrowsingSettings) => {
      const newValue = !optimistic[key];
      const label = toggles.find((t) => t.key === key)?.label ?? key;
      setOptimistic((prev) => ({ ...prev, [key]: newValue }));
      setToggling(key);
      syncingRef.current = true;

      try {
        await onToggle(key, newValue);
        addToast({ type: 'success', message: `${label} berhasil ${newValue ? 'diaktifkan' : 'dinonaktifkan'}.` });
      } catch {
        setOptimistic((prev) => ({ ...prev, [key]: !newValue }));
        addToast({ type: 'error', message: `Gagal memperbarui ${label.toLowerCase()}.` });
      } finally {
        setToggling(null);
        syncingRef.current = false;
      }
    },
    [optimistic, onToggle, addToast]
  );

  return (
    <div className="rounded-xl border border-[rgba(193,198,214,0.2)] bg-white p-4 shadow-[0px_1px_1px_rgba(0,0,0,0.05)]">
      <div className="mb-3 flex items-center gap-2">
        <GlobeIcon className="text-[#005bbf]" />
        <h3 className="font-['Roboto',sans-serif] text-sm font-medium text-[#181c20]">Proteksi Global</h3>
        {toggling && (
          <span className="ml-auto text-xs text-[#727785]">Menyimpan...</span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {toggles.map((t) => (
          <div
            key={t.key}
            className="flex items-center justify-between rounded-lg bg-[#f7f9ff] p-3"
          >
            <div className="flex-1 mr-3">
              <p className="font-['Roboto',sans-serif] text-sm font-medium text-[#181c20]">
                {t.label}
              </p>
              <p className="font-['Roboto',sans-serif] text-xs text-[#727785]">
                {t.description}
              </p>
            </div>
            <button
              onClick={() => handleToggle(t.key)}
              disabled={toggling === t.key}
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                toggling === t.key ? 'opacity-60' : ''
              } ${
                optimistic[t.key] ? 'bg-[#1b6d24]' : 'bg-[#dfe3e8]'
              }`}
              aria-label={t.label}
            >
              <span
                className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  optimistic[t.key] ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
