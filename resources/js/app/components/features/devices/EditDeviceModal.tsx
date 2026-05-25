import { useState, useEffect } from 'react';
import Modal from '../../shared/Modal';
import type { DeviceDetail } from '../../../types/device';
import { updateDevice } from '../../../services/api/devices';

interface EditDeviceModalProps {
  open: boolean;
  device: DeviceDetail | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditDeviceModal({ open, device, onClose, onSuccess }: EditDeviceModalProps) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);

  useEffect(() => {
    if (device && open) {
      setName(device.name);
      setError(null);
      setFieldError(null);
    }
  }, [device, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setFieldError(null);

    if (!name.trim()) {
      setFieldError('Nama perangkat wajib diisi.');
      return;
    }
    if (!device) return;

    setLoading(true);
    try {
      await updateDevice(device.id, name.trim());
      onClose();
      onSuccess();
    } catch (err: unknown) {
      const msg = (err as { message?: string }).message || 'Gagal memperbarui nama perangkat.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Edit Nama Perangkat">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label
            htmlFor="edit-device-name"
            className="mb-2 block font-['Roboto',sans-serif] text-sm font-medium tracking-[0.5px] text-[#181c20]"
          >
            Nama Perangkat
          </label>
          <input
            id="edit-device-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={64}
            className={`h-[50px] w-full rounded-[8px] border-2 bg-[#f7f9ff] px-[18px] font-['Roboto',sans-serif] text-sm text-[#727785] outline-none transition-colors placeholder:font-['Roboto',sans-serif] placeholder:text-sm placeholder:text-[#727785] ${
              fieldError ? 'border-red-500' : 'border-[#c1c6d6]'
            }`}
            disabled={loading}
          />
          {fieldError && <p className="mt-1 text-xs text-red-600">{fieldError}</p>}
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-[8px] border border-[#c1c6d6] bg-white py-3 font-['Roboto',sans-serif] text-sm text-[#414754] transition-colors hover:bg-[#f1f4fa] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="flex-1 rounded-[8px] bg-[#005bbf] py-3 font-['Roboto',sans-serif] text-sm tracking-[0.5px] text-white transition-colors hover:bg-[#004d9e] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
