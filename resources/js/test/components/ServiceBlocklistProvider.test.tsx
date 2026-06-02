import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ServiceBlocklistProvider from '../../app/components/features/parentalControl/ServiceBlocklistProvider';
import type { WebServiceInfo } from '../../app/types/dashboard';

vi.mock('../../app/constants/serviceGroups', () => ({
  getGroupForService: (id: string) => {
    const map: Record<string, string> = { '9gag': 'Media Sosial', 'tiktok': 'Media Sosial' };
    return map[id] ?? null;
  },
}));

const mockServices: WebServiceInfo[] = [
  { id: '9gag', name: '9GAG', icon_svg: '<svg><circle r="10"/></svg>' },
  { id: 'tiktok', name: 'TikTok', icon_svg: '<svg><rect width="10" height="10"/></svg>' },
];

describe('ServiceBlocklistProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders service names', () => {
    render(
      <ServiceBlocklistProvider
        blockedServices={[]}
        services={mockServices}
        isToggling={null}
        onToggleService={vi.fn()}
        parentalControlEnabled={true}
      />,
    );
    expect(screen.getByText('9GAG')).toBeInTheDocument();
    expect(screen.getByText('TikTok')).toBeInTheDocument();
  });

  it('renders icons via dangerouslySetInnerHTML', () => {
    const { container } = render(
      <ServiceBlocklistProvider
        blockedServices={[]}
        services={mockServices}
        isToggling={null}
        onToggleService={vi.fn()}
        parentalControlEnabled={true}
      />,
    );
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('calls onToggleService when toggle button clicked', async () => {
    const onToggleService = vi.fn().mockResolvedValue(undefined);
    render(
      <ServiceBlocklistProvider
        blockedServices={[]}
        services={mockServices}
        isToggling={null}
        onToggleService={onToggleService}
        parentalControlEnabled={true}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: '9GAG' }));
    expect(onToggleService).toHaveBeenCalledWith('9gag', true);
  });

  it('disables toggles when isToggling', () => {
    render(
      <ServiceBlocklistProvider
        blockedServices={[]}
        services={mockServices}
        isToggling="some-key"
        onToggleService={vi.fn()}
        parentalControlEnabled={true}
      />,
    );
    expect(screen.getByRole('button', { name: '9GAG' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'TikTok' })).toBeDisabled();
  });

  it('disables toggles when parental control disabled', () => {
    render(
      <ServiceBlocklistProvider
        blockedServices={[]}
        services={mockServices}
        isToggling={null}
        onToggleService={vi.fn()}
        parentalControlEnabled={false}
      />,
    );
    expect(screen.getByRole('button', { name: '9GAG' })).toBeDisabled();
  });

  it('filters services by search', () => {
    render(
      <ServiceBlocklistProvider
        blockedServices={[]}
        services={mockServices}
        isToggling={null}
        onToggleService={vi.fn()}
        parentalControlEnabled={true}
      />,
    );
    fireEvent.change(screen.getByPlaceholderText('Cari layanan...'), { target: { value: '9gag' } });
    expect(screen.getByText('9GAG')).toBeInTheDocument();
    expect(screen.queryByText('TikTok')).not.toBeInTheDocument();
  });
});
