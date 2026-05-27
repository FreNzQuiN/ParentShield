import { SERVICE_GROUPS } from '../constants/serviceGroups';

export function applyServiceGroup(
  services: { id: string; enabled: boolean }[],
  group: string,
  enabled: boolean
): { id: string; enabled: boolean }[] {
  const groupServices = SERVICE_GROUPS[group]?.services ?? [];
  const updated = services.filter((s) => !groupServices.includes(s.id));
  const added = groupServices.map((id) => ({ id, enabled }));
  return [...updated, ...added];
}
