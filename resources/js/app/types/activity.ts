export type FilteringActionStatus = 'UNKNOWN' | 'NONE' | 'REQUEST_BLOCKED' | 'RESPONSE_BLOCKED' | 'REQUEST_ALLOWED' | 'RESPONSE_ALLOWED' | 'MODIFIED';

export interface FilteringInfo {
  blocked_service_id?: string;
  filter_id?: string;
  filter_rule?: string;
  filtering_category_id?: string;
  filtering_status?: FilteringActionStatus;
  filtering_type?: string;
}

export interface QueryLogItem {
  domain: string;
  time_millis: number;
  time_iso?: string;
  device_id?: string;
  client_country?: string;
  company_id?: string;
  dns_request_type?: string;
  dns_response_type?: string;
  dns_proto_type?: { value: number };
  category_type?: string;
  filtering_info?: FilteringInfo;
  dnssec?: boolean;
  asn?: number;
  network?: string;
}

export interface LogPage {
  current: boolean;
  page_cursor: string;
  page_number: number;
}

export interface QueryLogResponse {
  items: QueryLogItem[];
  pages?: LogPage[];
}

export type CategoryType = 'ADULT' | 'ANONYMIZERS' | 'GAMES' | 'MEDIA' | 'MESSENGERS' | 'NEWS' | 'SEARCH_ENGINES' | 'SHOPPING' | 'VIDEO' | string;

export interface ActivityFilters {
  search: string;
  timeFrom: number | null;
  timeTo: number | null;
  period: '1h' | '12h' | '24h' | '7d' | '30d' | 'custom' | null;
  devices: string[];
  statuses: FilteringActionStatus[];
}
