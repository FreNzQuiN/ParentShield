import { AndroidIcon, CopyIcon } from '../../shared/icons';
import type { DnsAddresses } from '../../../types/device';
import { useToast } from '../../../contexts/ToastContext';
import { Step } from '../../shared/StepList';

interface AndroidSetupInstructionsProps {
  dnsAddresses: DnsAddresses;
}

export default function AndroidSetupInstructions({ dnsAddresses }: AndroidSetupInstructionsProps) {
  const { addToast } = useToast();
  const hostname = dnsAddresses.dns_over_tls_url?.replace('tls://', '') ?? '';

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
        <AndroidIcon className="size-8 text-text-muted" />
        <div>
          <h3 className="text-xl font-medium text-text-primary">Setup Perangkat Android</h3>
          <p className="text-xs text-text-muted">DNS-over-TLS (Private DNS)</p>
        </div>
      </div>

      <CopyField
        label="DNS-over-TLS URL"
        value={dnsAddresses.dns_over_tls_url}
        onCopy={() => copyToClipboard(dnsAddresses.dns_over_tls_url, 'URL')}
      />

      <CopyField
        label="Hostname (tanpa tls://)"
        value={hostname}
        onCopy={() => copyToClipboard(hostname, 'Hostname')}
      />

      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium text-text-primary">Langkah-langkah:</p>
        <div className="flex flex-col gap-1 border-l-2 border-primary/20 pl-4 ml-1">
          <Step number={1} text="Buka Settings → Network & Internet → Private DNS" />
          <Step number={2} text='Pilih "Private DNS provider hostname"' />
          <Step number={3} text={`Masukkan hostname: ${hostname}`} />
          <Step number={4} text="Tekan Save" />
        </div>
      </div>
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
