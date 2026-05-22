import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Loading } from '../app/components/shared';
import { forgotPassword } from '../app/services/api/auth';
import { useToast } from '../app/contexts/ToastContext';

export default function ForgotPassword() {
  const { addToast } = useToast();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const clientErrors: Record<string, string> = {};
    if (!email.trim()) clientErrors.email = 'Email is required.';
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }
    setErrors({});

    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
      addToast({ type: 'success', message: 'Reset link sent to your email.' });
    } catch (err: unknown) {
      const e = err as { errors?: Record<string, string[]> };
      if (e?.errors) {
        const flat: Record<string, string> = {};
        for (const [key, msgs] of Object.entries(e.errors)) {
          flat[key] = msgs[0];
        }
        setErrors(flat);
      } else {
        addToast({ type: 'error', message: (err as { message?: string })?.message ?? 'Failed. Try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-neutral-900">ParentShield</h1>
          <p className="mt-1 text-sm text-neutral-500">Reset your password</p>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-8 shadow-sm">
          {sent ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <p className="text-sm text-neutral-700">Check your email for the reset link.</p>
              <Link
                to="/login"
                className="mt-4 inline-block text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                Back to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <p className="mb-6 text-sm text-neutral-500">
                Enter your email address and we&apos;ll send you a link to reset your password.
              </p>

              <div className="mb-6">
                <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${
                    errors.email ? 'border-red-500' : 'border-neutral-300'
                  }`}
                  placeholder="you@example.com"
                  disabled={loading}
                  autoComplete="email"
                />
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loading size="sm" message="Sending..." /> : 'Send Reset Link'}
              </button>

              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
