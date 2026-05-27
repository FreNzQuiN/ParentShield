export const ONLINE_THRESHOLD_MS = 300000;
export const LONG_OFFLINE_THRESHOLD_MS = 21600000;

export const PERIOD_OFFSETS: Record<string, number> = {
  '1h': 3600000,
  '12h': 43200000,
  '24h': 86400000,
  '7d': 604800000,
  '30d': 2592000000,
};

export const PAGE_FETCH_SIZE = 1000;
export const MAX_FETCH_PAGES = 3;
