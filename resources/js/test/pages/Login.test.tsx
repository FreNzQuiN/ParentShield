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
    onLogin: vi.fn().mockResolvedValue(undefined),
    onRegister: vi.fn(),
    onLogout: vi.fn(),
    clearError: vi.fn(),
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
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows client-side validation errors', async () => {
    render(<Login />, { wrapper: createWrapper() });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(await screen.findByText('Email is required.')).toBeInTheDocument();
    expect(screen.getByText('Password is required.')).toBeInTheDocument();
  });

  it('calls onLogin with credentials', async () => {
    const onLogin = vi.fn().mockResolvedValue(undefined);
    render(<Login />, { wrapper: createWrapper({ onLogin }) });

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(onLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('displays login error from context', () => {
    render(<Login />, {
      wrapper: createWrapper({ loginError: 'Invalid credentials.' }),
    });
    expect(screen.getByText('Invalid credentials.')).toBeInTheDocument();
  });

  it('disables form when loading', () => {
    render(<Login />, { wrapper: createWrapper({ loading: true }) });
    expect(screen.getByLabelText('Email')).toBeDisabled();
    expect(screen.getByLabelText('Password')).toBeDisabled();
  });

  it('has links to register and forgot password', () => {
    render(<Login />, { wrapper: createWrapper() });
    expect(screen.getByText('Create one')).toHaveAttribute('href', '/register');
    expect(screen.getByText('Forgot password?')).toHaveAttribute('href', '/forgot-password');
  });
});
