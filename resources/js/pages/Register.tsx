import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../app/contexts/AuthContext';
import { Loading, InlineError } from '../app/components/shared';
import { useToast } from '../app/contexts/ToastContext';

function ShieldIcon() {
  return (
    <div className="flex size-[40px] items-center justify-center rounded-full bg-[#005bbf]">
      <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
        <path d="M8 0L0 3v7c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V3L8 0zm0 2.18L14 4.3v5.7c0 4.55-2.77 8.73-6 9.94V2.18z" fill="white"/>
      </svg>
    </div>
  );
}

function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 8C9.933 8 11.5 6.433 11.5 4.5S9.933 1 8 1 4.5 2.567 4.5 4.5 6.067 8 8 8zm0 2c-3.315 0-6 1.79-6 4v1h12v-1c0-2.21-2.685-4-6-4z" fill="#727785"/>
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg width="20" height="16" viewBox="0 0 20 16" fill="none">
      <path d="M18 0H2C.9 0 0 .9 0 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V2c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V2l8 5 8-5v2z" fill="#727785"/>
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="16" height="21" viewBox="0 0 16 21" fill="none">
      <path d="M13 7h-1V5c0-2.76-2.24-5-5-5S2 2.24 2 5v2H1c-1.1 0-2 .9-2 2v9c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zM8 15.17c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM10.5 7h-5V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v2z" fill="#727785"/>
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="22" height="15" viewBox="0 0 22 15" fill="none">
      <path d="M11 0C6 0 1.73 3.11 0 7.5 1.73 11.89 6 15 11 15s9.27-3.11 11-7.5C20.27 3.11 16 0 11 0zm0 12.5c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="#727785"/>
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="22" height="15" viewBox="0 0 22 15" fill="none">
      <path d="M11 0C6 0 1.73 3.11 0 7.5c1.12 2.78 3.07 5.06 5.6 6.52l-1.12 1.93 1.73 1 1.13-1.95c1.2.46 2.46.7 3.66.7s2.46-.24 3.66-.7l1.13 1.95 1.73-1-1.12-1.93c2.53-1.46 4.48-3.74 5.6-6.52C20.27 3.11 16 0 11 0zM11 3c1.66 0 3 1.34 3 3 0 .6-.18 1.16-.48 1.64l-4.15-4.16C10.24 3.07 10.62 3 11 3zM5.5 6c0-.6.18-1.16.48-1.64L3.84 2.78C2.42 4.03 1.41 5.69.88 7.5 1.73 10.39 4.2 12.5 7 12.5c1.03 0 2.03-.2 2.93-.56L8.78 10.8C8.36 10.94 7.94 11 7.5 11c-2.21 0-4-1.79-4-4s1.79-4 4-4 .59.06.86.18l4.1-4.12C11.7 2.04 10.86 2 10 2c-2.8 0-5.3 2.11-6.16 4.98.09.33.2.66.34.98.17-.34.37-.66.6-.96H5.5z" fill="#727785"/>
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 0L6.59 1.41 12.17 7H0v2h12.17l-5.58 5.59L8 16l8-8z" fill="white"/>
    </svg>
  );
}

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
        for (const [key, msgs] of Object.entries(e.errors)) {
          flat[key] = msgs[0];
        }
        setErrors(flat);
      }
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f9ff]">
      <div className="flex flex-1 items-center justify-center px-4">
        <div
          className="w-full max-w-[440px] rounded-[12px] bg-white p-6"
          style={{ boxShadow: '0px 8px 15px rgba(0,91,191,0.08)' }}
        >
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
          <p className="text-center font-['Roboto',sans-serif] text-[16px] text-[#414754]">
            Buat profil dan kelola keamanan digital keluarga Anda.
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3 pb-4">
          {loginError && (
            <div className="mb-2">
              <InlineError message={loginError} />
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="name"
                className="font-['Roboto',sans-serif] text-[14px] font-medium tracking-[0.5px] text-[#181c20]"
              >
                Nama Lengkap
              </label>
              <div className="relative">
                <div className="absolute bottom-0 left-0 top-0 flex items-center pl-3">
                  <UserIcon />
                </div>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`h-[50px] w-full rounded-[8px] border bg-[#f7f9ff] pl-[41px] pr-3 pt-[2px] font-['Roboto',sans-serif] text-[16px] text-[#727785] outline-none transition-colors ${
                    errors.name ? 'border-red-500' : 'border-[#c1c6d6]'
                  }`}
                  placeholder="Anonim"
                  disabled={loading}
                  autoComplete="name"
                />
              </div>
              {errors.name && (
                <p className="text-xs text-red-600">{errors.name}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="email"
                className="font-['Roboto',sans-serif] text-[14px] font-medium tracking-[0.5px] text-[#181c20]"
              >
                Alamat Email
              </label>
              <div className="relative">
                <div className="absolute bottom-0 left-0 top-0 flex items-center pl-3">
                  <EmailIcon />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`h-[50px] w-full rounded-[8px] border bg-[#f7f9ff] pl-[41px] pr-3 pt-[2px] font-['Roboto',sans-serif] text-[16px] text-[#727785] outline-none transition-colors ${
                    errors.email ? 'border-red-500' : 'border-[#c1c6d6]'
                  }`}
                  placeholder="anonim@family.com"
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-600">{errors.email}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="password"
                className="font-['Roboto',sans-serif] text-[14px] font-medium tracking-[0.5px] text-[#181c20]"
              >
                Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute bottom-0 left-0 top-0 flex items-center pl-3">
                  <LockIcon />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`h-[50px] w-full rounded-[8px] border bg-[#f7f9ff] pl-[41px] pr-[44px] pt-[2px] font-['Roboto',sans-serif] text-[16px] text-[#727785] outline-none transition-colors ${
                    errors.password ? 'border-red-500' : 'border-[#c1c6d6]'
                  }`}
                  placeholder="••••••••"
                  disabled={loading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              <p className="font-['Roboto',sans-serif] text-[12px] font-medium text-[#414754]">
                Minimal terdiri dari 8 karakter.
              </p>
              {errors.password && (
                <p className="text-xs text-red-600">{errors.password}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="password_confirmation"
                className="font-['Roboto',sans-serif] text-[14px] font-medium tracking-[0.5px] text-[#181c20]"
              >
                Konfirmasi Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute bottom-0 left-0 top-0 flex items-center pl-3">
                  <LockIcon />
                </div>
                <input
                  id="password_confirmation"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  className={`h-[50px] w-full rounded-[8px] border bg-[#f7f9ff] pl-[41px] pr-[44px] pt-[2px] font-['Roboto',sans-serif] text-[16px] text-[#727785] outline-none transition-colors ${
                    errors.password_confirmation ? 'border-red-500' : 'border-[#c1c6d6]'
                  }`}
                  placeholder="••••••••"
                  disabled={loading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {errors.password_confirmation && (
                <p className="text-xs text-red-600">{errors.password_confirmation}</p>
              )}
            </div>

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
          <p className="text-center font-['Roboto',sans-serif] text-[16px] text-[#414754]">
            Sudah memiliki akun?{' '}
            <Link
              to="/login"
              className="font-['Roboto',sans-serif] text-[14px] font-medium tracking-[0.5px] text-[#005bbf]"
            >
              Masuk
            </Link>
          </p>
          </div>
        </div>
      </div>

      <footer className="flex flex-col items-center gap-2 px-4 py-6">
        <p className="text-center font-['Roboto',sans-serif] text-[12px] font-medium text-[#414754]">
          &copy; 2024 ParentShield. Digital Stewardship for Every Family.
        </p>
        <div className="flex gap-3">
          <span className="text-center font-['Roboto',sans-serif] text-[12px] font-medium text-[#414754]">
            Privacy Policy
          </span>
          <span className="text-center font-['Roboto',sans-serif] text-[12px] font-medium text-[#414754]">
            Terms of Service
          </span>
          <span className="text-center font-['Roboto',sans-serif] text-[12px] font-medium text-[#414754]">
            Help Center
          </span>
        </div>
      </footer>
    </div>
  );
}
