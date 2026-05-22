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
    onLogin: vi.fn(),
    onRegister: vi.fn().mockResolvedValue(undefined),
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

describe('Register', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders register form', () => {
    render(<Register />, { wrapper: createWrapper() });
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('shows validation for empty fields', async () => {
    render(<Register />, { wrapper: createWrapper() });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    expect(await screen.findByText('Name is required.')).toBeInTheDocument();
    expect(screen.getByText('Email is required.')).toBeInTheDocument();
    expect(screen.getByText('Password is required.')).toBeInTheDocument();
  });

  it('validates password length', async () => {
    render(<Register />, { wrapper: createWrapper() });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'short' },
    });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    expect(await screen.findByText('Password must be at least 8 characters.')).toBeInTheDocument();
  });

  it('validates password confirmation match', async () => {
    render(<Register />, { wrapper: createWrapper() });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText('Confirm Password'), {
      target: { value: 'different' },
    });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    expect(await screen.findByText('Passwords do not match.')).toBeInTheDocument();
  });

  it('calls onRegister with all fields', async () => {
    const onRegister = vi.fn().mockResolvedValue(undefined);
    render(<Register />, { wrapper: createWrapper({ onRegister }) });

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'john@test.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(onRegister).toHaveBeenCalledWith(
        'John', 'john@test.com', 'password123', 'password123',
      );
    });
  });

  it('disables form when loading', () => {
    render(<Register />, { wrapper: createWrapper({ loading: true }) });
    expect(screen.getByLabelText('Name')).toBeDisabled();
    expect(screen.getByLabelText('Email')).toBeDisabled();
    expect(screen.getByLabelText('Password')).toBeDisabled();
    expect(screen.getByLabelText('Confirm Password')).toBeDisabled();
  });

  it('has link to login', () => {
    render(<Register />, { wrapper: createWrapper() });
    expect(screen.getByText('Sign in')).toHaveAttribute('href', '/login');
  });
});
