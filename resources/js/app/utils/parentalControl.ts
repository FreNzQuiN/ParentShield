import { SERVICE_GROUPS, getDynamicLainnyaIds } from '../constants/serviceGroups';

export function applyServiceGroup(
  services: { id: string; enabled: boolean }[],
  group: string,
  enabled: boolean,
  allServices: { id: string }[] = []
): { id: string; enabled: boolean }[] {
  const groupServices = group === 'lainnya'
    ? getDynamicLainnyaIds(allServices.map(s => s.id))
    : (SERVICE_GROUPS[group]?.services ?? []);
  const updated = services.filter((s) => !groupServices.includes(s.id));
  const added = groupServices.map((id) => ({ id, enabled }));
  return [...updated, ...added];
}