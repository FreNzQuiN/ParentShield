import { useState, useEffect } from 'react';
import { useAuth } from '../app/contexts/AuthContext';
import { useToast } from '../app/contexts/ToastContext';
import FormInput from '../app/components/shared/FormInput';
import SettingsCard from '../app/components/shared/SettingsCard';
import { updateProfile, changePassword } from '../app/services/api/auth';
import { storeApiKey, checkStatus } from '../app/services/api/setupApiKey';
import { flattenFieldErrors, getErrorMessage } from '../app/utils/error';

export default function Settings() {
  const { user, refreshUser } = useAuth();
  const { addToast } = useToast();

  const [name, setName] = useState(user?.name ?? '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordFieldErrors, setPasswordFieldErrors] = useState<Record<string, string> | null>(null);

  const [apiKey, setApiKey] = useState('');
  const [apiKeyLoading, setApiKeyLoading] = useState(false);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);
  const [hasApiKeyStatus, setHasApiKeyStatus] = useState(false);

  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user]);

  useEffect(() => {
    checkStatus()
      .then((res) => setHasApiKeyStatus(res.has_api_key))
      .catch(() => {});
  }, []);

  const handleUpdateProfile = async () => {
    setProfileLoading(true);
    setProfileError(null);
    try {
      await updateProfile(name);
    } catch (err) {
      setProfileError(getErrorMessage(err, 'Gagal memperbarui profil.'));
      setProfileLoading(false);
      return;
    }
    await refreshUser().catch(() => {});
    addToast({ type: 'success', message: 'Profil berhasil diperbarui.' });
    setProfileLoading(false);
  };

  const handleChangePassword = async () => {
    setPasswordError(null);
    setPasswordFieldErrors(null);

    if (newPassword !== confirmPassword) {
      setPasswordFieldErrors({ password_confirmation: 'Konfirmasi kata sandi tidak cocok.' });
      return;
    }

    setPasswordLoading(true);

    try {
      await changePassword(currentPassword, newPassword, confirmPassword);
      addToast({ type: 'success', message: 'Kata sandi berhasil diperbarui.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const fieldErrors = flattenFieldErrors(err);
      if (fieldErrors) {
        setPasswordFieldErrors(fieldErrors);
      }
      setPasswordError(getErrorMessage(err, 'Gagal memperbarui kata sandi.'));
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleUpdateApiKey = async () => {
    setApiKeyLoading(true);
    setApiKeyError(null);
    try {
      const res = await storeApiKey(apiKey);
      setHasApiKeyStatus(res.has_api_key);
      addToast({ type: 'success', message: 'API Key berhasil dihubungkan.' });
      setApiKey('');
    } catch (err) {
      setApiKeyError(getErrorMessage(err, 'Gagal menghubungkan API Key.'));
    } finally {
      setApiKeyLoading(false);
    }
  };

  const fieldError = (key: string) => passwordFieldErrors?.[key] ?? undefined;

  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto p-6">
      <h1 className="text-2xl font-bold text-text-primary">Pengaturan</h1>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 flex flex-col gap-6 lg:col-span-7">
          <SettingsCard title="Profil Pengguna" description="Perbarui informasi profil Anda." titleColor="text-primary">
            <div className="flex flex-col gap-4">
              <FormInput
                id="name"
                label="Nama Lengkap"
                value={name}
                onChange={setName}
                placeholder="Masukkan nama lengkap"
              />
              <FormInput
                id="email"
                label="Email"
                value={user?.email ?? ''}
                onChange={() => {}}
                placeholder="Email"
                disabled
              />
            </div>

            <button
              onClick={handleUpdateProfile}
              disabled={profileLoading}
              className="mt-4 h-10 rounded-lg bg-primary px-6 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
            >
              {profileLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
            {profileError && <p className="mt-2 text-xs text-error">{profileError}</p>}
          </SettingsCard>

          <SettingsCard title="Keamanan" description="Perbarui kata sandi akun Anda." titleColor="text-danger">
            <div className="flex flex-col gap-4">
              <FormInput
                id="current_password"
                label="Kata Sandi Saat Ini"
                type="password"
                value={currentPassword}
                onChange={setCurrentPassword}
                placeholder="Masukkan kata sandi saat ini"
                error={fieldError('current_password')}
              />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormInput
                  id="new_password"
                  label="Kata Sandi Baru"
                  type="password"
                  value={newPassword}
                  onChange={setNewPassword}
                  placeholder="Kata sandi baru"
                  error={fieldError('password')}
                />
                <FormInput
                  id="password_confirmation"
                  label="Konfirmasi Kata Sandi Baru"
                  type="password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  placeholder="Konfirmasi kata sandi baru"
                  error={fieldError('password_confirmation')}
                />
              </div>
            </div>

            <button
              onClick={handleChangePassword}
              disabled={passwordLoading}
              className="mt-4 h-10 rounded-lg bg-danger px-6 text-sm font-medium text-white transition-colors hover:bg-danger-hover disabled:opacity-50"
            >
              {passwordLoading ? 'Memperbarui...' : 'Perbarui Kata Sandi'}
            </button>
            {passwordError && <p className="mt-2 text-xs text-error">{passwordError}</p>}
          </SettingsCard>
        </div>

        <div className="col-span-12 lg:col-span-5">
          <SettingsCard title="Integrasi AdGuard" description="Kelola koneksi ke layanan AdGuard DNS." titleColor="text-success">
            <div className="flex flex-col gap-4">
              <FormInput
                id="api_key"
                label="API Key AdGuard"
                type="password"
                value={apiKey}
                onChange={setApiKey}
                placeholder="Masukkan API Key AdGuard"
              />
              <p className="text-xs italic text-text-muted">
                Masukkan kunci API dari akun AdGuard DNS Anda.
              </p>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-text-muted">Status:</span>
                {hasApiKeyStatus ? (
                  <span className="flex items-center gap-1 font-medium text-success">
                    <span className="text-xs">●</span> Terhubung
                  </span>
                ) : (
                  <span className="flex items-center gap-1 font-medium text-text-muted">
                    <span className="text-xs">●</span> Belum Terhubung
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={handleUpdateApiKey}
              disabled={apiKeyLoading}
              className="mt-4 h-10 w-full rounded-lg bg-success px-6 text-sm font-medium text-white transition-colors hover:brightness-110 disabled:opacity-50"
            >
              {apiKeyLoading ? 'Menghubungkan...' : 'Hubungkan Layanan'}
            </button>
            {apiKeyError && <p className="mt-2 text-xs text-error">{apiKeyError}</p>}
          </SettingsCard>
        </div>
      </div>
    </div>
  );
}
