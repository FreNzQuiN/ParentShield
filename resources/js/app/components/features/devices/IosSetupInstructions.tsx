import { useState } from 'react';
import { AppleIcon, DownloadIcon } from '../../shared/icons';
import { downloadMobileConfig } from '../../../services/api/devices';
import { useToast } from '../../../contexts/ToastContext';

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
        <AppleIcon className="size-8 text-[#727785]" />
        <div>
          <h3 className="font-['Roboto',sans-serif] text-[20px] font-medium text-[#181c20]">Setup Perangkat iOS</h3>
          <p className="text-xs text-[#727785]">Profil Konfigurasi (.mobileconfig)</p>
        </div>
      </div>

      <button
        onClick={handleDownload}
        disabled={downloading}
        className="flex items-center justify-center gap-2 rounded-[8px] bg-[#005bbf] py-3 font-['Roboto',sans-serif] text-sm tracking-[0.5px] text-white transition-colors hover:bg-[#004d9e] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <DownloadIcon className="size-4" />
        {downloading ? 'Mengunduh...' : 'Unduh Profil Konfigurasi'}
      </button>

      {downloadError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-700">{downloadError}</p>
          <button
            onClick={handleDownload}
            className="mt-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      )}

      <div className="rounded-lg border border-[#dfe3e8] bg-[#f7f9ff] p-3">
        <p className="text-xs text-[#727785]">
          File .mobileconfig akan diunduh. Buka file tersebut di perangkat iOS Anda untuk memulai instalasi profil.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <p className="font-['Roboto',sans-serif] text-sm font-medium text-[#181c20]">Langkah-langkah:</p>
        <Step number={1} text="Ketuk tombol di atas untuk mengunduh profil konfigurasi" />
        <Step number={2} text="Buka Settings → General → VPN & Device Management" />
        <Step number={3} text="Tap profil AdGuard DNS yang baru diunduh" />
        <Step number={4} text='Tap "Install" di pojok kanan atas' />
        <Step number={5} text="Ikuti instruksi hingga selesai" />
      </div>
    </div>
  );
}

function Step({ number, text }: { number: number; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#005bbf] text-xs text-white">
        {number}
      </span>
      <p className="pt-0.5 font-['Roboto',sans-serif] text-sm text-[#414754]">{text}</p>
    </div>
  );
}
