import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../../../app/routes/guards/ProtectedRoute';

vi.mock('../../../app/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '../../../app/contexts/AuthContext';

function renderProtectedRoute() {
  return render(
    <MemoryRouter initialEntries={['/protected']}>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/protected" element={<div data-testid="protected-content">Dashboard</div>} />
        </Route>
        <Route path="/login" element={<div data-testid="login-page">Login</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ProtectedRoute', () => {
  it('shows loading spinner when loading is true', () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      loading: true,
    } as any);

    renderProtectedRoute();
    expect(screen.getByText('Memuat...')).toBeInTheDocument();
  });

  it('redirects to /login when not authenticated', () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      loading: false,
    } as any);

    renderProtectedRoute();
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });

  it('renders Outlet when authenticated', () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      loading: false,
    } as any);

    renderProtectedRoute();
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });
});
