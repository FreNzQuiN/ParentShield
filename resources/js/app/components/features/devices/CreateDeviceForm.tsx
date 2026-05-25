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
  const [typeError, setTypeError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setNameError(null);
    setTypeError(null);

    if (!name.trim()) {
      setNameError('Nama perangkat wajib diisi.');
      return;
    }
    if (!deviceType) {
      setTypeError('Pilih tipe perangkat.');
      return;
    }

    onSubmit(name.trim(), deviceType);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div>
        <label
          htmlFor="device-name"
          className="mb-2 block text-sm font-medium tracking-[0.5px] text-text-primary"
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
          className={`h-12 w-full rounded-lg border-2 bg-bg-card-inner px-[18px] text-sm text-text-primary outline-none transition-colors placeholder:text-sm placeholder:text-text-muted ${
            nameError ? 'border-error' : 'border-border'
          }`}
          disabled={loading}
        />
        {nameError && <p className="mt-1 text-xs text-error">{nameError}</p>}
      </div>

      <div>
        <p className="mb-2 text-sm font-medium tracking-[0.5px] text-text-primary">
          Tipe Perangkat
        </p>
        <div className="grid grid-cols-3 gap-3">
          {DEVICE_TYPES.map(({ value, label, Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setDeviceType(value)}
              disabled={loading}
              className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors ${
                deviceType === value
                  ? 'border-primary bg-bg-sidebar'
                  : 'border-border bg-white hover:border-primary/50'
              }`}
            >
              <Icon className={`size-6 ${deviceType === value ? 'text-primary' : 'text-text-muted'}`} />
              <span className={`text-sm ${
                deviceType === value ? 'font-medium text-primary' : 'text-text-secondary'
              }`}>
                {label}
              </span>
            </button>
          ))}
        </div>
        {typeError && <p className="mt-1 text-xs text-error">{typeError}</p>}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !name.trim()}
        className="h-12 w-full rounded-lg bg-primary text-sm tracking-[0.5px] text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? 'Membuat...' : 'Buat Perangkat'}
      </button>
    </form>
  );
}
