import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../app/contexts/AuthContext';
import { Loading, InlineError, AuthLayout, FormInput } from '../app/components/shared';
import { ShieldIcon, UserIcon, EmailIcon, LockIcon, EyeIcon, EyeOffIcon, ArrowRightIcon } from '../app/components/shared/icons';
import { useToast } from '../app/contexts/ToastContext';
import { flattenFieldErrors, getErrorMessage } from '../app/utils/error';

export default function Register() {
  const { onRegister, loading, loginError, clearError } = useAuth();
  const { addToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();

    const clientErrors: Record<string, string> = {};
    if (!name.trim()) clientErrors.name = 'Nama lengkap wajib diisi.';
    if (!email.trim()) clientErrors.email = 'Email wajib diisi.';
    if (!password) clientErrors.password = 'Kata sandi wajib diisi.';
    else if (password.length < 8) clientErrors.password = 'Kata sandi minimal 8 karakter.';
    if (password !== passwordConfirmation) clientErrors.password_confirmation = 'Kata sandi tidak cocok.';

    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }
    setErrors({});

    try {
      await onRegister(name, email, password, passwordConfirmation);
      addToast({ type: 'success', message: 'Akun berhasil dibuat!' });
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
      <div className="flex flex-col items-center gap-3 pt-3">
        <div className="flex flex-col items-center pb-6 pt-3">
          <div className="flex items-center gap-2">
            <ShieldIcon />
            <span className="text-xl font-bold text-primary">
              ParentShield
            </span>
          </div>
        </div>
        <h1 className="text-center text-2xl font-medium text-text-primary">
          Buat Akun Baru
        </h1>
        <p className="text-center text-sm text-text-secondary">
          Buat profil dan kelola keamanan digital keluarga Anda.
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3 pb-4">
        {loginError && <InlineError message={loginError} />}

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
          <FormInput
            id="name"
            label="Nama Lengkap"
            type="text"
            value={name}
            onChange={setName}
            placeholder="Anonim"
            error={errors.name}
            disabled={loading}
            autoComplete="name"
            icon={<UserIcon />}
          />

          <FormInput
            id="email"
            label="Alamat Email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="anonim@family.com"
            error={errors.email}
            disabled={loading}
            autoComplete="email"
            icon={<EmailIcon />}
          />

          <FormInput
            id="password"
            label="Kata Sandi"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={setPassword}
            placeholder="••••••••"
            error={errors.password}
            disabled={loading}
            autoComplete="new-password"
            icon={<LockIcon />}
            helperText="Minimal terdiri dari 8 karakter."
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

          <FormInput
            id="password_confirmation"
            label="Konfirmasi Kata Sandi"
            type={showConfirmPassword ? 'text' : 'password'}
            value={passwordConfirmation}
            onChange={setPasswordConfirmation}
            placeholder="••••••••"
            error={errors.password_confirmation}
            disabled={loading}
            autoComplete="new-password"
            icon={<LockIcon />}
            rightElement={
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex={-1}
                aria-label={showConfirmPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
              >
                {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            }
          />

          <div className="pt-3">
            <button
              type="submit"
              disabled={loading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-medium tracking-[0.5px] text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <Loading size="sm" message="Memproses..." />
              ) : (
                <>
                  Buat Akun
                  <ArrowRightIcon />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="border-t border-inactive pb-3 pt-[13px]">
        <p className="text-center text-sm text-text-secondary">
          Sudah memiliki akun?{' '}
          <Link
            to="/login"
            className="text-sm font-medium tracking-[0.5px] text-primary"
          >
            Masuk
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
