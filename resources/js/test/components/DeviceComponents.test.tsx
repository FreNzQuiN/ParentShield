import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EmptySlotCard from '../../app/components/features/devices/EmptySlotCard';
import DeviceLimitBanner from '../../app/components/features/devices/DeviceLimitBanner';

describe('EmptySlotCard', () => {
  it('renders slot number', () => {
    render(<EmptySlotCard slotNumber={3} totalSlots={5} onClick={() => {}} />);
    expect(screen.getByText('Slot 3')).toBeInTheDocument();
  });

  it('shows remaining slots', () => {
    render(<EmptySlotCard slotNumber={2} totalSlots={5} onClick={() => {}} />);
    expect(screen.getByText(/4 slot tersedia dari 5/)).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<EmptySlotCard slotNumber={1} totalSlots={5} onClick={onClick} />);
    fireEvent.click(screen.getByText('Slot 1'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe('DeviceLimitBanner', () => {
  it('renders nothing when under limit', () => {
    const { container } = render(<DeviceLimitBanner used={3} max={5} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders banner when at limit', () => {
    render(<DeviceLimitBanner used={5} max={5} />);
    expect(screen.getByText(/mencapai batas maksimal/)).toBeInTheDocument();
  });

  it('renders banner when over limit', () => {
    render(<DeviceLimitBanner used={6} max={5} />);
    expect(screen.getByText(/mencapai batas maksimal/)).toBeInTheDocument();
  });

  it('shows upgrade button as disabled', () => {
    render(<DeviceLimitBanner used={5} max={5} />);
    expect(screen.getByText('Tingkatkan Paket')).toBeDisabled();
  });
});
