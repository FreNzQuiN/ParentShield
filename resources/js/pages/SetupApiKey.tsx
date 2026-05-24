import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../app/contexts/AuthContext';
import { Loading, InlineError, AuthLayout, FormInput } from '../app/components/shared';
import { ShieldIcon, KeyIcon, EyeIcon, EyeOffIcon } from '../app/components/shared/icons';
import { useToast } from '../app/contexts/ToastContext';
import { storeApiKey } from '../app/services/api/setupApiKey';
import { useNavigate } from 'react-router-dom';

export default function SetupApiKey() {
  const { user, refreshUser } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!apiKey.trim()) {
      setError('Kunci API wajib diisi.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      await storeApiKey(apiKey.trim());
      await refreshUser();
      addToast({ type: 'success', message: 'Kunci API berhasil diverifikasi!' });
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      const e = err as { message?: string; errors?: Record<string, string[]>; code?: string };
      if (e?.code === 'VALIDATION_ERROR' && e?.errors) {
        const first = Object.values(e.errors)[0]?.[0];
        setError(first ?? 'Kunci API tidak valid.');
      } else {
        setError(e?.message ?? 'Gagal memverifikasi kunci API. Coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="flex flex-col items-center gap-2">
        <div className="flex flex-col items-center pb-6 pt-3">
          <div className="flex items-center gap-2">
            <ShieldIcon />
            <span className="font-['Roboto',sans-serif] text-[20px] font-bold text-[#005bbf]">
              ParentShield
            </span>
          </div>
        </div>
        {/* Stepper indicator */}
        <div className="flex items-center gap-1 pb-4">
          <div className="size-2 rounded-full bg-[#005bbf]" />
          <div className="h-px w-16 bg-[#c1c6d6]" />
          <div className="size-2 rounded-full bg-[#dfe3e8]" />
        </div>
        <h1 className="text-center font-['Roboto',sans-serif] text-[24px] font-medium text-[#181c20]">
          Masukkan Kunci API
        </h1>
        <p className="max-w-[360px] text-center font-['Roboto',sans-serif] text-sm text-[#414754]">
          Hubungkan akun AdGuard DNS Anda dengan memasukkan kunci API.
          Kunci ini diperlukan untuk mengelola perlindungan perangkat anak.
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3 pb-4">
        {error && <InlineError message={error} />}

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
          <FormInput
            id="api_key"
            label="Kunci API"
            type={showApiKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(v) => { setApiKey(v); if (error) setError(''); }}
            placeholder="Masukkan kunci API Anda"
            disabled={loading}
            autoComplete="off"
            icon={<KeyIcon />}
            rightElement={
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                tabIndex={-1}
              >
                {showApiKey ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            }
          />

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex h-[48px] w-full items-center justify-center rounded-full bg-[#1a73e8] font-['Roboto',sans-serif] text-[14px] font-medium tracking-[0.5px] text-white transition-colors hover:bg-[#1557b0] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? <Loading size="sm" message="Memproses..." /> : 'Simpan & Lanjutkan'}
            </button>
          </div>
        </form>
      </div>

      <div className="border-t border-[#e5e8ee] pt-3">
        <p className="text-center font-['Roboto',sans-serif] text-sm text-[#414754]">
          <Link
            to="https://adguard-dns.io/kb/general/api/"
            target="_blank"
            className="font-medium text-[#005bbf]"
          >
            Di mana menemukan API KEY?
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
