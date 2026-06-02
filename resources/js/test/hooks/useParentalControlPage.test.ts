import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useParentalControlPage } from '../../app/hooks/useParentalControlPage';
import type { DashboardData, WebServiceInfo } from '../../app/types/dashboard';

const mockDashboardData: DashboardData = {
  stats: { total_queries: 100, blocked_count: 20, blocked_categories: [], active_devices: 3, suspicious_devices: 0 },
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

const mockServices: WebServiceInfo[] = [
  { id: '9gag', name: '9GAG', icon_svg: '<svg></svg>' },
  { id: 'tiktok', name: 'TikTok', icon_svg: '<svg></svg>' },
];

vi.mock('../../app/services/api/dashboard', () => ({
  fetchDashboard: vi.fn(),
  fetchServices: vi.fn(),
  updateParentalControl: vi.fn(),
}));

import { fetchDashboard, fetchServices, updateParentalControl } from '../../app/services/api/dashboard';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useParentalControlPage', () => {
  describe('initial load', () => {
    it('starts with loading=true and loads settings + services', async () => {
      vi.mocked(fetchDashboard).mockResolvedValue(mockDashboardData);
      vi.mocked(fetchServices).mockResolvedValue(mockServices);

      const { result } = renderHook(() => useParentalControlPage());

      expect(result.current.loading).toBe(true);
      expect(result.current.settings).toBeNull();

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.settings).toEqual(mockDashboardData.parental_control);
      expect(result.current.services).toEqual(mockServices);
      expect(result.current.error).toBeNull();
    });

    it('sets error on fetch failure', async () => {
      vi.mocked(fetchDashboard).mockRejectedValue({ message: 'Gagal memuat data.' });

      const { result } = renderHook(() => useParentalControlPage());

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.error).toBe('Gagal memuat data.');
      expect(result.current.settings).toBeNull();
    });
  });

  describe('toggleSetting', () => {
    it('optimistically updates setting and reverts on failure', async () => {
      vi.mocked(fetchDashboard).mockResolvedValue(mockDashboardData);
      vi.mocked(fetchServices).mockResolvedValue(mockServices);
      vi.mocked(updateParentalControl).mockRejectedValue(new Error('fail'));

      const { result } = renderHook(() => useParentalControlPage());
      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.settings!.enabled).toBe(true);

      await act(async () => {
        try {
          await result.current.toggleSetting('enabled');
        } catch {}
      });

      expect(result.current.settings!.enabled).toBe(true);
    });

    it('keeps optimistic update on success', async () => {
      vi.mocked(fetchDashboard).mockResolvedValue(mockDashboardData);
      vi.mocked(fetchServices).mockResolvedValue(mockServices);
      vi.mocked(updateParentalControl).mockResolvedValue(undefined);

      const { result } = renderHook(() => useParentalControlPage());
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.toggleSetting('block_adult_websites_enabled');
      });

      expect(result.current.settings!.block_adult_websites_enabled).toBe(false);
    });

    it('uses explicit value parameter when provided', async () => {
      vi.mocked(fetchDashboard).mockResolvedValue(mockDashboardData);
      vi.mocked(fetchServices).mockResolvedValue(mockServices);
      vi.mocked(updateParentalControl).mockResolvedValue(undefined);

      const { result } = renderHook(() => useParentalControlPage());
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.toggleSetting('enabled', false);
      });

      expect(result.current.settings!.enabled).toBe(false);
    });
  });

  describe('toggleServiceGroup', () => {
    it('optimistically updates group and reverts on failure', async () => {
      vi.mocked(fetchDashboard).mockResolvedValue(mockDashboardData);
      vi.mocked(fetchServices).mockResolvedValue(mockServices);
      vi.mocked(updateParentalControl).mockRejectedValue(new Error('fail'));

      const { result } = renderHook(() => useParentalControlPage());
      await waitFor(() => expect(result.current.loading).toBe(false));

      const original = [...result.current.settings!.blocked_services];

      await act(async () => {
        try {
          await result.current.toggleServiceGroup('social', true);
        } catch {}
      });

      expect(result.current.settings!.blocked_services).toEqual(original);
    });
  });

  describe('toggleService', () => {
    it('optimistically toggles service and reverts on failure', async () => {
      vi.mocked(fetchDashboard).mockResolvedValue(mockDashboardData);
      vi.mocked(fetchServices).mockResolvedValue(mockServices);
      vi.mocked(updateParentalControl).mockRejectedValue(new Error('fail'));

      const { result } = renderHook(() => useParentalControlPage());
      await waitFor(() => expect(result.current.loading).toBe(false));

      const original = [...result.current.settings!.blocked_services];

      await act(async () => {
        try {
          await result.current.toggleService('9gag', false);
        } catch {}
      });

      expect(result.current.settings!.blocked_services).toEqual(original);
    });

    it('adds new service entry on success', async () => {
      vi.mocked(fetchDashboard).mockResolvedValue(mockDashboardData);
      vi.mocked(fetchServices).mockResolvedValue(mockServices);
      vi.mocked(updateParentalControl).mockResolvedValue(undefined);

      const { result } = renderHook(() => useParentalControlPage());
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.toggleService('youtube', true);
      });

      const youtubeService = result.current.settings!.blocked_services.find(s => s.id === 'youtube');
      expect(youtubeService).toEqual({ id: 'youtube', enabled: true });
    });
  });
});
