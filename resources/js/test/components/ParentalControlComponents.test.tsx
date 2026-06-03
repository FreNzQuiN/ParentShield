import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ParentalControlSidebar from '../../app/components/features/parentalControl/ParentalControlSidebar';
import ParentalControlSkeleton from '../../app/components/features/parentalControl/ParentalControlSkeleton';

describe('ParentalControlSidebar', () => {
  const mockSettings = {
    enabled: true,
    block_adult_websites_enabled: true,
    engines_safe_search_enabled: false,
    youtube_safe_search_enabled: false,
    blocked_services: [],
  };

  beforeEach(() => { vi.clearAllMocks(); });

  it('renders all toggle labels', () => {
    render(
      <ParentalControlSidebar
        settings={mockSettings}
        onToggleSetting={vi.fn()}
      />,
    );
    expect(screen.getAllByText('Kontrol Orang Tua').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Blokir Konten Dewasa')).toBeInTheDocument();
    expect(screen.getByText('Pencarian Aman')).toBeInTheDocument();
    expect(screen.getByText('YouTube Mode Terbatas')).toBeInTheDocument();
  });

  it('calls onToggleSetting when toggle clicked', async () => {
    const onToggle = vi.fn().mockResolvedValue(undefined);
    render(
      <ParentalControlSidebar
        settings={mockSettings}
        onToggleSetting={onToggle}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Kontrol Orang Tua' }));
    expect(onToggle).toHaveBeenCalledWith('enabled');
  });

  it('disables non-master toggles when parental control disabled', () => {
    const disabledSettings = { ...mockSettings, enabled: false };
    render(
      <ParentalControlSidebar
        settings={disabledSettings}
        onToggleSetting={vi.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: 'Blokir Konten Dewasa' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Pencarian Aman' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'YouTube Mode Terbatas' })).toBeDisabled();
  });

  it('master toggle remains enabled even when parental control disabled', () => {
    const disabledSettings = { ...mockSettings, enabled: false };
    render(
      <ParentalControlSidebar
        settings={disabledSettings}
        onToggleSetting={vi.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: 'Kontrol Orang Tua' })).not.toBeDisabled();
  });
});

describe('ParentalControlSkeleton', () => {
  it('renders skeleton bars', () => {
    const { container } = render(<ParentalControlSkeleton />);
    const skeletonBars = container.querySelectorAll('.animate-pulse');
    expect(skeletonBars.length).toBeGreaterThan(0);
  });
});
