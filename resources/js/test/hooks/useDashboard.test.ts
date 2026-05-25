import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useDashboard } from '../../app/hooks/useDashboard';
import type { DashboardData } from '../../app/types/dashboard';

const mockDashboardData: DashboardData = {
  stats: { total_queries: 100, blocked_count: 20, blocked_categories: ['Social'], active_devices: 3, suspicious_devices: 0 },
  time_series: [],
  top_activities: [],
  categories_blocked: [],
  sources_blocked: [],
  safebrowsing: { safe_search_enabled: false, block_dangerous_enabled: true, block_nrd_enabled: false },
  parental_control: {
    enabled: true,
    block_adult_websites_enabled: true,
    engines_safe_search_enabled: false,
    youtube_safe_search_enabled: false,
    blocked_services: [{ id: '9gag', enabled: true }, { id: 'tiktok', enabled: false }],
  },
  devices: [],
  account_limits: { devices: { used: 3, max: 10 } },
};

vi.mock('../../app/services/api/dashboard', () => ({
  fetchDashboard: vi.fn(),
  updateSafebrowsing: vi.fn(),
  updateParentalControl: vi.fn(),
}));

import { fetchDashboard, updateSafebrowsing, updateParentalControl } from '../../app/services/api/dashboard';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useDashboard', () => {
  describe('initial state and refresh', () => {
    it('starts with loading=true and data=null, then fetches', async () => {
      vi.mocked(fetchDashboard).mockResolvedValue(mockDashboardData);

      const { result } = renderHook(() => useDashboard());

      expect(result.current.loading).toBe(true);
      expect(result.current.data).toBeNull();

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.data).toEqual(mockDashboardData);
      expect(result.current.error).toBeNull();
    });

    it('sets error on fetch failure', async () => {
      vi.mocked(fetchDashboard).mockRejectedValue({ message: 'Gagal memuat data.' });

      const { result } = renderHook(() => useDashboard());

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.error).toBe('Gagal memuat data.');
      expect(result.current.data).toBeNull();
    });

    it('sets default error message when error has no message field', async () => {
      vi.mocked(fetchDashboard).mockRejectedValue('Network Error');

      const { result } = renderHook(() => useDashboard());

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.error).toBe('Gagal memuat data dashboard.');
    });

    it('softRefresh keeps existing data on failure', async () => {
      vi.mocked(fetchDashboard).mockResolvedValue(mockDashboardData);

      const { result } = renderHook(() => useDashboard());
      await waitFor(() => expect(result.current.loading).toBe(false));

      vi.mocked(fetchDashboard).mockRejectedValue(new Error('fail'));
      act(() => { result.current.softRefresh(); });

      await waitFor(() => expect(result.current.isRefreshing).toBe(false));
      expect(result.current.data).toEqual(mockDashboardData);
      expect(result.current.error).toBeNull();
    });
  });

  describe('toggleSafebrowsing', () => {
    it('optimistically updates safebrowsing, reverts on failure', async () => {
      vi.mocked(fetchDashboard).mockResolvedValue(mockDashboardData);
      vi.mocked(updateSafebrowsing).mockRejectedValue(new Error('fail'));

      const { result } = renderHook(() => useDashboard());
      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.data!.safebrowsing.block_dangerous_enabled).toBe(true);

      await act(async () => {
        try {
          await result.current.toggleSafebrowsing('block_dangerous_enabled', false);
        } catch {}
      });

      expect(result.current.data!.safebrowsing.block_dangerous_enabled).toBe(true);
    });

    it('keeps optimistic update on success', async () => {
      vi.mocked(fetchDashboard).mockResolvedValue(mockDashboardData);
      vi.mocked(updateSafebrowsing).mockResolvedValue(undefined);

      const { result } = renderHook(() => useDashboard());
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.toggleSafebrowsing('safe_search_enabled', true);
      });

      expect(result.current.data!.safebrowsing.safe_search_enabled).toBe(true);
    });
  });

  describe('toggleParentalControl', () => {
    it('optimistically updates blocked_service, rolls back snapshot on failure', async () => {
      vi.mocked(fetchDashboard).mockResolvedValue(mockDashboardData);
      vi.mocked(updateParentalControl).mockRejectedValue(new Error('fail'));

      const { result } = renderHook(() => useDashboard());
      await waitFor(() => expect(result.current.loading).toBe(false));

      const original = [...result.current.data!.parental_control.blocked_services];

      await act(async () => {
        try {
          await result.current.toggleParentalControl('blocked_service', {
            id: '9gag',
            enabled: false,
          });
        } catch {}
      });

      expect(result.current.data!.parental_control.blocked_services).toEqual(original);
    });

    it('optimistically updates service_group, rolls back snapshot on failure', async () => {
      vi.mocked(fetchDashboard).mockResolvedValue(mockDashboardData);
      vi.mocked(updateParentalControl).mockRejectedValue(new Error('fail'));

      const { result } = renderHook(() => useDashboard());
      await waitFor(() => expect(result.current.loading).toBe(false));

      const original = [...result.current.data!.parental_control.blocked_services];

      await act(async () => {
        try {
          await result.current.toggleParentalControl('service_group', {
            group: 'medsos',
            enabled: true,
          });
        } catch {}
      });

      expect(result.current.data!.parental_control.blocked_services).toEqual(original);
    });

    it('rolls back boolean toggle on failure', async () => {
      vi.mocked(fetchDashboard).mockResolvedValue(mockDashboardData);
      vi.mocked(updateParentalControl).mockRejectedValue(new Error('fail'));

      const { result } = renderHook(() => useDashboard());
      await waitFor(() => expect(result.current.loading).toBe(false));

      const original = result.current.data!.parental_control.enabled;

      await act(async () => {
        try {
          await result.current.toggleParentalControl('enabled', !original);
        } catch {}
      });

      expect(result.current.data!.parental_control.enabled).toBe(original);
    });
  });
});
