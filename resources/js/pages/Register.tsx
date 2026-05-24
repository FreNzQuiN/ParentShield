import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../app/contexts/AuthContext';
import { Loading, InlineError, AuthLayout, FormInput } from '../app/components/shared';
import { ShieldIcon, UserIcon, EmailIcon, LockIcon, EyeIcon, EyeOffIcon, ArrowRightIcon } from '../app/components/shared/icons';
import { useToast } from '../app/contexts/ToastContext';

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
      const e = err as { errors?: Record<string, string[]> };
      if (e?.errors) {
        const flat: Record<string, string> = {};
        for (const [key, msgs] of Object.entries(e.errors)) flat[key] = msgs[0];
        setErrors(flat);
      }
    }
  };

  return (
    <AuthLayout>
      <div className="flex flex-col items-center gap-3 pt-3">
        <div className="flex flex-col items-center pb-6 pt-3">
          <div className="flex items-center gap-2">
            <ShieldIcon />
            <span className="font-['Roboto',sans-serif] text-[20px] font-bold text-[#005bbf]">
              ParentShield
            </span>
          </div>
        </div>
        <h1 className="text-center font-['Roboto',sans-serif] text-[24px] font-medium text-[#181c20]">
          Buat Akun Baru
        </h1>
        <p className="text-center font-['Roboto',sans-serif] text-sm text-[#414754]">
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
              >
                {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            }
          />

          <div className="pt-3">
            <button
              type="submit"
              disabled={loading}
              className="flex h-[48px] w-full items-center justify-center gap-2 rounded-full bg-[#005bbf] font-['Roboto',sans-serif] text-[14px] font-medium tracking-[0.5px] text-white transition-colors hover:bg-[#004a9e] disabled:cursor-not-allowed disabled:opacity-50"
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

      <div className="border-t border-[#dfe3e8] pb-3 pt-[13px]">
        <p className="text-center font-['Roboto',sans-serif] text-sm text-[#414754]">
          Sudah memiliki akun?{' '}
          <Link
            to="/login"
            className="font-['Roboto',sans-serif] text-[14px] font-medium tracking-[0.5px] text-[#005bbf]"
          >
            Masuk
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
