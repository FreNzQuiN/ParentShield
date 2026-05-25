import { InfoIcon } from '../../shared/icons';

interface DeviceLimitBannerProps {
  used: number;
  max: number;
}

export default function DeviceLimitBanner({ used, max }: DeviceLimitBannerProps) {
  if (used < max) return null;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-inactive bg-bg-card p-4">
      <InfoIcon className="size-5 text-text-secondary" />
      <div className="flex-1">
        <p className="text-sm text-text-secondary">
          Anda telah mencapai batas maksimal {max} perangkat. Tingkatkan paket untuk menambah perangkat.
        </p>
      </div>
      <button
        disabled
        className="cursor-not-allowed rounded-full bg-primary px-6 py-3 text-sm tracking-[0.5px] text-white opacity-60"
      >
        Tingkatkan Paket
      </button>
    </div>
  );
}
