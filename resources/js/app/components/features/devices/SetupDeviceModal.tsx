import { useState, useEffect } from 'react';
import Modal from '../../shared/Modal';
import CreateDeviceForm from './CreateDeviceForm';
import AndroidSetupInstructions from './AndroidSetupInstructions';
import IosSetupInstructions from './IosSetupInstructions';
import WindowsSetupInstructions from './WindowsSetupInstructions';
import { createDevice } from '../../../services/api/devices';
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
      const resp = err as { message?: string };
      setError(resp.message || 'Gagal membuat perangkat. Silakan coba lagi.');
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
    <Modal open={open} onClose={handleClose} title={getTitle()} size="lg">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <StepDot number={1} active={step === 1} completed={step === 2} label="Buat Perangkat" />
          <div className={`h-px flex-1 ${step === 2 ? 'bg-[#005bbf]' : 'bg-[#dfe3e8]'}`} />
          <StepDot number={2} active={step === 2} completed={false} label="Setup Perangkat" />
        </div>
      </div>

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
              className="rounded-[8px] bg-[#005bbf] px-8 py-3 font-['Roboto',sans-serif] text-sm tracking-[0.5px] text-white transition-colors hover:bg-[#004d9e]"
            >
              Selesai
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}

function StepDot({ number, active, completed, label }: { number: number; active: boolean; completed: boolean; label: string }) {
  const baseClass = 'flex size-8 items-center justify-center rounded-full text-sm font-medium';
  const circleClass = active || completed
    ? 'bg-[#005bbf] text-white'
    : 'bg-[#dfe3e8] text-[#727785]';

  return (
    <div className="flex items-center gap-2">
      <span className={`${baseClass} ${circleClass}`}>
        {completed ? '✓' : number}
      </span>
      <span className={`font-['Roboto',sans-serif] text-sm ${active ? 'font-medium text-[#181c20]' : 'text-[#727785]'}`}>
        {label}
      </span>
    </div>
  );
}
