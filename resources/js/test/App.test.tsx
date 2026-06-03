import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('../app/contexts/ToastProvider', () => ({
  ToastProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('../app/contexts/AuthProvider', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('../app/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    isAuthenticated: false,
    hasApiKey: false,
    loginError: null,
    onLogin: vi.fn(),
    onRegister: vi.fn(),
    onLogout: vi.fn(),
    clearError: vi.fn(),
    refreshUser: vi.fn(),
  }),
}));

vi.mock('../app/components/shared', () => ({
  ToastContainer: () => <div data-testid="toast" />,
  Loading: ({ message }: { message?: string }) => <div>{message}</div>,
  AuthLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  FormInput: () => <input />,
  InlineError: () => <div />,
  SettingsCard: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  RefreshBar: () => <div />,
  EmptyState: () => <div />,
}));

vi.mock('../app/routes/guards', () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  RequireApiKey: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('../app/components/features', () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

import App from '../app/App';

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.pushState({}, '', '/login');
  });

  it('renders without crashing on login route', () => {
    const { container } = render(<App />);
    expect(container).toBeTruthy();
  });

  it('renders toast container', () => {
    render(<App />);
    expect(screen.getByTestId('toast')).toBeInTheDocument();
  });
});
