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
    const services = { anonimizer: ['vpn_go', 'tor'], game: ['steam', 'epic_games'] }[group] ?? [];
    const enabledCount = services.filter((id: string) => blocked.some((s: any) => s.id === id && s.enabled)).length;
    if (enabledCount === 0) return 'allowed';
    if (enabledCount >= services.length) return 'blocked';
    return 'partial';
  },
  getBlockedCount: (group: any, blocked: any[]) => {
    const services = { anonimizer: ['vpn_go', 'tor'], game: ['steam', 'epic_games'] }[group] ?? [];
    return services.filter((id: string) => blocked.some((s: any) => s.id === id && s.enabled)).length;
  },
  getAllowedCount: (group: any, blocked: any[]) => {
    const services = { anonimizer: ['vpn_go', 'tor'], game: ['steam', 'epic_games'] }[group] ?? [];
    return services.length - services.filter((id: string) => blocked.some((s: any) => s.id === id && s.enabled)).length;
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
        togglingGroup={null}
        onToggleGroup={vi.fn()}
        parentalControlEnabled={true}
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
        togglingGroup={null}
        onToggleGroup={onToggleGroup}
        parentalControlEnabled={true}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Anonymizers' }));
    expect(onToggleGroup).toHaveBeenCalledWith('anonimizer', true);
  });
});
