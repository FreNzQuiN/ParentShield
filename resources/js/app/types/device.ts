export type SetupDeviceType = 'ANDROID' | 'IOS' | 'WINDOWS';

export interface DnsAddresses {
  dns_over_tls_url: string;
  dns_over_https_url: string;
}

export interface DeviceDetail {
  id: string;
  name: string;
  device_type: string;
  dns_addresses?: DnsAddresses;
  last_seen?: number | null;
}

export interface DeviceLimits {
  devices: {
    used: number;
    max: number;
  };
}

export interface DeviceListResponse {
  devices: DeviceDetail[];
  account_limits: DeviceLimits;
}
