import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../../app/contexts/AuthContext';
import { ToastProvider } from '../../app/contexts/ToastProvider';
import SetupApiKey from '../../pages/SetupApiKey';
import * as setupApiKeyService from '../../app/services/api/setupApiKey';

vi.mock('../../app/services/api/setupApiKey');
vi.mock('react-router-dom', async (orig) => ({
  ...(await orig()),
  useNavigate: () => vi.fn(),
}));

function renderSetupApiKey() {
  return render(
    <MemoryRouter>
      <ToastProvider>
        <AuthContext.Provider
          value={{
            user: { id: 1, name: 'Test', email: 'a@b.com', has_api_key: false },
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
          <SetupApiKey />
        </AuthContext.Provider>
      </ToastProvider>
    </MemoryRouter>,
  );
}

describe('SetupApiKey page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form elements', () => {
    renderSetupApiKey();
    expect(screen.getByText('Masukkan Kunci API')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Masukkan kunci API Anda')).toBeInTheDocument();
    expect(screen.getByText('Simpan & Lanjutkan')).toBeInTheDocument();
    expect(screen.getByText('Di mana menemukan API KEY?')).toBeInTheDocument();
  });

  it('shows error for empty key', async () => {
    renderSetupApiKey();
    const button = screen.getByText('Simpan & Lanjutkan');

    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Kunci API wajib diisi.')).toBeInTheDocument();
    });
  });

  it('calls storeApiKey on valid key', async () => {
    vi.mocked(setupApiKeyService.storeApiKey).mockResolvedValue({ has_api_key: true });

    renderSetupApiKey();
    const input = screen.getByPlaceholderText('Masukkan kunci API Anda');
    const button = screen.getByText('Simpan & Lanjutkan');

    fireEvent.change(input, { target: { value: 'any-key-format' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(setupApiKeyService.storeApiKey).toHaveBeenCalledWith('any-key-format');
    });
  });

  it('shows error on API failure', async () => {
    vi.mocked(setupApiKeyService.storeApiKey).mockRejectedValue({
      message: 'Kunci API tidak valid.',
    });

    renderSetupApiKey();
    const input = screen.getByPlaceholderText('Masukkan kunci API Anda');

    fireEvent.change(input, { target: { value: 'some-key' } });
    fireEvent.click(screen.getByText('Simpan & Lanjutkan'));

    await waitFor(() => {
      expect(screen.getByText('Kunci API tidak valid.')).toBeInTheDocument();
    });
  });
});
