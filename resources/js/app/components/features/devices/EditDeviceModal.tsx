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
            className="mb-2 block text-sm font-medium tracking-[0.5px] text-text-primary"
          >
            Nama Perangkat
          </label>
          <input
            id="edit-device-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={64}
            className={`h-12 w-full rounded-lg border-2 bg-bg-card-inner px-[18px] text-sm text-text-primary outline-none transition-colors placeholder:text-sm placeholder:text-text-muted ${
              fieldError ? 'border-error' : 'border-border'
            }`}
            disabled={loading}
          />
          {fieldError && <p className="mt-1 text-xs text-error">{fieldError}</p>}
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
            className="flex-1 rounded-lg border border-border bg-white py-3 text-sm text-text-secondary transition-colors hover:bg-bg-sidebar disabled:cursor-not-allowed disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="flex-1 rounded-lg bg-primary py-3 text-sm tracking-[0.5px] text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
