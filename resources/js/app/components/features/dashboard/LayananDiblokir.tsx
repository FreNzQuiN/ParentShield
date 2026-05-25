import type { BlockedWebService } from '../../../types/dashboard';

interface LayananDiblokirProps {
  services: BlockedWebService[];
}

const SERVICE_NAMES: Record<string, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  twitter: 'Twitter',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  '9gag': '9GAG',
  netflix: 'Netflix',
  discord: 'Discord',
  snapchat: 'Snapchat',
  reddit: 'Reddit',
  pinterest: 'Pinterest',
  linkedin: 'LinkedIn',
  whatsapp: 'WhatsApp',
  telegram: 'Telegram',
  spotify: 'Spotify',
  twitch: 'Twitch',
  steam: 'Steam',
  roblox: 'Roblox',
  shopee: 'Shopee',
  lazada: 'Lazada',
  amazon: 'Amazon',
  aliexpress: 'AliExpress',
  ebay: 'eBay',
  temu: 'Temu',
  shein: 'Shein',
};

function getServiceLabel(id: string): string {
  return SERVICE_NAMES[id.toLowerCase()] ?? id.charAt(0).toUpperCase() + id.slice(1);
}

const MAX_VISIBLE = 6;

export default function LayananDiblokir({ services }: LayananDiblokirProps) {
  if (!services.length) {
    return (
      <div className="flex-1 rounded-xl border border-[rgba(193,198,214,0.2)] bg-white p-4 shadow-[0px_1px_1px_rgba(0,0,0,0.05)]">
        <h3 className="font-['Roboto',sans-serif] text-sm font-medium text-[#414754]">Kategori Layanan</h3>
        <p className="mt-3 text-xs text-[#727785]">Belum ada layanan dikonfigurasi.</p>
      </div>
    );
  }

  const sorted = [...services].sort((a, b) => {
    if (a.enabled !== b.enabled) return a.enabled ? -1 : 1;
    return getServiceLabel(a.id).localeCompare(getServiceLabel(b.id));
  });

  const visible = sorted.slice(0, MAX_VISIBLE);
  const remaining = sorted.length - MAX_VISIBLE;

  return (
    <div className="flex-1 rounded-xl border border-[rgba(193,198,214,0.2)] bg-white p-4 shadow-[0px_1px_1px_rgba(0,0,0,0.05)]">
      <h3 className="mb-3 font-['Roboto',sans-serif] text-sm font-medium text-[#414754]">Kategori Layanan</h3>
      <div className="flex flex-col gap-1.5">
        {visible.map((svc) => (
          <div key={svc.id} className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-[#f7f9ff] transition-colors">
            <span className="font-['Roboto',sans-serif] text-sm text-[#181c20]">
              {getServiceLabel(svc.id)}
            </span>
            <span
              className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                svc.enabled
                  ? 'bg-[#dd3635]/10 text-[#dd3635]'
                  : 'bg-[#dfe3e8] text-[#727785]'
              }`}
            >
              {svc.enabled ? 'Diblokir' : 'Diizinkan'}
            </span>
          </div>
        ))}
        {remaining > 0 && (
          <p className="px-3 pt-1 font-['Roboto',sans-serif] text-xs text-[#727785]">
            +{remaining} layanan lainnya
          </p>
        )}
      </div>
    </div>
  );
}
