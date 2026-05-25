import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../app/contexts/AuthContext';
import { Loading, InlineError, AuthLayout, FormInput } from '../app/components/shared';
import { ShieldIcon, EyeIcon, EyeOffIcon } from '../app/components/shared/icons';
import { useToast } from '../app/contexts/ToastContext';

export default function Login() {
  const { onLogin, loading, loginError, clearError } = useAuth();
  const { addToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();

    const clientErrors: Record<string, string> = {};
    if (!email.trim()) clientErrors.email = 'Email wajib diisi.';
    if (!password) clientErrors.password = 'Kata sandi wajib diisi.';
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }
    setErrors({});

    try {
      await onLogin(email, password);
      addToast({ type: 'success', message: 'Selamat datang kembali!' });
    } catch (err: unknown) {
      const e = err as { errors?: Record<string, string[]>; message?: string };
      if (e?.errors) {
        const flat: Record<string, string> = {};
        for (const [key, msgs] of Object.entries(e.errors)) flat[key] = msgs[0];
        setErrors(flat);
      } else {
        addToast({ type: 'error', message: e?.message ?? 'Terjadi kesalahan. Silakan coba lagi.' });
      }
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
        <h1 className="text-center font-['Roboto',sans-serif] text-[24px] font-medium text-[#181c20]">
          Masuk
        </h1>
        <p className="text-center font-['Roboto',sans-serif] text-sm text-[#414754]">
          Masuk untuk mengelola profil perlindungan keluarga Anda.
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3 pb-4">
        {loginError && <InlineError message={loginError} />}

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
          <FormInput
            id="email"
            label="Alamat Email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="Masukkan email Anda"
            error={errors.email}
            disabled={loading}
            autoComplete="email"
          />

          <FormInput
            id="password"
            label="Kata Sandi"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={setPassword}
            placeholder="Masukkan kata sandi Anda"
            error={errors.password}
            disabled={loading}
            autoComplete="current-password"
            labelRight={
              <Link
                to="/forgot-password"
                className="font-['Roboto',sans-serif] text-[12px] font-medium text-[#005bbf]"
              >
                Lupa kata sandi?
              </Link>
            }
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            }
          />

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex h-[48px] w-full items-center justify-center rounded-full bg-[#1a73e8] font-['Roboto',sans-serif] text-[14px] font-medium tracking-[0.5px] text-white transition-colors hover:bg-[#1557b0] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? <Loading size="sm" message="Memproses..." /> : 'Masuk'}
            </button>
          </div>
        </form>
      </div>

      <div className="border-t border-[#e5e8ee] pt-3">
        <p className="text-center font-['Roboto',sans-serif] text-sm text-[#414754]">
          Belum memiliki akun?{' '}
          <Link to="/register" className="font-medium text-[#005bbf]">
            Buat Akun
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
