import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../../pages/Login';
import { AuthContext } from '../../app/contexts/AuthContext';
import { ToastProvider } from '../../app/contexts/ToastProvider';
import type { AuthContextType } from '../../app/contexts/AuthContext';

function createWrapper(authOverrides: Partial<AuthContextType> = {}) {
  const mockAuth: AuthContextType = {
    user: null,
    loading: false,
    loginError: null,
    isAuthenticated: false,
    hasApiKey: false,
    onLogin: vi.fn().mockResolvedValue(undefined),
    onRegister: vi.fn(),
    onLogout: vi.fn(),
    clearError: vi.fn(),
    refreshUser: vi.fn().mockResolvedValue(undefined),
    ...authOverrides,
  };

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <AuthContext.Provider value={mockAuth}>
        <ToastProvider>
          <MemoryRouter>
            {children}
          </MemoryRouter>
        </ToastProvider>
      </AuthContext.Provider>
    );
  };
}

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form', () => {
    render(<Login />, { wrapper: createWrapper() });
    expect(screen.getByText('ParentShield')).toBeInTheDocument();
    expect(screen.getByLabelText('Alamat Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Kata Sandi')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /masuk/i })).toBeInTheDocument();
  });

  it('shows client-side validation errors', async () => {
    render(<Login />, { wrapper: createWrapper() });
    fireEvent.click(screen.getByRole('button', { name: /masuk/i }));
    expect(await screen.findByText('Email wajib diisi.')).toBeInTheDocument();
    expect(screen.getByText('Kata sandi wajib diisi.')).toBeInTheDocument();
  });

  it('calls onLogin with credentials', async () => {
    const onLogin = vi.fn().mockResolvedValue(undefined);
    render(<Login />, { wrapper: createWrapper({ onLogin }) });

    fireEvent.change(screen.getByLabelText('Alamat Email'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Kata Sandi'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /masuk/i }));

    await waitFor(() => {
      expect(onLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('displays login error from context', () => {
    render(<Login />, {
      wrapper: createWrapper({ loginError: 'Email atau kata sandi salah. Silakan periksa kembali.' }),
    });
    expect(screen.getByText('Email atau kata sandi salah. Silakan periksa kembali.')).toBeInTheDocument();
  });

  it('disables form when loading', () => {
    render(<Login />, { wrapper: createWrapper({ loading: true }) });
    expect(screen.getByLabelText('Alamat Email')).toBeDisabled();
    expect(screen.getByLabelText('Kata Sandi')).toBeDisabled();
  });

  it('has links to register and forgot password', () => {
    render(<Login />, { wrapper: createWrapper() });
    expect(screen.getByText('Buat Akun')).toHaveAttribute('href', '/register');
    expect(screen.getByText('Lupa kata sandi?')).toHaveAttribute('href', '/forgot-password');
  });
});
