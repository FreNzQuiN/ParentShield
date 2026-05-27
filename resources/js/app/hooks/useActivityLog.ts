import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { QueryLogItem, ActivityFilters } from '../types/activity';
import { fetchQueryLog, type QueryLogParams } from '../services/api/activity';
import { PERIOD_OFFSETS, PAGE_FETCH_SIZE, MAX_FETCH_PAGES } from '../constants/time';
import { getErrorMessage } from '../utils/error';

const defaultFilters: ActivityFilters = {
  search: '',
  timeFrom: null,
  timeTo: null,
  period: '1h',
  devices: [],
  statuses: [],
};

export const LIMIT_OPTIONS = [15, 25, 50, 100] as const;
export type PageLimit = typeof LIMIT_OPTIONS[number];

interface UseActivityLogResult {
  entries: QueryLogItem[];
  displayEntries: QueryLogItem[];
  totalFiltered: number;
  loading: boolean;
  error: string | null;
  lastRefresh: number | null;
  isRefreshing: boolean;
  filters: ActivityFilters;
  setFilters: (filters: ActivityFilters) => void;
  refresh: () => Promise<void>;
  goToPage: (pageNumber: number) => void;
  currentPage: number;
  totalPages: number;
  hasPrev: boolean;
  hasNext: boolean;
  limit: PageLimit;
  setLimit: (limit: number) => void;
  dataTruncated: boolean;
  coverageNewest: number | null;
  coverageOldest: number | null;
}

function matchesFilters(item: QueryLogItem, filters: ActivityFilters): boolean {
  if (filters.search) {
    const q = filters.search.toLowerCase();
    if (!item.domain.toLowerCase().includes(q)) return false;
  }
  if (filters.statuses.length > 0) {
    const status = item.filtering_info?.filtering_status;
    if (!status || !filters.statuses.includes(status)) return false;
  }
  if (filters.devices.length > 0) {
    if (!item.device_id || !filters.devices.includes(item.device_id)) return false;
  }
  if (filters.period && filters.period !== 'custom') {
    const now = Date.now();
    const timeFrom = now - (PERIOD_OFFSETS[filters.period] ?? PERIOD_OFFSETS['24h']);
    if (item.time_millis < timeFrom || item.time_millis > now) return false;
  }
  if (filters.period === 'custom' && filters.timeFrom && filters.timeTo) {
    if (item.time_millis < filters.timeFrom || item.time_millis > filters.timeTo) return false;
  }
  return true;
}

function computePeriodRange(period: ActivityFilters['period'], timeFrom: number | null, timeTo: number | null): { from: number; to: number } {
  const now = Date.now();
  if (period && period !== 'custom') {
    return { from: now - (PERIOD_OFFSETS[period] ?? PERIOD_OFFSETS['24h']), to: now };
  }
  return { from: timeFrom ?? now - PERIOD_OFFSETS['1h'], to: timeTo ?? now };
}

function mergeDedup(existing: QueryLogItem[], incoming: QueryLogItem[]): QueryLogItem[] {
  const seen = new Set(existing.map((e) => `${e.domain}|${e.time_millis}`));
  const merged = [...existing];
  for (const item of incoming) {
    const key = `${item.domain}|${item.time_millis}`;
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(item);
    }
  }
  return merged;
}

async function fetchAllPages(from: number, to: number, existing: QueryLogItem[], maxPages: number, filters?: ActivityFilters): Promise<{ items: QueryLogItem[]; truncated: boolean }> {
  let acc = [...existing];
  let cursor: string | undefined;
  let truncated = false;
  for (let i = 0; i < maxPages; i++) {
    const params: QueryLogParams = { time_from_millis: from, time_to_millis: to, limit: PAGE_FETCH_SIZE };
    if (cursor) params.cursor = cursor;
    if (filters?.devices?.length) params.devices = filters.devices;
    if (filters?.statuses?.length) params.statuses = filters.statuses;
    if (filters?.search) params.search = filters.search;
    const result = await fetchQueryLog(params);
    if (!result.items || result.items.length === 0) break;
    acc = mergeDedup(acc, result.items);
    const pages = result.pages ?? [];
    const currentIdx = pages.findIndex((p) => p.current);
    const nextPage = (currentIdx >= 0 && currentIdx + 1 < pages.length) ? pages[currentIdx + 1] : undefined;
    if (!nextPage?.page_cursor) { cursor = undefined; break; }
    cursor = nextPage.page_cursor;
    if (i === maxPages - 1 && cursor) truncated = true;
  }
  return { items: acc, truncated };
}

export function useActivityLog(): UseActivityLogResult {
  const [entries, setEntries] = useState<QueryLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<number | null>(null);
  const [filters, setFiltersState] = useState<ActivityFilters>(defaultFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimitState] = useState<PageLimit>(25);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const mountedRef = useRef(true);
  const entriesRef = useRef<QueryLogItem[]>([]);
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const filteredEntries = useMemo(() => entries.filter((e) => matchesFilters(e, filters)), [entries, filters]);
  const totalPages = Math.max(1, Math.ceil(filteredEntries.length / limit));
  const safePage = Math.min(currentPage, totalPages);
  const displayEntries = useMemo(
    () => filteredEntries.slice((safePage - 1) * limit, safePage * limit),
    [filteredEntries, safePage, limit],
  );
  const totalFiltered = filteredEntries.length;
  const hasPrev = safePage > 1;
  const hasNext = safePage < totalPages;

  const [dataTruncated, setDataTruncated] = useState(false);
  const [coverageNewest, setCoverageNewest] = useState<number | null>(null);
  const [coverageOldest, setCoverageOldest] = useState<number | null>(null);

  const fetchingRef = useRef(false);
  const filterVersionRef = useRef(0);

  const fetchPeriod = useCallback(async (period: ActivityFilters['period'], tf: number | null, tt: number | null, replace = false) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    const version = filterVersionRef.current;
    const base = replace ? [] : entriesRef.current;
    const { from, to } = computePeriodRange(period, tf, tt);
    setIsRefreshing(true);
    setError(null);
    try {
      const { items, truncated } = await fetchAllPages(from, to, base, MAX_FETCH_PAGES, filtersRef.current);
      if (mountedRef.current) {
        entriesRef.current = items;
        setEntries(items);
        setDataTruncated(truncated);
        if (items.length > 0) {
          const timestamps = items.map((e) => e.time_millis);
          setCoverageNewest(Math.max(...timestamps));
          setCoverageOldest(Math.min(...timestamps));
        }
        setLastRefresh(Date.now());
        setLoading(false);
      }
    } catch (err: unknown) {
      const msg = getErrorMessage(err, 'Gagal memuat data log.');
      if (mountedRef.current) { setError(msg); setLoading(false); }
    } finally {
      fetchingRef.current = false;
      if (filterVersionRef.current > version && mountedRef.current) {
        const f = filtersRef.current;
        fetchPeriod(f.period, f.timeFrom, f.timeTo, true);
        return;
      }
      if (mountedRef.current) setIsRefreshing(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    if (!mountedRef.current) return;
    const f = filtersRef.current;
    entriesRef.current = [];
    setCurrentPage(1);
    await fetchPeriod(f.period, f.timeFrom, f.timeTo);
  }, [fetchPeriod]);

  const setFilters = useCallback((newFilters: ActivityFilters) => {
    filterVersionRef.current++;
    setFiltersState(newFilters);
    filtersRef.current = newFilters;
    setDataTruncated(false);
    if (newFilters.period === 'custom' && newFilters.timeFrom !== null && newFilters.timeTo !== null) {
      fetchPeriod(newFilters.period, newFilters.timeFrom, newFilters.timeTo, true);
    } else if (newFilters.period !== 'custom') {
      fetchPeriod(newFilters.period, newFilters.timeFrom, newFilters.timeTo, true);
    }
  }, [fetchPeriod]);

  const goToPage = useCallback((pageNumber: number) => {
    setCurrentPage(Math.max(1, Math.min(pageNumber, totalPages)));
  }, [totalPages]);

  const setLimit = useCallback((newLimit: number) => {
    const clamped = ((LIMIT_OPTIONS as readonly number[]).includes(newLimit) ? newLimit : 25) as PageLimit;
    setLimitState(clamped);
    setCurrentPage(1);
  }, []);

  useEffect(() => {
    refresh();
    return () => { mountedRef.current = false; };
  }, [refresh]);

  return { entries, displayEntries, totalFiltered, loading, error, lastRefresh, isRefreshing, filters, setFilters, refresh, goToPage, currentPage: safePage, totalPages, hasPrev, hasNext, limit, setLimit, dataTruncated, coverageNewest, coverageOldest };
}