import Modal from '../../shared/Modal';
import { ADGUARD_API_KEY_HELP_URL } from '../../../constants/urls';

interface ApiKeyInfoModalProps {
  open: boolean;
  onClose: () => void;
}

const STEPS = [
  {
    title: 'Buka Dashboard AdGuard DNS',
    description: 'Kunjungi halaman dashboard AdGuard DNS dan login ke akun Anda.',
  },
  {
    title: 'Buka Pengaturan Akun',
    description: 'Di menu sidebar, pilih "User Settings" atau "Pengaturan Akun".',
  },
  {
    title: 'Pilih Tab API Keys',
    description: 'Temukan dan klik tab "API Keys" di halaman pengaturan.',
  },
  {
    title: 'Buat Kunci API Baru',
    description: 'Klik tombol "Create API Key", berikan nama, lalu salin kunci yang dihasilkan.',
  },
];

export default function ApiKeyInfoModal({ open, onClose }: ApiKeyInfoModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Cara Mendapatkan Kunci API">
      <div className="flex flex-col gap-4">
        <p className="text-sm text-text-secondary">
          Ikuti langkah berikut untuk mendapatkan kunci API dari akun AdGuard DNS Anda:
        </p>

        <div className="flex flex-col gap-3">
          {STEPS.map((step, i) => (
            <div key={i} className="flex items-start gap-3 rounded-lg bg-bg-card-inner p-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-white">
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-text-primary">{step.title}</p>
                <p className="text-xs text-text-muted">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center gap-3 pt-2">
          <a
            href={ADGUARD_API_KEY_HELP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center rounded-lg bg-primary px-6 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
          >
            Buka Dashboard AdGuard DNS
          </a>
          <p className="text-xs text-text-muted">
            Kunci API akan ditampilkan setelah pembuatan. Simpan di tempat aman.
          </p>
        </div>
      </div>
    </Modal>
  );
}
