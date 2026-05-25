import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../app/contexts/AuthContext';
import { Loading, InlineError, AuthLayout, FormInput } from '../app/components/shared';
import { ShieldIcon, EyeIcon, EyeOffIcon } from '../app/components/shared/icons';
import { useToast } from '../app/contexts/ToastContext';
import { flattenFieldErrors, getErrorMessage } from '../app/utils/error';

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
      const fieldErrors = flattenFieldErrors(err);
      if (fieldErrors) {
        setErrors(fieldErrors);
      } else {
        addToast({ type: 'error', message: getErrorMessage(err, 'Terjadi kesalahan. Silakan coba lagi.') });
      }
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
        <h1 className="text-center text-2xl font-medium text-text-primary">
          Masuk
        </h1>
        <p className="text-center text-sm text-text-secondary">
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
                className="text-xs font-medium text-primary"
              >
                Lupa kata sandi?
              </Link>
            }
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            }
          />

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex h-12 w-full items-center justify-center rounded-full bg-primary text-sm font-medium tracking-[0.5px] text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? <Loading size="sm" message="Memproses..." /> : 'Masuk'}
            </button>
          </div>
        </form>
      </div>

      <div className="border-t border-inactive pt-3">
        <p className="text-center text-sm text-text-secondary">
          Belum memiliki akun?{' '}
          <Link to="/register" className="font-medium text-primary">
            Buat Akun
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
