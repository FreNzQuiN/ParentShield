import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import RequireApiKey from '../../../app/routes/guards/RequireApiKey';

vi.mock('../../../app/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '../../../app/contexts/AuthContext';

function renderRequireApiKey() {
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Routes>
        <Route element={<RequireApiKey />}>
          <Route path="/dashboard" element={<div data-testid="dashboard-content">Dashboard</div>} />
        </Route>
        <Route path="/login" element={<div data-testid="login-page">Login</div>} />
        <Route path="/setup-api-key" element={<div data-testid="setup-key-page">Setup Key</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('RequireApiKey', () => {
  it('shows loading spinner when loading is true', () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      hasApiKey: false,
      loading: true,
    } as any);

    renderRequireApiKey();
    expect(screen.getByText('Memuat...')).toBeInTheDocument();
  });

  it('redirects to /login when not authenticated', () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      hasApiKey: false,
      loading: false,
    } as any);

    renderRequireApiKey();
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });

  it('redirects to /setup-api-key when authenticated but hasApiKey is false', () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      hasApiKey: false,
      loading: false,
    } as any);

    renderRequireApiKey();
    expect(screen.getByTestId('setup-key-page')).toBeInTheDocument();
  });

  it('renders Outlet when authenticated and hasApiKey is true', () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      hasApiKey: true,
      loading: false,
    } as any);

    renderRequireApiKey();
    expect(screen.getByTestId('dashboard-content')).toBeInTheDocument();
  });
});
