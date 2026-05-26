import { useState } from 'react';
import { WindowsIcon, CopyIcon } from '../../shared/icons';
import type { DnsAddresses } from '../../../types/device';
import { useToast } from '../../../contexts/ToastContext';
import { Step } from '../../shared/StepList';

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
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<WindowsTab>('system');

  const dohUrl = dnsAddresses.dns_over_https_url ?? '';

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      addToast({ type: 'success', message: `${label} tersalin ke clipboard.` });
    }).catch(() => {
      addToast({ type: 'error', message: `Gagal menyalin ${label}.` });
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <WindowsIcon className="size-8 text-text-muted" />
        <div>
          <h3 className="text-xl font-medium text-text-primary">Setup Perangkat Windows</h3>
          <p className="text-xs text-text-muted">DNS-over-HTTPS (DoH)</p>
        </div>
      </div>

      <CopyField
        label="DNS-over-HTTPS URL"
        value={dohUrl}
        onCopy={() => copyToClipboard(dohUrl, 'URL')}
      />

      <div className="flex gap-1 rounded-lg bg-bg-sidebar p-1">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex-1 rounded-md py-2 text-sm transition-colors ${
              activeTab === key
                ? 'bg-white text-text-primary shadow-sm'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'system' && <Windows11Content />}
      {activeTab === 'chrome' && <ChromeEdgeContent />}
      {activeTab === 'firefox' && <FirefoxContent />}
    </div>
  );
}

function CopyField({ label, value, onCopy }: { label: string; value: string; onCopy: () => void }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-inactive bg-bg-card-inner px-4 py-2.5">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-text-secondary">{label}</p>
        <code className="block truncate text-sm text-text-primary">{value}</code>
      </div>
      <button
        onClick={onCopy}
        className="ml-2 shrink-0 rounded-lg p-1.5 text-primary hover:bg-bg-sidebar transition-colors"
        aria-label={`Salin ${label}`}
      >
        <CopyIcon className="size-4" />
      </button>
    </div>
  );
}

function Windows11Content() {
  const { addToast } = useToast();
  return (
    <div className="flex flex-col gap-4">
      <CopyField
        label="IP DNS"
        value={WINDOWS_IP}
        onCopy={() => navigator.clipboard.writeText(WINDOWS_IP).then(() => addToast({ type: 'success', message: 'IP DNS tersalin ke clipboard.' })).catch(() => addToast({ type: 'error', message: 'Gagal menyalin IP DNS.' }))}
      />

      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium text-text-primary">Langkah-langkah:</p>
        <div className="flex flex-col gap-1 border-l-2 border-primary/20 pl-4 ml-1">
          <Step number={1} text='Settings → Network & Internet → [Wi-Fi/Ethernet]' />
          <Step number={2} text="Hardware properties → DNS server assignment → Edit" />
          <Step number={3} text="Pilih Manual → IPv4 ON" />
          <Step number={4} text={`Preferred DNS: paste ${WINDOWS_IP}`} />
          <Step number={5} text="DNS over HTTPS → On (manual template)" />
          <Step number={6} text="DoH template: paste URL di atas" />
          <Step number={7} text="Klik Save" />
        </div>
      </div>
    </div>
  );
}

function ChromeEdgeContent() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium text-text-primary">Langkah-langkah:</p>
        <div className="flex flex-col gap-1 border-l-2 border-primary/20 pl-4 ml-1">
          <Step number={1} text="Buka Settings → Privacy and Security → Security" />
          <Step number={2} text='Gulir ke "Use secure DNS"' />
          <Step number={3} text='Pilih "With: Custom"' />
          <Step number={4} text="Paste URL di atas" />
          <Step number={5} text="Tutup tab (otomatis tersimpan)" />
        </div>
      </div>
    </div>
  );
}

function FirefoxContent() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium text-text-primary">Langkah-langkah:</p>
        <div className="flex flex-col gap-1 border-l-2 border-primary/20 pl-4 ml-1">
          <Step number={1} text="Buka Settings → General" />
          <Step number={2} text="Network Settings → Settings..." />
          <Step number={3} text='Checklis "Enable DNS over HTTPS"' />
          <Step number={4} text='Pilih "Custom" pada Use Provider' />
          <Step number={5} text="Paste URL di atas → OK" />
        </div>
      </div>
    </div>
  );
}
