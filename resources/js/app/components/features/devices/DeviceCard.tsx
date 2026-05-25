import { useState, useRef, useEffect } from 'react';
import { DeviceIcon, DotsIcon, TrashIcon } from '../../shared/icons';
import type { DeviceDetail } from '../../../types/device';

interface DeviceCardProps {
  device: DeviceDetail;
  isOnline: boolean;
  lastSeen: string;
  onShowSetup: (device: DeviceDetail) => void;
  onEdit: (device: DeviceDetail) => void;
  onDelete: (device: DeviceDetail) => void;
}

const KNOWN_ACRONYMS: Record<string, string> = {
  ios: 'iOS',
  macos: 'macOS',
  ipados: 'iPadOS',
  tvos: 'tvOS',
  android: 'Android',
  windows: 'Windows',
};

function getDeviceLabel(type: string): string {
  return KNOWN_ACRONYMS[type.toLowerCase()] ?? type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
}

export default function DeviceCard({ device, isOnline, lastSeen, onShowSetup, onEdit, onDelete }: DeviceCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const needsSetup = lastSeen === '';

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', keyHandler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', keyHandler);
    };
  }, [menuOpen]);

  return (
    <div className="flex flex-col justify-between rounded-xl border border-inactive bg-bg-card p-6 shadow-sm">
      <div>
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-lg bg-bg-tag">
              <DeviceIcon className="size-5 text-text-muted" />
            </div>
            <div>
              <h3 className="text-xl font-medium text-text-primary">
                {device.name}
              </h3>
              <div className="mt-1 flex items-center gap-1.5">
                <span className={`inline-block size-2.5 rounded-full ${
                  needsSetup ? 'bg-primary' : isOnline ? 'bg-success' : 'bg-text-muted'
                }`} />
                <span className={`text-xs ${
                  needsSetup ? 'text-primary' : isOnline ? 'text-success' : 'text-text-secondary'
                }`}>
                  {needsSetup ? 'Perlu Setup' : isOnline ? 'Online' : 'Luring'}
                </span>
              </div>
            </div>
          </div>
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="rounded-lg p-1 text-text-muted hover:bg-bg-sidebar transition-colors"
              aria-label="Menu perangkat"
            >
              <DotsIcon className="size-5" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full z-10 mt-1 w-40 rounded-lg border border-inactive bg-bg-card py-1 shadow-lg">
                <button
                  onClick={() => { setMenuOpen(false); onEdit(device); }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:bg-bg-sidebar transition-colors"
                >
                  Edit Nama
                </button>
                <button
                  onClick={() => { setMenuOpen(false); onDelete(device); }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-danger hover:bg-red-50 transition-colors"
                >
                  <TrashIcon className="size-4" />
                  Hapus
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="mb-1">
          <p className="text-xs text-text-muted">
            {getDeviceLabel(device.device_type)} &middot; Terakhir aktif: {lastSeen || 'Belum pernah'}
          </p>
        </div>
      </div>
      <div className="mt-4">
        <button
          onClick={() => onShowSetup(device)}
          className={`w-full rounded-lg py-2 text-sm tracking-[0.5px] transition-colors ${
            needsSetup
              ? 'bg-primary text-white hover:bg-primary-hover'
              : 'border border-primary text-primary hover:bg-bg-sidebar'
          }`}
        >
          {needsSetup ? 'Selesaikan Setup' : 'Petunjuk Konfigurasi'}
        </button>
      </div>
    </div>
  );
}
