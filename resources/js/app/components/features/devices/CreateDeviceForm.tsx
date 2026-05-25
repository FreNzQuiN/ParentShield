import { useState } from 'react';
import { AndroidIcon, AppleIcon, WindowsIcon } from '../../shared/icons';
import type { SetupDeviceType } from '../../../types/device';

interface CreateDeviceFormProps {
  loading: boolean;
  error: string | null;
  onSubmit: (name: string, deviceType: SetupDeviceType) => void;
}

const DEVICE_TYPES: { value: SetupDeviceType; label: string; Icon: React.ComponentType<React.SVGProps<SVGSVGElement>> }[] = [
  { value: 'ANDROID', label: 'Android', Icon: AndroidIcon },
  { value: 'IOS', label: 'iOS', Icon: AppleIcon },
  { value: 'WINDOWS', label: 'Windows', Icon: WindowsIcon },
];

export default function CreateDeviceForm({ loading, error, onSubmit }: CreateDeviceFormProps) {
  const [name, setName] = useState('');
  const [deviceType, setDeviceType] = useState<SetupDeviceType | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNameError(null);

    if (!name.trim()) {
      setNameError('Nama perangkat wajib diisi.');
      return;
    }
    if (!deviceType) {
      return;
    }

    onSubmit(name.trim(), deviceType);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div>
        <label
          htmlFor="device-name"
          className="mb-2 block font-['Roboto',sans-serif] text-sm font-medium tracking-[0.5px] text-[#181c20]"
        >
          Nama Perangkat
        </label>
        <input
          id="device-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Contoh: iPhone Anak"
          maxLength={64}
          className={`h-[50px] w-full rounded-[8px] border-2 bg-[#f7f9ff] px-[18px] font-['Roboto',sans-serif] text-sm text-[#727785] outline-none transition-colors placeholder:font-['Roboto',sans-serif] placeholder:text-sm placeholder:text-[#727785] ${
            nameError ? 'border-red-500' : 'border-[#c1c6d6]'
          }`}
          disabled={loading}
        />
        {nameError && <p className="mt-1 text-xs text-red-600">{nameError}</p>}
      </div>

      <div>
        <p className="mb-2 font-['Roboto',sans-serif] text-sm font-medium tracking-[0.5px] text-[#181c20]">
          Tipe Perangkat
        </p>
        <div className="grid grid-cols-3 gap-3">
          {DEVICE_TYPES.map(({ value, label, Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setDeviceType(value)}
              disabled={loading}
              className={`flex flex-col items-center gap-2 rounded-[8px] border-2 p-4 transition-colors ${
                deviceType === value
                  ? 'border-[#005bbf] bg-[#f1f4fa]'
                  : 'border-[#c1c6d6] bg-white hover:border-[#005bbf]/50'
              }`}
            >
              <Icon className={`size-6 ${deviceType === value ? 'text-[#005bbf]' : 'text-[#727785]'}`} />
              <span className={`font-['Roboto',sans-serif] text-sm ${
                deviceType === value ? 'font-medium text-[#005bbf]' : 'text-[#414754]'
              }`}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !name.trim() || !deviceType}
        className="h-[50px] w-full rounded-[8px] bg-[#005bbf] font-['Roboto',sans-serif] text-sm tracking-[0.5px] text-white transition-colors hover:bg-[#004d9e] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? 'Membuat...' : 'Buat Perangkat'}
      </button>
    </form>
  );
}
