import { useState, useEffect } from 'react';
import Modal from '../../shared/Modal';
import CreateDeviceForm from './CreateDeviceForm';
import AndroidSetupInstructions from './AndroidSetupInstructions';
import IosSetupInstructions from './IosSetupInstructions';
import WindowsSetupInstructions from './WindowsSetupInstructions';
import { createDevice } from '../../../services/api/devices';
import type { ApiErrorResponse } from '../../../types/api';
import type { DeviceDetail, DnsAddresses, SetupDeviceType } from '../../../types/device';

interface SetupDeviceModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialDevice?: DeviceDetail | null;
}

export default function SetupDeviceModal({
  open,
  onClose,
  onSuccess,
  initialDevice,
}: SetupDeviceModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [device, setDevice] = useState<DeviceDetail | null>(null);
  const [deviceType, setDeviceType] = useState<SetupDeviceType | null>(null);

  useEffect(() => {
    if (!open) return;
    if (initialDevice) {
      setStep(2);
      setDevice(initialDevice);
      setDeviceType((initialDevice.device_type as SetupDeviceType) ?? null);
    } else {
      setStep(1);
      setDevice(null);
      setDeviceType(null);
    }
    setError(null);
    setLoading(false);
  }, [open, initialDevice]);

  const getTitle = () => {
    if (step === 1) return 'Tambah Perangkat Baru';
    if (deviceType === 'ANDROID') return 'Setup Perangkat Android';
    if (deviceType === 'IOS') return 'Setup Perangkat iOS';
    return 'Setup Perangkat Windows';
  };

  const handleCreate = async (name: string, type: SetupDeviceType) => {
    setLoading(true);
    setError(null);

    try {
      const result = await createDevice(name, type);
      setDevice(result);
      setDeviceType(type);
      setStep(2);
      onSuccess();
    } catch (err: unknown) {
      const resp = err as ApiErrorResponse;
      setError(resp.errors ? Object.values(resp.errors).flat().join(', ') : resp.message || 'Gagal membuat perangkat. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    onClose();
  };

  const dnsAddresses: DnsAddresses | null = device?.dns_addresses ?? null;

  return (
    <Modal open={open} onClose={handleClose} title={getTitle()} size={step === 1 ? 'md' : 'lg'}>
      <div className="mb-6 flex justify-center">
        <div className="flex items-start gap-3 sm:gap-6">
          <div className="flex flex-col items-center gap-1">
            <span className={`flex size-8 items-center justify-center rounded-full text-sm font-medium ${step >= 1 ? 'bg-primary text-white' : 'bg-inactive text-text-muted'}`}>
              {step === 2 ? '✓' : 1}
            </span>
            <span className={`text-xs whitespace-nowrap ${step === 1 ? 'font-medium text-text-primary' : 'text-text-muted'}`}>
              Buat Perangkat
            </span>
          </div>
          <div className={`mt-3 h-0.5 w-12 sm:w-20 ${step === 2 ? 'bg-primary' : 'bg-inactive'}`} />
          <div className="flex flex-col items-center gap-1">
            <span className={`flex size-8 items-center justify-center rounded-full text-sm font-medium ${step === 2 ? 'bg-primary text-white' : 'bg-inactive text-text-muted'}`}>
              2
            </span>
            <span className={`text-xs whitespace-nowrap ${step === 2 ? 'font-medium text-text-primary' : 'text-text-muted'}`}>
              Setup Perangkat
            </span>
          </div>
        </div>
      </div>

      <div key={step} className="animate-fadeIn">
        {step === 1 && (
          <CreateDeviceForm
            loading={loading}
            error={error}
            onSubmit={handleCreate}
          />
        )}

        {step === 2 && device && dnsAddresses && (
          <>
            {deviceType === 'ANDROID' && <AndroidSetupInstructions dnsAddresses={dnsAddresses} />}
            {deviceType === 'IOS' && (
              <IosSetupInstructions
                deviceId={device.id}
                deviceName={device.name}
              />
            )}
            {deviceType === 'WINDOWS' && <WindowsSetupInstructions dnsAddresses={dnsAddresses} />}

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleClose}
                className="rounded-lg bg-primary px-8 py-3 text-sm tracking-[0.5px] text-white transition-colors hover:bg-primary-hover"
              >
                Selesai
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}


