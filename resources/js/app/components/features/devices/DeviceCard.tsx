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
    <div className="flex flex-col justify-between rounded-[12px] border border-[#dfe3e8] bg-white p-[25px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
      <div>
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-[48px] items-center justify-center rounded-[8px] bg-[#ebeef4]">
              <DeviceIcon className="size-5 text-[#727785]" />
            </div>
            <div>
              <h3 className="font-['Roboto',sans-serif] text-[20px] font-medium text-[#181c20]">
                {device.name}
              </h3>
              <div className="mt-1 flex items-center gap-1.5">
                <span className={`inline-block size-2.5 rounded-full ${
                  needsSetup ? 'bg-[#005bbf]' : isOnline ? 'bg-[#1b6d24]' : 'bg-[#727785]'
                }`} />
                <span className={`font-['Roboto',sans-serif] text-xs ${
                  needsSetup ? 'text-[#005bbf]' : isOnline ? 'text-[#1b6d24]' : 'text-[#414754]'
                }`}>
                  {needsSetup ? 'Perlu Setup' : isOnline ? 'Online' : 'Luring'}
                </span>
              </div>
            </div>
          </div>
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="rounded-lg p-1 text-[#727785] hover:bg-[#f1f4fa] transition-colors"
              aria-label="Menu perangkat"
            >
              <DotsIcon className="size-5" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full z-10 mt-1 w-40 rounded-lg border border-[#dfe3e8] bg-white py-1 shadow-lg">
                <button
                  onClick={() => { setMenuOpen(false); onEdit(device); }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[#414754] hover:bg-[#f1f4fa] transition-colors"
                >
                  Edit Nama
                </button>
                <button
                  onClick={() => { setMenuOpen(false); onDelete(device); }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[#ba1a1a] hover:bg-[#ffdad6] transition-colors"
                >
                  <TrashIcon className="size-4" />
                  Hapus
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="mb-1">
          <p className="font-['Roboto',sans-serif] text-xs text-[#727785]">
            {getDeviceLabel(device.device_type)} &middot; Terakhir aktif: {lastSeen || 'Belum pernah'}
          </p>
        </div>
      </div>
      <div className="mt-4">
        <button
          onClick={() => onShowSetup(device)}
          className={`w-full rounded-[8px] py-2 text-sm tracking-[0.5px] transition-colors font-['Roboto',sans-serif] ${
            needsSetup
              ? 'bg-[#005bbf] text-white hover:bg-[#004d9e]'
              : 'border border-[#005bbf] text-[#005bbf] hover:bg-[#f1f4fa]'
          }`}
        >
          {needsSetup ? 'Selesaikan Setup' : 'Petunjuk Konfigurasi'}
        </button>
      </div>
    </div>
  );
}
