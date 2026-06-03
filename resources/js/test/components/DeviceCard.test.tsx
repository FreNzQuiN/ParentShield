import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DeviceCard from '../../app/components/features/devices/DeviceCard';
import type { DeviceDetail } from '../../app/types/device';

const mockDevice: DeviceDetail = {
  id: 'dev-1',
  name: 'Pixel Phone',
  device_type: 'ANDROID',
  dns_addresses: { dns_over_tls_url: 'tls://dns.example', dns_over_https_url: 'https://dns.example' },
  last_seen: Date.now() - 60000,
};

describe('DeviceCard', () => {
  const defaultProps = {
    device: mockDevice,
    isOnline: true,
    longOffline: false,
    lastSeen: '5 menit yang lalu',
    onShowSetup: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders device name', () => {
    render(<DeviceCard {...defaultProps} />);
    expect(screen.getByText('Pixel Phone')).toBeInTheDocument();
  });

  it('renders formatted device type (Android not ANDROID)', () => {
    render(<DeviceCard {...defaultProps} />);
    expect(screen.getByText(/Android/)).toBeInTheDocument();
  });

  it('renders last seen text', () => {
    render(<DeviceCard {...defaultProps} />);
    expect(screen.getByText(/5 menit yang lalu/)).toBeInTheDocument();
  });

  it('calls onEdit when edit button clicked', async () => {
    render(<DeviceCard {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('Menu perangkat'));
    fireEvent.click(screen.getByText('Edit Nama'));
    expect(defaultProps.onEdit).toHaveBeenCalledWith(mockDevice);
  });

  it('calls onDelete when delete button clicked', async () => {
    render(<DeviceCard {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('Menu perangkat'));
    fireEvent.click(screen.getByText('Hapus'));
    expect(defaultProps.onDelete).toHaveBeenCalledWith(mockDevice);
  });

  it('shows online indicator', () => {
    const { container } = render(<DeviceCard {...defaultProps} isOnline={true} />);
    expect(container.querySelector('.bg-success')).toBeInTheDocument();
  });

  it('shows offline indicator when not online', () => {
    const { container } = render(<DeviceCard {...defaultProps} isOnline={false} lastSeen="10 jam yang lalu" />);
    expect(screen.getByText('Luring')).toBeInTheDocument();
  });
});
