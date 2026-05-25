import { Link } from 'react-router-dom';
import { DeviceIcon, ChevronRightIcon } from '../../shared/icons';
import type { DashboardDevice } from '../../../types/dashboard';

interface DeviceAnakListProps {
  devices: DashboardDevice[];
}

const KNOWN_ACRONYMS: Record<string, string> = {
  ios: 'iOS',
  macos: 'macOS',
  ipados: 'iPadOS',
  tvos: 'tvOS',
};

function getDeviceLabel(type: string): string {
  return KNOWN_ACRONYMS[type.toLowerCase()] ?? type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
}

export default function DeviceAnakList({ devices }: DeviceAnakListProps) {
  if (!devices.length) {
    return (
      <div className="rounded-xl border border-[rgba(193,198,214,0.2)] bg-white p-4 shadow-[0px_1px_1px_rgba(0,0,0,0.05)]">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-['Roboto',sans-serif] text-sm font-medium text-[#181c20]">Device Anak</h3>
          <Link to="/devices" className="text-xs text-[#005bbf] hover:underline">
            Lihat Semua
          </Link>
        </div>
        <p className="text-xs text-[#727785]">Belum ada perangkat terdaftar.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[rgba(193,198,214,0.2)] bg-white p-4 shadow-[0px_1px_1px_rgba(0,0,0,0.05)]">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-['Roboto',sans-serif] text-sm font-medium text-[#181c20]">Device Anak</h3>
        <Link to="/devices" className="text-xs text-[#005bbf] hover:underline">
          Lihat Semua
        </Link>
      </div>

      <div>
        {devices.slice(0, 3).map((device, idx) => (
          <Link
            key={device.id}
            to={`/devices`}
            className={`flex items-center gap-3 py-2.5 ${
              idx < devices.length - 1 ? 'border-b border-[rgba(193,198,214,0.3)]' : ''
            }`}
          >
            <DeviceIcon className="h-5 w-5 shrink-0 text-[#727785]" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="truncate font-['Roboto',sans-serif] text-sm font-medium text-[#181c20]">
                  {device.name}
                </span>
                <span
                  className={`inline-block h-2 w-2 shrink-0 rounded-full ${
                    device.is_online ? 'bg-[#1b6d24]' : 'bg-[#dfe3e8]'
                  }`}
                />
              </div>
              <p className="font-['Roboto',sans-serif] text-xs text-[#727785]">
                {device.is_online ? 'Daring' : 'Luring'} &middot; {getDeviceLabel(device.device_type)}
              </p>
            </div>
            <ChevronRightIcon />
          </Link>
        ))}
      </div>
    </div>
  );
}
