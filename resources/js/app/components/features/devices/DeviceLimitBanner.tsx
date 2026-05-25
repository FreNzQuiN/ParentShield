import { InfoIcon } from '../../shared/icons';

interface DeviceLimitBannerProps {
  used: number;
  max: number;
}

export default function DeviceLimitBanner({ used, max }: DeviceLimitBannerProps) {
  return (
    <div className="flex items-center justify-between rounded-[12px] border border-[#adc7ff] bg-[rgba(216,226,255,0.3)] p-[25px]">
      <div className="flex items-center gap-4">
        <div className="flex size-[48px] items-center justify-center rounded-full bg-[#d8e2ff]">
          <InfoIcon className="size-5 text-[#414754]" />
        </div>
        <div>
          <p className="font-['Roboto',sans-serif] text-[20px] font-medium text-[#001a41]">
            Batas Perangkat: {used} dari {max} digunakan
          </p>
          <p className="font-['Roboto',sans-serif] text-sm text-[#414754]">
            Anda saat ini menggunakan paket Layanan Gratis.
          </p>
        </div>
      </div>
      <button
        disabled
        className="cursor-not-allowed rounded-full bg-[#005bbf] px-6 py-3 font-['Roboto',sans-serif] text-sm tracking-[0.5px] text-white opacity-60"
      >
        Premium Belum Tersedia
      </button>
    </div>
  );
}
