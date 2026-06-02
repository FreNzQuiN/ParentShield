import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ServiceBlocklistByCategory from '../../app/components/features/parentalControl/ServiceBlocklistByCategory';

vi.mock('../../app/constants/serviceGroups', () => ({
  SERVICE_GROUPS: {
    anonimizer: { label: 'Anonymizers', services: ['vpn_go', 'tor'] },
    game: { label: 'Game', services: ['steam', 'epic_games'] },
  },
  DASHBOARD_GROUPS: [
    { key: 'anonimizer', label: 'Anonymizers', services: ['vpn_go', 'tor'] },
    { key: 'game', label: 'Game', services: ['steam', 'epic_games'] },
  ],
  getGroupState: (group: any, blocked: any[]) => {
    const services = group?.services ?? { anonimizer: ['vpn_go', 'tor'], game: ['steam', 'epic_games'] }[group] ?? [];
    const enabledCount = services.filter((id: string) => blocked.some((s: any) => s.id === id && s.enabled)).length;
    if (enabledCount === 0) return 'allowed';
    if (enabledCount >= services.length) return 'blocked';
    return 'partial';
  },
  getBlockedCount: (group: any, blocked: any[]) => {
    const services = group?.services ?? { anonimizer: ['vpn_go', 'tor'], game: ['steam', 'epic_games'] }[group] ?? [];
    return services.filter((id: string) => blocked.some((s: any) => s.id === id && s.enabled)).length;
  },
  getAllowedCount: (group: any, blocked: any[]) => {
    const services = group?.services ?? { anonimizer: ['vpn_go', 'tor'], game: ['steam', 'epic_games'] }[group] ?? [];
    return services.length - services.filter((id: string) => blocked.some((s: any) => s.id === id && s.enabled)).length;
  },
  getDynamicLainnyaIds: (allIds: string[]) => {
    const otherIds = new Set(['vpn_go', 'tor', 'steam', 'epic_games']);
    return allIds.filter((id: string) => !otherIds.has(id));
  },
}));

import ServiceBlocklistByCategoryImpl from '../../app/components/features/parentalControl/ServiceBlocklistByCategory';

describe('ServiceBlocklistByCategory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders group labels', () => {
    render(
      <ServiceBlocklistByCategoryImpl
        blockedServices={[]}
        onToggleGroup={vi.fn()}
        parentalControlEnabled={true}
        services={[]}
      />,
    );
    expect(screen.getByText('Anonymizers')).toBeInTheDocument();
    expect(screen.getByText('Game')).toBeInTheDocument();
  });

  it('calls onToggleGroup when toggle button clicked', async () => {
    const onToggleGroup = vi.fn().mockResolvedValue(undefined);
    render(
      <ServiceBlocklistByCategoryImpl
        blockedServices={[]}
        onToggleGroup={onToggleGroup}
        parentalControlEnabled={true}
        services={[]}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Anonymizers' }));
    expect(onToggleGroup).toHaveBeenCalledWith('anonimizer', true);
  });
});
