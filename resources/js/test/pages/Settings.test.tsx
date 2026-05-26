import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../../app/contexts/AuthContext';
import { ToastProvider } from '../../app/contexts/ToastProvider';
import type { User } from '../../app/types/auth';
import Settings from '../../pages/Settings';
import * as authService from '../../app/services/api/auth';
import * as setupApiKeyService from '../../app/services/api/setupApiKey';

vi.mock('../../app/services/api/auth');
vi.mock('../../app/services/api/setupApiKey');
vi.mock('react-router-dom', async (orig) => ({
  ...(await orig()),
  useNavigate: () => vi.fn(),
}));

function renderSettings(userOverrides?: Partial<User>) {
  const defaultUser: User = { id: 1, name: 'Budi', email: 'budi@test.com' };
  const user = { ...defaultUser, ...userOverrides };

  return render(
    <MemoryRouter>
      <ToastProvider>
        <AuthContext.Provider
          value={{
            user,
            loading: false,
            loginError: null,
            isAuthenticated: true,
            hasApiKey: false,
            onLogin: async () => {},
            onRegister: async () => {},
            onLogout: async () => {},
            clearError: () => {},
            refreshUser: async () => {},
          }}
        >
          <Settings />
        </AuthContext.Provider>
      </ToastProvider>
    </MemoryRouter>,
  );
}

describe('Settings page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(setupApiKeyService.checkStatus).mockResolvedValue({ has_api_key: false });
  });

  it('renders all three cards', () => {
    renderSettings();
    expect(screen.getByText('Profil Pengguna')).toBeInTheDocument();
    expect(screen.getByText('Keamanan')).toBeInTheDocument();
    expect(screen.getByText('Integrasi AdGuard')).toBeInTheDocument();
  });

  it('pre-fills name and email from user context', () => {
    renderSettings();
    const nameInput = screen.getByDisplayValue('Budi') as HTMLInputElement;
    const emailInput = screen.getByDisplayValue('budi@test.com') as HTMLInputElement;
    expect(nameInput.value).toBe('Budi');
    expect(emailInput.value).toBe('budi@test.com');
  });

  it('email input is disabled', () => {
    renderSettings();
    const emailInput = screen.getByDisplayValue('budi@test.com') as HTMLInputElement;
    expect(emailInput).toBeDisabled();
  });

  it('updates profile on submit', async () => {
    vi.mocked(authService.updateProfile).mockResolvedValue({ user: { id: 1, name: 'Budi', email: 'budi@test.com' } });
    renderSettings();
    fireEvent.click(screen.getByText('Simpan Perubahan'));
    await waitFor(() => {
      expect(authService.updateProfile).toHaveBeenCalledWith('Budi');
    });
  });

  it('shows loading state during profile update', async () => {
    vi.mocked(authService.updateProfile).mockReturnValue(new Promise(() => {}));
    renderSettings();
    fireEvent.click(screen.getByText('Simpan Perubahan'));
    expect(screen.getByText('Menyimpan...')).toBeInTheDocument();
  });

  it('shows error on profile update failure', async () => {
    vi.mocked(authService.updateProfile).mockRejectedValue({ message: 'Gagal memperbarui profil.' });
    renderSettings();
    fireEvent.click(screen.getByText('Simpan Perubahan'));
    await waitFor(() => {
      expect(screen.getByText('Gagal memperbarui profil.')).toBeInTheDocument();
    });
  });

  it('changes password on submit', async () => {
    vi.mocked(authService.changePassword).mockResolvedValue(undefined);
    renderSettings();
    const currentInput = screen.getByPlaceholderText('Masukkan kata sandi saat ini');
    const newInput = screen.getByPlaceholderText('Kata sandi baru');
    const confirmInput = screen.getByPlaceholderText('Konfirmasi kata sandi baru');
    fireEvent.change(currentInput, { target: { value: 'old-pass' } });
    fireEvent.change(newInput, { target: { value: 'new-pass' } });
    fireEvent.change(confirmInput, { target: { value: 'new-pass' } });
    fireEvent.click(screen.getByText('Perbarui Kata Sandi'));
    await waitFor(() => {
      expect(authService.changePassword).toHaveBeenCalledWith('old-pass', 'new-pass', 'new-pass');
    });
  });

  it('validates password confirmation mismatch client-side', async () => {
    renderSettings();
    const currentInput = screen.getByPlaceholderText('Masukkan kata sandi saat ini');
    const newInput = screen.getByPlaceholderText('Kata sandi baru');
    const confirmInput = screen.getByPlaceholderText('Konfirmasi kata sandi baru');
    fireEvent.change(currentInput, { target: { value: 'old-pass' } });
    fireEvent.change(newInput, { target: { value: 'new-pass' } });
    fireEvent.change(confirmInput, { target: { value: 'different-pass' } });
    fireEvent.click(screen.getByText('Perbarui Kata Sandi'));
    await waitFor(() => {
      expect(screen.getByText('Konfirmasi kata sandi tidak cocok.')).toBeInTheDocument();
    });
  });

  it('shows error on password change failure', async () => {
    vi.mocked(authService.changePassword).mockRejectedValue({
      message: 'Kata sandi saat ini salah.',
      errors: { current_password: ['Kata sandi saat ini salah.'] },
    });
    renderSettings();
    const currentInput = screen.getByPlaceholderText('Masukkan kata sandi saat ini');
    const newInput = screen.getByPlaceholderText('Kata sandi baru');
    const confirmInput = screen.getByPlaceholderText('Konfirmasi kata sandi baru');
    fireEvent.change(currentInput, { target: { value: 'wrong-pass' } });
    fireEvent.change(newInput, { target: { value: 'new-pass' } });
    fireEvent.change(confirmInput, { target: { value: 'new-pass' } });
    fireEvent.click(screen.getByText('Perbarui Kata Sandi'));
    await waitFor(() => {
      expect(screen.getAllByText('Kata sandi saat ini salah.')).toHaveLength(2);
    });
  });

  it('checks API key status on mount', async () => {
    vi.mocked(setupApiKeyService.checkStatus).mockResolvedValue({ has_api_key: true });
    renderSettings();
    await waitFor(() => {
      expect(screen.getByText('Terhubung')).toBeInTheDocument();
    });
  });

  it('shows disconnected status', async () => {
    renderSettings();
    await waitFor(() => {
      expect(screen.getByText('Belum Terhubung')).toBeInTheDocument();
    });
  });

  it('connects API key on submit', async () => {
    vi.mocked(setupApiKeyService.storeApiKey).mockResolvedValue({ has_api_key: true });
    renderSettings();
    const input = screen.getByPlaceholderText('Masukkan API Key AdGuard');
    fireEvent.change(input, { target: { value: 'my-api-key-123' } });
    fireEvent.click(screen.getByText('Hubungkan Layanan'));
    await waitFor(() => {
      expect(setupApiKeyService.storeApiKey).toHaveBeenCalledWith('my-api-key-123');
    });
  });
});
