import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Activity from '../../pages/Activity';
import type { QueryLogItem, ActivityFilters } from '../../app/types/activity';

vi.mock('../../app/hooks/useActivityLog', () => ({
  useActivityLog: vi.fn(),
  LIMIT_OPTIONS: [15, 25, 50, 100],
}));

vi.mock('../../app/services/api/devices', () => ({
  fetchDevices: vi.fn().mockResolvedValue({ devices: [{ id: 'dev1', name: 'Laptop Adit', device_type: 'WINDOWS' }] }),
}));

import { useActivityLog } from '../../app/hooks/useActivityLog';

const mockItems: QueryLogItem[] = [
  { domain: 'google.com', time_millis: Date.now() - 60000, device_id: 'dev1' },
  { domain: 'ads.example.com', time_millis: Date.now() - 120000, device_id: 'dev2', filtering_info: { filtering_status: 'REQUEST_BLOCKED' } },
];

const defaultFilters: ActivityFilters = { search: '', timeFrom: null, timeTo: null, period: '24h', devices: [], statuses: [] };

function mockReturn(overrides?: Record<string, unknown>) {
  return {
    entries: mockItems,
    displayEntries: mockItems,
    totalFiltered: 2,
    loading: false,
    error: null,
    lastRefresh: Date.now(),
    isRefreshing: false,
    filters: defaultFilters,
    setFilters: vi.fn(),
    refresh: vi.fn(),
    goToPage: vi.fn(),
    currentPage: 1,
    totalPages: 1,
    hasPrev: false,
    hasNext: false,
    limit: 25 as const,
    setLimit: vi.fn(),
    dataTruncated: false,
    coverageNewest: null,
    coverageOldest: null,
    ...overrides,
  };
}

function renderActivity() {
  return render(
    <MemoryRouter>
      <Activity />
    </MemoryRouter>,
  );
}

describe('Activity page', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-25T10:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders page title', () => {
    vi.mocked(useActivityLog).mockReturnValue(mockReturn());
    renderActivity();
    expect(screen.getByText('Log Aktivitas')).toBeInTheDocument();
  });

  it('renders ActivitySkeleton when loading with no entries', () => {
    vi.mocked(useActivityLog).mockReturnValue(mockReturn({ entries: [], loading: true }));
    const { container } = renderActivity();
    expect(container.querySelector('.animate-pulse')).toBeTruthy();
  });

  it('renders InlineError with retry on error with no entries', () => {
    vi.mocked(useActivityLog).mockReturnValue(mockReturn({ entries: [], loading: false, error: 'Gagal memuat data.' }));
    renderActivity();
    const errors = screen.getAllByText('Gagal memuat data.');
    expect(errors.length).toBeGreaterThanOrEqual(1);
  });

  it('renders empty state when no entries and not loading', () => {
    vi.mocked(useActivityLog).mockReturnValue(mockReturn({ entries: [], loading: false }));
    renderActivity();
    expect(screen.getByText('Belum Ada Data Log')).toBeInTheDocument();
  });

  it('renders filter-empty state when entries exist but displayEntries is empty', () => {
    vi.mocked(useActivityLog).mockReturnValue(mockReturn({ entries: mockItems, displayEntries: [], totalFiltered: 0 }));
    renderActivity();
    expect(screen.getByText('Tidak Ada Data Sesuai Filter')).toBeInTheDocument();
  });

  it('renders RefreshBar with last refresh time', () => {
    vi.mocked(useActivityLog).mockReturnValue(mockReturn());
    renderActivity();
    expect(screen.getByText(/Terakhir/)).toBeInTheDocument();
  });

  it('renders pagination when totalPages > 1', () => {
    vi.mocked(useActivityLog).mockReturnValue(mockReturn({ totalPages: 3, hasNext: true }));
    renderActivity();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders limit selector with default 25', () => {
    vi.mocked(useActivityLog).mockReturnValue(mockReturn());
    renderActivity();
    expect(screen.getByText('Tampilkan')).toBeInTheDocument();
  });
});