import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider } from '../../app/contexts/ToastProvider';

vi.mock('../../app/hooks/useParentalControlPage');
vi.mock('../../app/components/features/parentalControl', () => ({
  ParentalControlSidebar: () => <div data-testid="sidebar">Sidebar</div>,
  ServiceBlocklistByCategory: () => <div data-testid="blocklist-category">BlocklistCategory</div>,
  ServiceBlocklistProvider: () => <div data-testid="blocklist-provider">BlocklistProvider</div>,
}));
vi.mock('../../app/components/features/parentalControl/ParentalControlSkeleton', () => ({
  default: () => <div data-testid="skeleton">Loading...</div>,
}));
vi.mock('../../app/components/features/parentalControl/constants', () => ({
  MAIN_TOGGLES_LABELS: { enabled: 'Kontrol Orang Tua' },
}));

import ParentalControl from '../../pages/ParentalControl';
import { useParentalControlPage } from '../../app/hooks/useParentalControlPage';

function renderPage() {
  return render(
    <MemoryRouter>
      <ToastProvider>
        <ParentalControl />
      </ToastProvider>
    </MemoryRouter>,
  );
}

describe('ParentalControl page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows skeleton when loading', () => {
    vi.mocked(useParentalControlPage).mockReturnValue({
      settings: null,
      services: [],
      loading: true,
      error: null,
      refresh: vi.fn(),
      toggleSetting: vi.fn(),
      toggleServiceGroup: vi.fn(),
      toggleService: vi.fn(),
    });

    renderPage();
    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
  });

  it('shows error state when error and no settings', () => {
    vi.mocked(useParentalControlPage).mockReturnValue({
      settings: null,
      services: [],
      loading: false,
      error: 'Gagal memuat data.',
      refresh: vi.fn(),
      toggleSetting: vi.fn(),
      toggleServiceGroup: vi.fn(),
      toggleService: vi.fn(),
    });

    renderPage();
    expect(screen.getByText('Gagal memuat data.')).toBeInTheDocument();
  });

  it('renders settings when loaded', () => {
    vi.mocked(useParentalControlPage).mockReturnValue({
      settings: {
        enabled: true,
        block_adult_websites_enabled: true,
        engines_safe_search_enabled: false,
        youtube_safe_search_enabled: false,
        blocked_services: [],
      },
      services: [],
      loading: false,
      error: null,
      refresh: vi.fn(),
      toggleSetting: vi.fn(),
      toggleServiceGroup: vi.fn(),
      toggleService: vi.fn(),
    });

    renderPage();
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('blocklist-category')).toBeInTheDocument();
    expect(screen.getByTestId('blocklist-provider')).toBeInTheDocument();
  });
});
