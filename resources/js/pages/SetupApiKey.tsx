import { useState, useEffect, type FormEvent } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../app/contexts/AuthContext';
import { Loading, InlineError, AuthLayout, FormInput } from '../app/components/shared';
import { ShieldIcon, KeyIcon, EyeIcon, EyeOffIcon } from '../app/components/shared/icons';
import { useToast } from '../app/contexts/ToastContext';
import { storeApiKey } from '../app/services/api/setupApiKey';
import ApiKeyInfoModal from '../app/components/features/setupApiKey/ApiKeyInfoModal';

export default function SetupApiKey() {
  const { refreshUser, hasApiKey } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const keyRevoked = searchParams.get('reason') === 'revoked';

  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [justSubmitted, setJustSubmitted] = useState(false);
  const [infoModalOpen, setInfoModalOpen] = useState(false);

  useEffect(() => {
    if (justSubmitted && hasApiKey) {
      navigate('/dashboard', { replace: true });
    }
  }, [justSubmitted, hasApiKey, navigate]);

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
      setJustSubmitted(true);
      await refreshUser();
      addToast({ type: 'success', message: 'Kunci API berhasil diverifikasi!' });
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
            <span className="text-xl font-bold text-primary">
              ParentShield
            </span>
          </div>
        </div>
        {/* Stepper indicator */}
        <div className="flex items-center gap-1 pb-4">
          <div className="size-2 rounded-full bg-primary" />
          <div className="h-px w-16 bg-border" />
          <div className="size-2 rounded-full bg-inactive" />
        </div>
        <h1 className="text-center text-2xl font-medium text-text-primary">
          Masukkan Kunci API
        </h1>
        <p className="max-w-[360px] text-center text-sm text-text-secondary">
          Hubungkan akun AdGuard DNS Anda dengan memasukkan kunci API.
          Kunci ini diperlukan untuk mengelola perlindungan perangkat anak.
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3 pb-4">
        {keyRevoked && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            Kunci API sebelumnya tidak valid atau telah dicabut.
            Silakan masukkan kunci API yang baru.
          </div>
        )}
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
              className="flex h-12 w-full items-center justify-center rounded-full bg-primary text-sm font-medium tracking-[0.5px] text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? <Loading size="sm" message="Memproses..." /> : 'Simpan & Lanjutkan'}
            </button>
          </div>
        </form>
      </div>

      <div className="border-t border-inactive pt-3">
        <p className="text-center text-sm text-text-secondary">
          <button
            type="button"
            onClick={() => setInfoModalOpen(true)}
            className="font-medium text-primary hover:underline"
          >
            Di mana mendapatkan API KEY?
          </button>
        </p>
      </div>

      <ApiKeyInfoModal open={infoModalOpen} onClose={() => setInfoModalOpen(false)} />
    </AuthLayout>
  );
}
