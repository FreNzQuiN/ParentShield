import { useState } from 'react';
import { AndroidIcon, CopyIcon } from '../../shared/icons';
import type { DnsAddresses } from '../../../types/device';
import { useToast } from '../../../contexts/ToastContext';

interface AndroidSetupInstructionsProps {
  dnsAddresses: DnsAddresses;
}

export default function AndroidSetupInstructions({ dnsAddresses }: AndroidSetupInstructionsProps) {
  const { addToast } = useToast();
  const hostname = dnsAddresses.dns_over_tls_url?.replace('tls://', '') ?? '';

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      addToast({ type: 'success', message: `${label} tersalin ke clipboard.` });
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <AndroidIcon className="size-8 text-[#727785]" />
        <div>
          <h3 className="font-['Roboto',sans-serif] text-[20px] font-medium text-[#181c20]">Setup Perangkat Android</h3>
          <p className="text-xs text-[#727785]">DNS-over-TLS (Private DNS)</p>
        </div>
      </div>

      <div className="rounded-lg border border-[#dfe3e8] bg-[#f7f9ff] p-4">
        <p className="mb-2 font-['Roboto',sans-serif] text-xs font-medium text-[#414754]">DNS-over-TLS URL</p>
        <div className="flex items-center gap-2">
          <code className="flex-1 truncate rounded bg-white px-3 py-2 text-sm text-[#181c20]">
            {dnsAddresses.dns_over_tls_url}
          </code>
          <button
            onClick={() => copyToClipboard(dnsAddresses.dns_over_tls_url, 'URL')}
            className="rounded-lg p-2 text-[#005bbf] hover:bg-[#f1f4fa] transition-colors"
            aria-label="Salin URL"
          >
            <CopyIcon className="size-4" />
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-[#dfe3e8] bg-[#f7f9ff] p-4">
        <p className="mb-2 font-['Roboto',sans-serif] text-xs font-medium text-[#414754]">Hostname (tanpa tls://)</p>
        <div className="flex items-center gap-2">
          <code className="flex-1 truncate rounded bg-white px-3 py-2 text-sm text-[#181c20]">
            {hostname}
          </code>
          <button
            onClick={() => copyToClipboard(hostname, 'Hostname')}
            className="rounded-lg p-2 text-[#005bbf] hover:bg-[#f1f4fa] transition-colors"
            aria-label="Salin hostname"
          >
            <CopyIcon className="size-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <p className="font-['Roboto',sans-serif] text-sm font-medium text-[#181c20]">Langkah-langkah:</p>
        <Step number={1} text="Buka Settings → Network & Internet → Private DNS" />
        <Step number={2} text='Pilih "Private DNS provider hostname"' />
        <Step number={3} text={`Masukkan hostname: ${hostname}`} />
        <Step number={4} text="Tekan Save" />
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
