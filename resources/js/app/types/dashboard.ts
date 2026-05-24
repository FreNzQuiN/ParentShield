export interface DashboardStats {
  total_queries: number;
  blocked_count: number;
  blocked_categories: string[];
  active_devices: number;
}

export interface TimeSeriesPoint {
  hour: number;
  allowed: number;
  blocked: number;
}

export interface TopActivity {
  domain: string;
  count: number;
  percentage: number;
}

export interface BlockedCategory {
  name: string;
  count: number;
  percentage: number;
}

export interface SafebrowsingSettings {
  safe_search_enabled: boolean;
  block_dangerous_enabled: boolean;
  block_nrd_enabled: boolean;
}

export interface DashboardDevice {
  id: string;
  name: string;
  device_type: string;
  is_online: boolean;
  last_seen: number | null;
  protection_enabled: boolean;
}

export interface AccountLimits {
  devices: {
    used: number;
    max: number;
  };
}

export interface DashboardData {
  stats: DashboardStats;
  time_series: TimeSeriesPoint[];
  top_activities: TopActivity[];
  categories_blocked: BlockedCategory[];
  safebrowsing: SafebrowsingSettings;
  devices: DashboardDevice[];
  account_limits: AccountLimits;
}
