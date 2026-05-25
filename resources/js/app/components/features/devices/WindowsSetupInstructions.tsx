import { useState } from 'react';
import { WindowsIcon, CopyIcon } from '../../shared/icons';
import type { DnsAddresses } from '../../../types/device';
import { useToast } from '../../../contexts/ToastContext';

interface WindowsSetupInstructionsProps {
  dnsAddresses: DnsAddresses;
}

type WindowsTab = 'system' | 'chrome' | 'firefox';

const tabs: { key: WindowsTab; label: string }[] = [
  { key: 'system', label: 'Windows 11' },
  { key: 'chrome', label: 'Chrome/Edge' },
  { key: 'firefox', label: 'Firefox' },
];

const WINDOWS_IP = '94.140.14.15';

export default function WindowsSetupInstructions({ dnsAddresses }: WindowsSetupInstructionsProps) {
  const [activeTab, setActiveTab] = useState<WindowsTab>('system');

  const dohUrl = dnsAddresses.dns_over_https_url ?? '';

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <WindowsIcon className="size-8 text-[#727785]" />
        <div>
          <h3 className="font-['Roboto',sans-serif] text-[20px] font-medium text-[#181c20]">Setup Perangkat Windows</h3>
          <p className="text-xs text-[#727785]">DNS-over-HTTPS (DoH)</p>
        </div>
      </div>

      <div className="flex gap-1 rounded-lg bg-[#f1f4fa] p-1">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex-1 rounded-md py-2 text-sm font-['Roboto',sans-serif] transition-colors ${
              activeTab === key
                ? 'bg-white text-[#181c20] shadow-sm'
                : 'text-[#727785] hover:text-[#414754]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'system' && <Windows11Content dohUrl={dohUrl} />}
      {activeTab === 'chrome' && <ChromeEdgeContent dohUrl={dohUrl} />}
      {activeTab === 'firefox' && <FirefoxContent dohUrl={dohUrl} />}
    </div>
  );
}

function CopyField({ label, value }: { label: string; value: string }) {
  const { addToast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(value).then(() => {
      addToast({ type: 'success', message: `${label} tersalin ke clipboard.` });
    });
  };

  return (
    <div className="rounded-lg border border-[#dfe3e8] bg-[#f7f9ff] p-4">
      <p className="mb-2 font-['Roboto',sans-serif] text-xs font-medium text-[#414754]">{label}</p>
      <div className="flex items-center gap-2">
        <code className="flex-1 truncate rounded bg-white px-3 py-2 text-sm text-[#181c20]">{value}</code>
        <button
          onClick={handleCopy}
          className="rounded-lg p-2 text-[#005bbf] hover:bg-[#f1f4fa] transition-colors"
          aria-label={`Salin ${label}`}
        >
          <CopyIcon className="size-4" />
        </button>
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

function Windows11Content({ dohUrl }: { dohUrl: string }) {
  return (
    <div className="flex flex-col gap-4">
      <CopyField label="IP DNS" value={WINDOWS_IP} />
      <CopyField label="DNS-over-HTTPS URL" value={dohUrl} />

      <p className="font-['Roboto',sans-serif] text-sm font-medium text-[#181c20]">Langkah-langkah:</p>
      <Step number={1} text='Settings → Network & Internet → [Wi-Fi/Ethernet]' />
      <Step number={2} text="Hardware properties → DNS server assignment → Edit" />
      <Step number={3} text="Pilih Manual → IPv4 ON" />
      <Step number={4} text={`Preferred DNS: paste ${WINDOWS_IP}`} />
      <Step number={5} text="DNS over HTTPS → On (manual template)" />
      <Step number={6} text="DoH template: paste URL di atas" />
      <Step number={7} text="Klik Save" />
    </div>
  );
}

function ChromeEdgeContent({ dohUrl }: { dohUrl: string }) {
  return (
    <div className="flex flex-col gap-4">
      <CopyField label="DNS-over-HTTPS URL" value={dohUrl} />

      <p className="font-['Roboto',sans-serif] text-sm font-medium text-[#181c20]">Langkah-langkah:</p>
      <Step number={1} text="Buka Settings → Privacy and Security → Security" />
      <Step number={2} text='Gulir ke "Use secure DNS"' />
      <Step number={3} text='Pilih "With: Custom"' />
      <Step number={4} text="Paste URL di atas" />
      <Step number={5} text="Tutup tab (otomatis tersimpan)" />
    </div>
  );
}

function FirefoxContent({ dohUrl }: { dohUrl: string }) {
  return (
    <div className="flex flex-col gap-4">
      <CopyField label="DNS-over-HTTPS URL" value={dohUrl} />

      <p className="font-['Roboto',sans-serif] text-sm font-medium text-[#181c20]">Langkah-langkah:</p>
      <Step number={1} text="Buka Settings → General" />
      <Step number={2} text="Network Settings → Settings..." />
      <Step number={3} text='Checklis "Enable DNS over HTTPS"' />
      <Step number={4} text='Pilih "Custom" pada Use Provider' />
      <Step number={5} text="Paste URL di atas → OK" />
    </div>
  );
}
