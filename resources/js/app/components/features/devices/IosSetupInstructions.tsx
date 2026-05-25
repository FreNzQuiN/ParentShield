import { useState } from 'react';
import { AppleIcon, DownloadIcon } from '../../shared/icons';
import { downloadMobileConfig } from '../../../services/api/devices';
import { useToast } from '../../../contexts/ToastContext';
import { Step } from '../../shared/StepList';

interface IosSetupInstructionsProps {
  deviceId: string;
  deviceName: string;
}

export default function IosSetupInstructions({ deviceId, deviceName }: IosSetupInstructionsProps) {
  const { addToast } = useToast();
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const handleDownload = async () => {
    setDownloading(true);
    setDownloadError(null);

    try {
      await downloadMobileConfig(deviceId, deviceName);
      addToast({ type: 'success', message: 'Profil konfigurasi berhasil diunduh.' });
    } catch {
      setDownloadError('Gagal mengunduh profil. Silakan coba lagi.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <AppleIcon className="size-8 text-text-muted" />
        <div>
          <h3 className="text-xl font-medium text-text-primary">Setup Perangkat iOS</h3>
          <p className="text-xs text-text-muted">Profil Konfigurasi (.mobileconfig)</p>
        </div>
      </div>

      <button
        onClick={handleDownload}
        disabled={downloading}
        className="flex items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm tracking-[0.5px] text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
      >
        <DownloadIcon className="size-4" />
        {downloading ? 'Mengunduh...' : 'Unduh Profil Konfigurasi'}
      </button>

      {downloadError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-700">{downloadError}</p>
          <button
            onClick={handleDownload}
            className="mt-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
          >
            Coba Lagi
          </button>
        </div>
      )}

      <div className="rounded-lg border border-inactive bg-bg-card-inner p-3">
        <p className="text-xs text-text-muted">
          File .mobileconfig akan diunduh. Buka file tersebut di perangkat iOS Anda untuk memulai instalasi profil.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium text-text-primary">Langkah-langkah:</p>
        <div className="flex flex-col gap-1 border-l-2 border-primary/20 pl-4 ml-1">
          <Step number={1} text="Ketuk tombol di atas untuk mengunduh profil konfigurasi" />
          <Step number={2} text="Buka Settings → General → VPN & Device Management" />
          <Step number={3} text="Tap profil AdGuard DNS yang baru diunduh" />
          <Step number={4} text='Tap "Install" di pojok kanan atas' />
          <Step number={5} text="Ikuti instruksi hingga selesai" />
        </div>
      </div>
    </div>
  );
}
