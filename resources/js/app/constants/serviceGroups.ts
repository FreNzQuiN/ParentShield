import type { BlockedWebService } from '../types/dashboard';
import raw from './service-groups.json';

export interface ServiceGroupDef {
  label: string;
  services: string[];
}

const LABELS: Record<string, string> = {
  youtube: 'YouTube',
  roblox: 'Roblox',
  medsos: 'Media Sosial',
  belanja: 'Belanja',
};

export const SERVICE_GROUPS: Record<string, ServiceGroupDef> = Object.fromEntries(
  Object.entries(raw).map(([key, services]) => [
    key,
    { label: LABELS[key] ?? key, services: services as string[] },
  ])
);

export type ServiceGroupKey = keyof typeof SERVICE_GROUPS;

export function getGroupState(group: string, blockedServices: BlockedWebService[]): 'blocked' | 'partial' | 'allowed' {
  const def = SERVICE_GROUPS[group];
  if (!def) return 'allowed';

  const enabledCount = def.services.filter((id) =>
    blockedServices.some((s) => s.id === id && s.enabled)
  ).length;

  if (enabledCount === 0) return 'allowed';
  if (enabledCount >= def.services.length) return 'blocked';
  return 'partial';
}

export function isServiceInAnyGroup(serviceId: string): boolean {
  return Object.values(SERVICE_GROUPS).some((g) => g.services.includes(serviceId));
}
