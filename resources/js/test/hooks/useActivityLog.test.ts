import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useActivityLog } from '../../app/hooks/useActivityLog';
import type { QueryLogItem } from '../../app/types/activity';

const allItems: QueryLogItem[] = [
  { domain: 'google.com', time_millis: Date.now() - 60000, device_id: 'dev1' },
  { domain: 'youtube.com', time_millis: Date.now() - 300000, device_id: 'dev1' },
  { domain: 'ads.example.com', time_millis: Date.now() - 120000, device_id: 'dev2', filtering_info: { filtering_status: 'REQUEST_BLOCKED' } },
  { domain: 'tracker.net', time_millis: Date.now() - 1800000, device_id: 'dev2', filtering_info: { filtering_status: 'REQUEST_BLOCKED' } },
  { domain: 'cdn.site.com', time_millis: Date.now() - 2400000, filtering_info: { filtering_status: 'REQUEST_ALLOWED' } },
];

vi.mock('../../app/services/api/activity', () => ({
  fetchQueryLog: vi.fn(),
}));

import { fetchQueryLog } from '../../app/services/api/activity';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useActivityLog', () => {
  describe('initial state and refresh', () => {
    it('starts with loading=true and empty entries, then fetches', async () => {
      vi.mocked(fetchQueryLog).mockResolvedValue({ items: allItems });

      const { result } = renderHook(() => useActivityLog());

      expect(result.current.loading).toBe(true);
      expect(result.current.entries).toEqual([]);

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.entries).toHaveLength(5);
      expect(result.current.totalFiltered).toBe(5);
      expect(result.current.currentPage).toBe(1);
      expect(result.current.error).toBeNull();
    });

    it('sets error on fetch failure', async () => {
      vi.mocked(fetchQueryLog).mockRejectedValue({ message: 'Gagal memuat data.' });

      const { result } = renderHook(() => useActivityLog());

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.error).toBe('Gagal memuat data.');
      expect(result.current.entries).toEqual([]);
    });
  });

  describe('client-side filtering', () => {
    it('filters by search domain', async () => {
      vi.mocked(fetchQueryLog).mockResolvedValue({ items: allItems });
      const { result } = renderHook(() => useActivityLog());
      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.setFilters({ search: 'google', timeFrom: null, timeTo: null, period: '24h', devices: [], statuses: [] });
      });

      expect(fetchQueryLog).toHaveBeenLastCalledWith(
        expect.objectContaining({ search: 'google' })
      );
      expect(result.current.displayEntries).toHaveLength(1);
      expect(result.current.displayEntries[0].domain).toBe('google.com');
    });

    it('filters by status blocked', async () => {
      vi.mocked(fetchQueryLog).mockResolvedValue({ items: allItems });
      const { result } = renderHook(() => useActivityLog());
      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.setFilters({ search: '', timeFrom: null, timeTo: null, period: '24h', devices: [], statuses: ['REQUEST_BLOCKED'] });
      });

      expect(fetchQueryLog).toHaveBeenLastCalledWith(
        expect.objectContaining({ statuses: ['REQUEST_BLOCKED'] })
      );
      expect(result.current.displayEntries).toHaveLength(2);
      expect(result.current.displayEntries.every((e) => e.filtering_info?.filtering_status === 'REQUEST_BLOCKED')).toBe(true);
    });

    it('filters by device', async () => {
      vi.mocked(fetchQueryLog).mockResolvedValue({ items: allItems });
      const { result } = renderHook(() => useActivityLog());
      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.setFilters({ search: '', timeFrom: null, timeTo: null, period: '24h', devices: ['dev1'], statuses: [] });
      });

      expect(fetchQueryLog).toHaveBeenLastCalledWith(
        expect.objectContaining({ devices: ['dev1'] })
      );
      const dev1Ids = result.current.displayEntries.map((e) => e.device_id);
      expect(dev1Ids.every((id) => id === 'dev1')).toBe(true);
    });

    it('filters by period', async () => {
      const oldItem: QueryLogItem = { domain: 'old.com', time_millis: Date.now() - 86400000 * 10, device_id: 'dev1' };
      vi.mocked(fetchQueryLog).mockResolvedValue({ items: [...allItems, oldItem] });
      const { result } = renderHook(() => useActivityLog());
      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.setFilters({ search: '', timeFrom: null, timeTo: null, period: '24h', devices: [], statuses: [] });
      });

      expect(result.current.displayEntries.every((e) => e.time_millis >= Date.now() - 86400000)).toBe(true);
    });

    it('setFilters resets to page 1', async () => {
      const manyItems = Array.from({ length: 30 }, (_, i) => ({
        domain: `site${i}.com`, time_millis: Date.now() - i * 60000, device_id: 'dev1',
      })) as QueryLogItem[];
      vi.mocked(fetchQueryLog).mockResolvedValue({ items: manyItems });
      const { result } = renderHook(() => useActivityLog());
      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => { result.current.goToPage(2); });
      expect(result.current.currentPage).toBe(2);

      act(() => {
        result.current.setFilters({ search: 'site0', timeFrom: null, timeTo: null, period: '24h', devices: [], statuses: [] });
      });

      expect(result.current.currentPage).toBe(1);
    });
  });

  describe('client-side pagination', () => {
    it('paginates displayEntries by limit', async () => {
      vi.mocked(fetchQueryLog).mockResolvedValue({ items: allItems });
      const { result } = renderHook(() => useActivityLog());
      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.totalPages).toBe(1);
      expect(result.current.displayEntries).toHaveLength(5);
    });

    it('goToPage navigates client-side', async () => {
      const manyItems = Array.from({ length: 30 }, (_, i) => ({
        domain: `site${i}.com`, time_millis: Date.now() - i * 60000, device_id: 'dev1',
      })) as QueryLogItem[];
      vi.mocked(fetchQueryLog).mockResolvedValue({ items: manyItems });
      const { result } = renderHook(() => useActivityLog());
      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.totalPages).toBe(2);
      expect(result.current.displayEntries).toHaveLength(25);

      act(() => { result.current.goToPage(2); });
      expect(result.current.currentPage).toBe(2);
      expect(result.current.displayEntries).toHaveLength(5);
      expect(result.current.hasPrev).toBe(true);
      expect(result.current.hasNext).toBe(false);
    });
  });

  describe('limit', () => {
    it('defaults to 25', async () => {
      vi.mocked(fetchQueryLog).mockResolvedValue({ items: allItems });
      const { result } = renderHook(() => useActivityLog());
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.limit).toBe(25);
    });

    it('setLimit changes page size and recalculates pagination', async () => {
      const manyItems = Array.from({ length: 30 }, (_, i) => ({
        domain: `site${i}.com`, time_millis: Date.now() - i * 60000, device_id: 'dev1',
      })) as QueryLogItem[];
      vi.mocked(fetchQueryLog).mockResolvedValue({ items: manyItems });
      const { result } = renderHook(() => useActivityLog());
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.setLimit(15);
      });

      expect(result.current.limit).toBe(15);
      expect(result.current.totalPages).toBe(2);
      expect(result.current.displayEntries).toHaveLength(15);
    });
  });
});