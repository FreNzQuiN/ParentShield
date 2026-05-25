import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Loading, AuthLayout, FormInput } from '../app/components/shared';
import { EmailIcon } from '../app/components/shared/icons';
import { forgotPassword } from '../app/services/api/auth';
import { useToast } from '../app/contexts/ToastContext';
import { flattenFieldErrors, getErrorMessage } from '../app/utils/error';

export default function ForgotPassword() {
  const { addToast } = useToast();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const clientErrors: Record<string, string> = {};
    if (!email.trim()) clientErrors.email = 'Email wajib diisi.';
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }
    setErrors({});

    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
      addToast({ type: 'success', message: 'Link reset terkirim ke email Anda.' });
    } catch (err: unknown) {
      const fieldErrors = flattenFieldErrors(err);
      if (fieldErrors) {
        setErrors(fieldErrors);
      } else {
        addToast({ type: 'error', message: getErrorMessage(err, 'Gagal mengirim link reset. Coba lagi.') });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      {sent ? (
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <svg className="h-6 w-6 text-[#1b6d24]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>
          <p className="font-['Roboto',sans-serif] text-sm text-[#414754]">
            Periksa email Anda untuk link reset kata sandi.
          </p>
          <Link
            to="/login"
            className="font-['Roboto',sans-serif] text-sm font-medium text-[#005bbf] transition-colors hover:text-[#004a9e]"
          >
            Kembali ke Masuk
          </Link>
        </div>
      ) : (
        <>
          <div className="flex flex-col items-center gap-3 pt-3">
            <h1 className="text-center font-['Roboto',sans-serif] text-[24px] font-medium text-[#181c20]">
              Atur Ulang Kata Sandi
            </h1>
            <p className="max-w-[360px] text-center font-['Roboto',sans-serif] text-sm text-[#414754]">
              Masukkan email Anda dan kami akan mengirimkan link untuk mengatur ulang kata sandi.
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-3 pb-4">
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
              <FormInput
                id="email"
                label="Email"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="anda@example.com"
                error={errors.email}
                disabled={loading}
                autoComplete="email"
                icon={<EmailIcon />}
              />

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-[48px] w-full items-center justify-center rounded-full bg-[#005bbf] font-['Roboto',sans-serif] text-[14px] font-medium tracking-[0.5px] text-white transition-colors hover:bg-[#004a9e] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? <Loading size="sm" message="Mengirim..." /> : 'Kirim Link Reset'}
                </button>
              </div>
            </form>
          </div>

          <div className="border-t border-[#e5e8ee] pt-3">
            <p className="text-center font-['Roboto',sans-serif] text-sm text-[#414754]">
              <Link
                to="/login"
                className="font-medium text-[#005bbf]"
              >
                Kembali ke Masuk
              </Link>
            </p>
          </div>
        </>
      )}
    </AuthLayout>
  );
}
