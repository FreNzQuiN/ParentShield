import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from '../../pages/Dashboard';

vi.mock('../../app/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../app/hooks/useDashboard', () => ({
  useDashboard: vi.fn(),
}));

import { useAuth } from '../../app/contexts/AuthContext';
import { useDashboard } from '../../app/hooks/useDashboard';

const mockDashboardData = {
  stats: { total_queries: 1500, blocked_count: 320, blocked_categories: ['Social'], active_devices: 4, suspicious_devices: 0 },
  time_series: [{ hour: 0, allowed: 100, blocked: 10 }],
  top_activities: [{ domain: 'google.com', count: 200, percentage: 40 }],
  categories_blocked: [],
  sources_blocked: [{ name: 'Situs Berbahaya', count: 50, percentage: 15 }],
  safebrowsing: { safe_search_enabled: false, block_dangerous_enabled: true, block_nrd_enabled: false },
  parental_control: {
    enabled: true,
    block_adult_websites_enabled: true,
    engines_safe_search_enabled: false,
    youtube_safe_search_enabled: false,
    blocked_services: [{ id: '9gag', enabled: true }],
  },
  devices: [
    { id: '1', name: 'Laptop', device_type: 'windows', is_online: true, last_seen: Date.now(), protection_enabled: true },
    { id: '2', name: 'Tablet', device_type: 'android', is_online: true, last_seen: Date.now(), protection_enabled: true },
    { id: '3', name: 'HP Anak', device_type: 'iphone', is_online: false, last_seen: Date.now() - 8 * 3600000, protection_enabled: true },
    { id: '4', name: 'PC', device_type: 'windows', is_online: false, last_seen: Date.now() - 300000, protection_enabled: false },
  ],
  account_limits: { devices: { used: 4, max: 10 } },
};

function renderDashboard() {
  return render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>,
  );
}

describe('Dashboard page', () => {
  beforeEach(() => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-25T10:00:00'));
    vi.mocked(useAuth).mockReturnValue({ user: { name: 'Budi', email: 'budi@test.com' } } as any);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders DashboardSkeleton when loading with no data', () => {
    vi.mocked(useDashboard).mockReturnValue({
      data: null, loading: true, error: null,
      refresh: vi.fn(), softRefresh: vi.fn(), isRefreshing: false, lastRefresh: null, retryCount: 0,
      toggleSafebrowsing: vi.fn(), toggleParentalControl: vi.fn(),
    });

    const { container } = renderDashboard();
    expect(container.querySelector('.animate-pulse')).toBeTruthy();
  });

  it('renders InlineError with retry when error and no data', () => {
    vi.mocked(useDashboard).mockReturnValue({
      data: null, loading: false, error: 'Gagal memuat.',
      refresh: vi.fn(), softRefresh: vi.fn(), isRefreshing: false, lastRefresh: null, retryCount: 0,
      toggleSafebrowsing: vi.fn(), toggleParentalControl: vi.fn(),
    });

    renderDashboard();
    expect(screen.getByText('Gagal memuat.')).toBeInTheDocument();
    expect(screen.getByText('Coba Lagi')).toBeInTheDocument();
  });

  it('renders greeting with user name', () => {
    vi.mocked(useDashboard).mockReturnValue({
      data: mockDashboardData, loading: false, error: null,
      refresh: vi.fn(), softRefresh: vi.fn(), isRefreshing: false, lastRefresh: null, retryCount: 0,
      toggleSafebrowsing: vi.fn(), toggleParentalControl: vi.fn(),
    });

    renderDashboard();
    expect(screen.getByText(/Selamat Pagi/)).toBeInTheDocument();
    expect(screen.getByText(/Budi/)).toBeInTheDocument();
  });

  it('renders stat cards with formatted values', () => {
    vi.mocked(useDashboard).mockReturnValue({
      data: mockDashboardData, loading: false, error: null,
      refresh: vi.fn(), softRefresh: vi.fn(), isRefreshing: false, lastRefresh: null, retryCount: 0,
      toggleSafebrowsing: vi.fn(), toggleParentalControl: vi.fn(),
    });

    renderDashboard();
    expect(screen.getByText('1.500')).toBeInTheDocument();
    expect(screen.getByText('320')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('shows LoadingOverlay when loading with existing data', () => {
    vi.mocked(useDashboard).mockReturnValue({
      data: mockDashboardData, loading: true, error: null,
      refresh: vi.fn(), softRefresh: vi.fn(), isRefreshing: false, lastRefresh: null, retryCount: 0,
      toggleSafebrowsing: vi.fn(), toggleParentalControl: vi.fn(),
    });

    renderDashboard();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders KontrolParental when parental_control exists', () => {
    vi.mocked(useDashboard).mockReturnValue({
      data: mockDashboardData, loading: false, error: null,
      refresh: vi.fn(), softRefresh: vi.fn(), isRefreshing: false, lastRefresh: null, retryCount: 0,
      toggleSafebrowsing: vi.fn(), toggleParentalControl: vi.fn(),
    });

    renderDashboard();
    expect(screen.getAllByText('Kontrol Parental').length).toBeGreaterThanOrEqual(1);
  });

  it('shows greeting based on time of day — siang', () => {
    vi.setSystemTime(new Date('2026-05-25T13:00:00'));
    vi.mocked(useDashboard).mockReturnValue({
      data: mockDashboardData, loading: false, error: null,
      refresh: vi.fn(), softRefresh: vi.fn(), isRefreshing: false, lastRefresh: null, retryCount: 0,
      toggleSafebrowsing: vi.fn(), toggleParentalControl: vi.fn(),
    });

    renderDashboard();
    expect(screen.getByText(/Selamat Siang/)).toBeInTheDocument();
  });

  it('shows greeting based on time of day — sore', () => {
    vi.setSystemTime(new Date('2026-05-25T16:00:00'));
    vi.mocked(useDashboard).mockReturnValue({
      data: mockDashboardData, loading: false, error: null,
      refresh: vi.fn(), softRefresh: vi.fn(), isRefreshing: false, lastRefresh: null, retryCount: 0,
      toggleSafebrowsing: vi.fn(), toggleParentalControl: vi.fn(),
    });

    renderDashboard();
    expect(screen.getByText(/Selamat Sore/)).toBeInTheDocument();
  });

  it('shows greeting based on time of day — malam', () => {
    vi.setSystemTime(new Date('2026-05-25T20:00:00'));
    vi.mocked(useDashboard).mockReturnValue({
      data: mockDashboardData, loading: false, error: null,
      refresh: vi.fn(), softRefresh: vi.fn(), isRefreshing: false, lastRefresh: null, retryCount: 0,
      toggleSafebrowsing: vi.fn(), toggleParentalControl: vi.fn(),
    });

    renderDashboard();
    expect(screen.getByText(/Selamat Malam/)).toBeInTheDocument();
  });

  it('renders with empty data gracefully', () => {
    const emptyData = {
      ...mockDashboardData,
      stats: { total_queries: 0, blocked_count: 0, blocked_categories: [], active_devices: 0, suspicious_devices: 0 },
      time_series: [],
      top_activities: [],
      sources_blocked: [],
      parental_control: null as any,
      devices: [],
    };

    vi.mocked(useDashboard).mockReturnValue({
      data: emptyData, loading: false, error: null,
      refresh: vi.fn(), softRefresh: vi.fn(), isRefreshing: false, lastRefresh: null, retryCount: 0,
      toggleSafebrowsing: vi.fn(), toggleParentalControl: vi.fn(),
    });

    renderDashboard();
    expect(screen.getAllByText('0').length).toBe(3);
    expect(screen.queryByText('Kontrol Parental')).not.toBeInTheDocument();
  });

  it('shows device breakdown with inactive and needs-setup indicators', () => {
    vi.setSystemTime(new Date('2026-05-25T10:00:00'));
    const baseTime = new Date('2026-05-25T10:00:00').getTime();
    const eightHoursMs = 8 * 3600000;
    const devicesWithMix = [
      { id: '1', name: 'Online', device_type: 'windows', is_online: true, last_seen: baseTime, protection_enabled: true },
      { id: '2', name: 'Inactive', device_type: 'android', is_online: false, last_seen: baseTime - eightHoursMs, protection_enabled: true },
      { id: '3', name: 'Unset', device_type: 'iphone', is_online: false, last_seen: baseTime - 120000, protection_enabled: false },
    ];

    vi.mocked(useDashboard).mockReturnValue({
      data: { ...mockDashboardData, devices: devicesWithMix }, loading: false, error: null,
      refresh: vi.fn(), softRefresh: vi.fn(), isRefreshing: false, lastRefresh: null, retryCount: 0,
      toggleSafebrowsing: vi.fn(), toggleParentalControl: vi.fn(),
    });

    renderDashboard();
    expect(screen.getByText('1 Perlu Setup')).toBeInTheDocument();
    expect(screen.getByText('1 Tidak Aktif')).toBeInTheDocument();
  });

  it('disables refresh button while isRefreshing', () => {
    vi.mocked(useDashboard).mockReturnValue({
      data: mockDashboardData, loading: false, error: null,
      refresh: vi.fn(), softRefresh: vi.fn(), isRefreshing: true, lastRefresh: null, retryCount: 0,
      toggleSafebrowsing: vi.fn(), toggleParentalControl: vi.fn(),
    });

    renderDashboard();
    expect(screen.getByLabelText('Muat ulang dashboard')).toBeDisabled();
  });

  it('falls back to "Pengguna" when user name is missing', () => {
    vi.mocked(useAuth).mockReturnValue({ user: null } as any);
    vi.mocked(useDashboard).mockReturnValue({
      data: mockDashboardData, loading: false, error: null,
      refresh: vi.fn(), softRefresh: vi.fn(), isRefreshing: false, lastRefresh: null, retryCount: 0,
      toggleSafebrowsing: vi.fn(), toggleParentalControl: vi.fn(),
    });

    renderDashboard();
    expect(screen.getByText(/Pengguna/)).toBeInTheDocument();
  });
});
