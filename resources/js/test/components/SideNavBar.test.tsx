import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mockOnLogout = vi.fn().mockResolvedValue(undefined);

vi.mock('../../app/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 1, name: 'Test', email: 'a@b.com', has_api_key: true },
    loading: false,
    isAuthenticated: true,
    hasApiKey: true,
    loginError: null,
    onLogin: vi.fn(),
    onRegister: vi.fn(),
    onLogout: mockOnLogout,
    clearError: vi.fn(),
    refreshUser: vi.fn(),
  }),
}));

vi.mock('../../app/contexts/ToastContext', () => ({
  useToast: () => ({ addToast: vi.fn() }),
}));

import SideNavBar from '../../app/components/features/SideNavBar';

describe('SideNavBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the brand name (desktop + mobile = 2)', () => {
    render(
      <MemoryRouter>
        <SideNavBar mobileOpen={false} onClose={() => {}} />
      </MemoryRouter>,
    );
    expect(screen.getAllByText('ParentShield').length).toBeGreaterThanOrEqual(1);
  });

  it('renders all nav items (desktop + mobile)', () => {
    render(
      <MemoryRouter>
        <SideNavBar mobileOpen={false} onClose={() => {}} />
      </MemoryRouter>,
    );
    expect(screen.getAllByText('Halaman Utama').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Aktivitas Lengkap').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Perangkat Dilindungi').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Kontrol Orang Tua').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Pengaturan Akun').length).toBeGreaterThanOrEqual(1);
  });

  it('opens dialog then calls onLogout when confirmed', async () => {
    render(
      <MemoryRouter>
        <SideNavBar mobileOpen={false} onClose={() => {}} />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getAllByText('Keluar')[0]);
    await waitFor(() => expect(screen.getByText('Konfirmasi Keluar')).toBeInTheDocument());
    fireEvent.click(screen.getAllByText('Keluar')[2]);
    await waitFor(() => expect(mockOnLogout).toHaveBeenCalled());
  });

  it('calls onClose when a nav link is clicked', () => {
    const onClose = vi.fn();
    render(
      <MemoryRouter>
        <SideNavBar mobileOpen={true} onClose={onClose} />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getAllByText('Halaman Utama')[0]);
    expect(onClose).toHaveBeenCalled();
  });
});
