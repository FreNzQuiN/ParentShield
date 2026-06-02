import type { BlockedWebService } from '../types/dashboard';
import raw from './service-groups.json';

export interface ServiceGroupDef {
  label: string;
  services: string[];
}

const LABELS: Record<string, string> = {
  konten_dewasa: 'Konten Dewasa',
  anonimizer: 'Anonymizers, VPN & Proxy',
  game: 'Game',
  media_berita: 'Media Berita',
  media_sosial: 'Media Sosial',
  keuangan: 'Keuangan & E-Wallet',
  mesin_cari: 'Mesin Pencari',
  toko_online: 'Toko Online',
  video: 'Video',
  lainnya: 'Lainnya',
};

export const SERVICE_GROUPS: Record<string, ServiceGroupDef> = Object.fromEntries(
  Object.entries(raw).map(([key, services]) => [
    key,
    { label: LABELS[key] ?? key, services: services as string[] },
  ])
);

export type ServiceGroupKey = keyof typeof SERVICE_GROUPS;

export interface DashboardGroupDef {
  key: string;
  label: string;
  services: string[];
}

export const DASHBOARD_GROUPS: DashboardGroupDef[] = [
  { key: 'anonimizer', label: 'Anonymizers', services: SERVICE_GROUPS.anonimizer?.services ?? [] },
  { key: 'game', label: 'Game', services: SERVICE_GROUPS.game?.services ?? [] },
  { key: 'media_sosial', label: 'Media Sosial', services: SERVICE_GROUPS.media_sosial?.services ?? [] },
  {
    key: 'belanja_keuangan',
    label: 'Belanja Online & E-Wallet',
    services: [
      ...(SERVICE_GROUPS.toko_online?.services ?? []),
      ...(SERVICE_GROUPS.keuangan?.services ?? []),
    ],
  },
];

export function getGroupState(group: string | DashboardGroupDef, blockedServices: BlockedWebService[]): 'blocked' | 'partial' | 'allowed' {
  const services = typeof group === 'string' ? (SERVICE_GROUPS[group]?.services ?? []) : group.services;
  if (!services.length) return 'allowed';

  const enabledCount = services.filter((id) =>
    blockedServices.some((s) => s.id === id && s.enabled)
  ).length;

  if (enabledCount === 0) return 'allowed';
  if (enabledCount >= services.length) return 'blocked';
  return 'partial';
}

export function getBlockedCount(group: string | DashboardGroupDef, blockedServices: BlockedWebService[]): number {
  const services = typeof group === 'string' ? (SERVICE_GROUPS[group]?.services ?? []) : group.services;
  return services.filter((id) =>
    blockedServices.some((s) => s.id === id && s.enabled)
  ).length;
}

export function getAllowedCount(group: string | DashboardGroupDef, blockedServices: BlockedWebService[]): number {
  const services = typeof group === 'string' ? (SERVICE_GROUPS[group]?.services ?? []) : group.services;
  return services.length - getBlockedCount(group, blockedServices);
}

export function getGroupForService(serviceId: string): string | null {
  for (const def of Object.values(SERVICE_GROUPS)) {
    if (def.services.includes(serviceId)) return def.label;
  }
  return null;
}


