import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Register from '../../pages/Register';
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
    onLogin: vi.fn(),
    onRegister: vi.fn().mockResolvedValue(undefined),
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

describe('Register', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders register form', () => {
    render(<Register />, { wrapper: createWrapper() });
    expect(screen.getByLabelText('Nama Lengkap')).toBeInTheDocument();
    expect(screen.getByLabelText('Alamat Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Kata Sandi')).toBeInTheDocument();
    expect(screen.getByLabelText('Konfirmasi Kata Sandi')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /buat akun/i })).toBeInTheDocument();
  });

  it('shows validation for empty fields', async () => {
    render(<Register />, { wrapper: createWrapper() });
    fireEvent.click(screen.getByRole('button', { name: /buat akun/i }));
    expect(await screen.findByText('Nama lengkap wajib diisi.')).toBeInTheDocument();
    expect(screen.getByText('Email wajib diisi.')).toBeInTheDocument();
    expect(screen.getByText('Kata sandi wajib diisi.')).toBeInTheDocument();
  });

  it('validates password length', async () => {
    render(<Register />, { wrapper: createWrapper() });
    fireEvent.change(screen.getByLabelText('Kata Sandi'), {
      target: { value: 'short' },
    });
    fireEvent.click(screen.getByRole('button', { name: /buat akun/i }));
    expect(await screen.findByText('Kata sandi minimal 8 karakter.')).toBeInTheDocument();
  });

  it('validates password confirmation match', async () => {
    render(<Register />, { wrapper: createWrapper() });
    fireEvent.change(screen.getByLabelText('Kata Sandi'), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText('Konfirmasi Kata Sandi'), {
      target: { value: 'different' },
    });
    fireEvent.click(screen.getByRole('button', { name: /buat akun/i }));
    expect(await screen.findByText('Kata sandi tidak cocok.')).toBeInTheDocument();
  });

  it('calls onRegister with all fields', async () => {
    const onRegister = vi.fn().mockResolvedValue(undefined);
    render(<Register />, { wrapper: createWrapper({ onRegister }) });

    fireEvent.change(screen.getByLabelText('Nama Lengkap'), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText('Alamat Email'), { target: { value: 'john@test.com' } });
    fireEvent.change(screen.getByLabelText('Kata Sandi'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('Konfirmasi Kata Sandi'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /buat akun/i }));

    await waitFor(() => {
      expect(onRegister).toHaveBeenCalledWith(
        'John', 'john@test.com', 'password123', 'password123',
      );
    });
  });

  it('disables form when loading', () => {
    render(<Register />, { wrapper: createWrapper({ loading: true }) });
    expect(screen.getByLabelText('Nama Lengkap')).toBeDisabled();
    expect(screen.getByLabelText('Alamat Email')).toBeDisabled();
    expect(screen.getByLabelText('Kata Sandi')).toBeDisabled();
    expect(screen.getByLabelText('Konfirmasi Kata Sandi')).toBeDisabled();
  });

  it('has link to login', () => {
    render(<Register />, { wrapper: createWrapper() });
    expect(screen.getByText('Masuk')).toHaveAttribute('href', '/login');
  });
});
