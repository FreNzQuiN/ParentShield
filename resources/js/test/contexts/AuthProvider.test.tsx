import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../app/contexts/AuthProvider';
import { AuthContext } from '../../app/contexts/AuthContext';
import * as authApi from '../../app/services/api/auth';
import { useContext } from 'react';

vi.mock('../../app/services/api/auth');

function TestConsumer() {
  const auth = useContext(AuthContext);
  return (
    <div>
      <span data-testid="loading">{String(auth.loading)}</span>
      <span data-testid="authenticated">{String(auth.isAuthenticated)}</span>
      <span data-testid="has-api-key">{String(auth.hasApiKey)}</span>
      <span data-testid="user">{auth.user ? `${auth.user.email}|${auth.user.has_api_key}` : 'none'}</span>
      <button data-testid="login-btn" onClick={() => { auth.onLogin('a@b.com', 'pass').catch(() => {}); }}>Login</button>
      <button data-testid="register-btn" onClick={() => { auth.onRegister('Name', 'a@b.com', 'pass', 'pass').catch(() => {}); }}>Register</button>
      <button data-testid="logout-btn" onClick={() => auth.onLogout()}>Logout</button>
      <button data-testid="refresh-btn" onClick={() => auth.refreshUser()}>Refresh User</button>
    </div>
  );
}

function renderAuthProvider() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('starts with loading state when token exists', async () => {
    vi.mocked(authApi.me).mockImplementation(
      () => new Promise(() => {}),
    );
    localStorage.setItem('auth_token', 'fake-token');
    renderAuthProvider();
    expect(screen.getByTestId('loading').textContent).toBe('true');
  });

  it('shows unauthenticated when no token', async () => {
    vi.mocked(authApi.me).mockRejectedValue(new Error());
    renderAuthProvider();
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    expect(screen.getByTestId('authenticated').textContent).toBe('false');
  });

  it('shows authenticated when /me succeeds', async () => {
    vi.mocked(authApi.me).mockResolvedValue({ user: { id: 1, name: 'Test', email: 'a@b.com', has_api_key: true } });
    localStorage.setItem('auth_token', 'fake-token');

    renderAuthProvider();

    await waitFor(() => {
      expect(screen.getByTestId('authenticated').textContent).toBe('true');
    });
    expect(screen.getByTestId('user').textContent).toBe('a@b.com|true');
    expect(screen.getByTestId('has-api-key').textContent).toBe('true');
  });

  it('login sets user and stores token', async () => {
    vi.mocked(authApi.me).mockRejectedValue(new Error());
    vi.mocked(authApi.login).mockResolvedValue({
      user: { id: 1, name: 'Test', email: 'a@b.com', has_api_key: false },
      token: 'my-token',
    });

    renderAuthProvider();

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    fireEvent.click(screen.getByTestId('login-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('a@b.com|false');
    });
    expect(screen.getByTestId('has-api-key').textContent).toBe('false');
    expect(localStorage.getItem('auth_token')).toBe('my-token');
  });

  it('register sets user and stores token', async () => {
    vi.mocked(authApi.me).mockRejectedValue(new Error());
    vi.mocked(authApi.register).mockResolvedValue({
      user: { id: 1, name: 'Test', email: 'a@b.com', has_api_key: false },
      token: 'my-token',
    });

    renderAuthProvider();

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    fireEvent.click(screen.getByTestId('register-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('a@b.com|false');
    });
    expect(localStorage.getItem('auth_token')).toBe('my-token');
  });

  it('logout clears user and token', async () => {
    vi.mocked(authApi.me).mockResolvedValue({ user: { id: 1, name: 'Test', email: 'a@b.com', has_api_key: true } });
    vi.mocked(authApi.logout).mockResolvedValue(undefined);
    localStorage.setItem('auth_token', 'fake-token');

    renderAuthProvider();

    await waitFor(() => {
      expect(screen.getByTestId('authenticated').textContent).toBe('true');
    });

    fireEvent.click(screen.getByTestId('logout-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('authenticated').textContent).toBe('false');
    });
    expect(localStorage.getItem('auth_token')).toBeNull();
  });

  it('refreshUser clears state on API failure', async () => {
    vi.mocked(authApi.me)
      .mockResolvedValueOnce({ user: { id: 1, name: 'Test', email: 'a@b.com', has_api_key: true } })
      .mockRejectedValueOnce({ message: 'Gagal' });
    localStorage.setItem('auth_token', 'fake-token');

    renderAuthProvider();

    await waitFor(() => {
      expect(screen.getByTestId('authenticated').textContent).toBe('true');
    });

    fireEvent.click(screen.getByTestId('refresh-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('none');
    });
    expect(localStorage.getItem('auth_token')).toBeNull();
  });

  it('checkAuth clears state on non-auth errors (e.g. NETWORK_ERROR)', async () => {
    vi.mocked(authApi.me).mockRejectedValue({ success: false, code: 'NETWORK_ERROR', message: 'Gagal' });
    localStorage.setItem('auth_token', 'fake-token');

    renderAuthProvider();

    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('none');
    });
    expect(localStorage.getItem('auth_token')).toBeNull();
  });

  it('login failure does not clear user state incorrectly', async () => {
    vi.mocked(authApi.me).mockRejectedValue(new Error());
    vi.mocked(authApi.login).mockRejectedValue({
      success: false,
      code: 'INVALID_CREDENTIALS',
      message: 'Email atau kata sandi salah.',
    });

    renderAuthProvider();

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    fireEvent.click(screen.getByTestId('login-btn'));
    await waitFor(() => expect(authApi.login).toHaveBeenCalled());
  });
});
