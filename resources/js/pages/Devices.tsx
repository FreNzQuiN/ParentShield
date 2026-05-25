import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchDevices, deleteDevice } from '../app/services/api/devices';
import type { DeviceDetail, DeviceLimits } from '../app/types/device';
import { useToast } from '../app/contexts/ToastContext';
import Loading from '../app/components/shared/Loading';
import InlineError from '../app/components/shared/InlineError';
import LoadingOverlay from '../app/components/shared/LoadingOverlay';
import DeviceCard from '../app/components/features/devices/DeviceCard';
import EmptySlotCard from '../app/components/features/devices/EmptySlotCard';
import DeviceLimitBanner from '../app/components/features/devices/DeviceLimitBanner';
import SetupDeviceModal from '../app/components/features/devices/SetupDeviceModal';
import EditDeviceModal from '../app/components/features/devices/EditDeviceModal';
import ConfirmDialog from '../app/components/shared/ConfirmDialog';

const ONLINE_THRESHOLD_MS = 300000;

function computeIsOnline(lastSeenMillis: number | null | undefined): boolean {
  if (lastSeenMillis == null) return false;
  return Date.now() - lastSeenMillis < ONLINE_THRESHOLD_MS;
}

function formatLastSeen(millis: number | null | undefined): string {
  if (millis == null) return '';
  const diff = Date.now() - millis;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'Sekarang';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} menit yang lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam yang lalu`;
  const days = Math.floor(hours / 24);
  return `${days} hari yang lalu`;
}

export default function Devices() {
  const { addToast } = useToast();

  const [devices, setDevices] = useState<DeviceDetail[]>([]);
  const [limits, setLimits] = useState<DeviceLimits | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const [setupModalOpen, setSetupModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<DeviceDetail | null>(null);
  const [deviceToSetup, setDeviceToSetup] = useState<DeviceDetail | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeviceDetail | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadCounterRef = useRef(0);
  const loadDevices = useCallback(async (isRefresh = false) => {
    const loadId = ++loadCounterRef.current;
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    try {
      const data = await fetchDevices();
      if (loadId !== loadCounterRef.current) return;
      setDevices(data.devices);
      setLimits(data.account_limits);
    } catch (err: unknown) {
      if (loadId !== loadCounterRef.current) return;
      const resp = err as { message?: string };
      if (isRefresh) {
        addToast({ type: 'error', message: resp.message || 'Gagal memuat ulang perangkat.' });
      } else {
        setError(resp.message || 'Gagal memuat daftar perangkat.');
      }
    } finally {
      if (loadId === loadCounterRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [addToast]);

  useEffect(() => {
    loadDevices();
  }, [loadDevices]);

  const refreshDevices = useCallback(() => loadDevices(true), [loadDevices]);

  useEffect(() => {
    if (!setupModalOpen && !editModalOpen && !deleteTarget) {
      setSelectedDevice(null);
      setDeviceToSetup(null);
    }
  }, [setupModalOpen, editModalOpen, deleteTarget]);

  const handleOpenSetup = () => {
    setDeviceToSetup(null);
    setSetupModalOpen(true);
  };

  const handleShowSetup = (device: DeviceDetail) => {
    setDeviceToSetup(device);
    setSetupModalOpen(true);
  };

  const handleEdit = (device: DeviceDetail) => {
    setSelectedDevice(device);
    setEditModalOpen(true);
  };

  const handleDeleteRequest = (device: DeviceDetail) => {
    setDeleteTarget(device);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);

    try {
      await deleteDevice(deleteTarget.id);
      addToast({ type: 'success', message: `${deleteTarget.name} berhasil dihapus.` });
      setDeleteTarget(null);
      refreshDevices();
    } catch {
      addToast({ type: 'error', message: 'Gagal menghapus perangkat.' });
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    if (!deleting) setDeleteTarget(null);
  };

  const used = limits?.devices?.used ?? devices.length;
  const max = limits?.devices?.max ?? 5;
  const slotCount = Math.max(0, max - used);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loading message="Memuat perangkat..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <InlineError message={error} onRetry={loadDevices} className="max-w-md" />
      </div>
    );
  }

  return (
    <div className="relative flex flex-1 flex-col gap-[48px]">
      <LoadingOverlay visible={refreshing && devices.length > 0} />

      <div className={`flex flex-col gap-[48px] ${refreshing ? 'pointer-events-none select-none' : ''}`}>
      <div>
        <h1 className="font-['Roboto',sans-serif] text-[24px] font-medium text-[#181c20]">
          Perangkat Dilindungi
        </h1>
        <p className="mt-1 font-['Roboto',sans-serif] text-sm text-[#414754]">
          Kelola dan pantau semua perangkat yang terhubung di rumah Anda.
        </p>
      </div>

      <DeviceLimitBanner used={used} max={max} />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {devices.map((device) => (
          <DeviceCard
            key={device.id}
            device={device}
            isOnline={computeIsOnline(device.last_seen)}
            lastSeen={formatLastSeen(device.last_seen)}
            onShowSetup={handleShowSetup}
            onEdit={handleEdit}
            onDelete={handleDeleteRequest}
          />
        ))}

        {devices.length > 0 && slotCount > 0 && (
          <EmptySlotCard
            slotNumber={used + 1}
            totalSlots={max}
            onClick={handleOpenSetup}
          />
        )}
      </div>

      {devices.length === 0 && (
        <div className="flex flex-col items-center gap-4 rounded-xl border-2 border-dashed border-[#c1c6d6] p-12">
          <p className="font-['Roboto',sans-serif] text-[20px] text-[#727785]">Belum ada perangkat</p>
          <p className="text-sm text-[#727785]">Tambahkan perangkat untuk mulai memantau aktivitas internet anak.</p>
          <button
            onClick={handleOpenSetup}
            className="rounded-[8px] bg-[#005bbf] px-6 py-3 font-['Roboto',sans-serif] text-sm tracking-[0.5px] text-white hover:bg-[#004d9e] transition-colors"
          >
            Tambah Perangkat
          </button>
        </div>
      )}

      {slotCount <= 0 && devices.length > 0 && (
        <p className="text-center text-xs text-[#727785]">
          Batas perangkat tercapai. Tingkatkan paket untuk menambah perangkat.
        </p>
      )}

      <SetupDeviceModal
        open={setupModalOpen}
        onClose={() => setSetupModalOpen(false)}
        onSuccess={refreshDevices}
        initialDevice={deviceToSetup}
      />

      <EditDeviceModal
        open={editModalOpen}
        device={selectedDevice}
        onClose={() => setEditModalOpen(false)}
        onSuccess={refreshDevices}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Hapus Perangkat"
        message={deleteTarget ? `Hapus ${deleteTarget.name}? Perangkat akan berhenti diproteksi.` : ''}
        confirmLabel="Hapus"
        cancelLabel="Batal"
        variant="danger"
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
      </div>
    </div>
  );
}
