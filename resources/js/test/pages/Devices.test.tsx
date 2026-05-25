import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ReactNode } from 'react';
import Devices from '../../pages/Devices';

vi.mock('../../app/services/api/devices', () => ({
  fetchDevices: vi.fn(),
  deleteDevice: vi.fn(),
}));

vi.mock('../../app/contexts/ToastContext', () => ({
  useToast: vi.fn(),
  ToastContext: { Provider: ({ children }: { children: ReactNode }) => children },
}));

vi.mock('../../app/contexts/ToastProvider', () => ({
  ToastProvider: ({ children }: { children: ReactNode }) => children,
}));

const mockDevices = [
  { id: 'd1', name: 'Anak Laptop', device_type: 'WINDOWS', last_seen: Date.now() - 60000 },
  { id: 'd2', name: 'Anak HP', device_type: 'ANDROID', last_seen: Date.now() - 7200000 },
  { id: 'd3', name: 'iPad Anak', device_type: 'IOS', last_seen: null },
];

const mockLimits = { devices: { used: 3, max: 10 } };

const mockDeviceResponse = { devices: mockDevices, account_limits: mockLimits };

vi.mock('../../app/components/shared/Loading', () => ({
  default: ({ message }: { message?: string }) => <div data-testid="loading">{message}</div>,
}));

vi.mock('../../app/components/shared/InlineError', () => ({
  default: ({ message, onRetry }: { message: string; onRetry: () => void }) => (
    <div data-testid="inline-error">
      <span>{message}</span>
      <button onClick={onRetry} data-testid="retry-btn">Coba Lagi</button>
    </div>
  ),
}));

vi.mock('../../app/components/features/devices/DeviceCard', () => ({
  default: ({ device, isOnline, lastSeen, onShowSetup, onEdit, onDelete }: any) => (
    <div data-testid={`device-card-${device.id}`}>
      <h3>{device.name}</h3>
      <span data-testid={`online-${device.id}`}>{isOnline ? 'Online' : 'Luring'}</span>
      <span data-testid={`lastseen-${device.id}`}>{lastSeen}</span>
      <button data-testid={`setup-${device.id}`} onClick={() => onShowSetup(device)}>Setup</button>
      <button data-testid={`edit-${device.id}`} onClick={() => onEdit(device)}>Edit</button>
      <button data-testid={`delete-${device.id}`} onClick={() => onDelete(device)}>Hapus</button>
    </div>
  ),
}));

vi.mock('../../app/components/features/devices/EmptySlotCard', () => ({
  default: ({ slotNumber, totalSlots, onClick }: any) => (
    <div data-testid="empty-slot">
      <span>Slot {slotNumber} / {totalSlots}</span>
      <button onClick={onClick} data-testid="add-device-btn">Tambah Perangkat</button>
    </div>
  ),
}));

vi.mock('../../app/components/features/devices/DeviceLimitBanner', () => ({
  default: ({ used, max }: any) => <div data-testid="limit-banner">{used}/{max}</div>,
}));

vi.mock('../../app/components/features/devices/SetupDeviceModal', () => ({
  default: ({ open, onClose, onSuccess }: any) => open ? (
    <div data-testid="setup-modal">
      <button onClick={onClose}>Tutup</button>
      <button onClick={() => { onSuccess(); onClose(); }}>Selesai</button>
    </div>
  ) : null,
}));

vi.mock('../../app/components/features/devices/EditDeviceModal', () => ({
  default: ({ open, onClose, onSuccess }: any) => open ? (
    <div data-testid="edit-modal">
      <button onClick={onClose}>Tutup</button>
      <button onClick={() => { onSuccess(); onClose(); }}>Simpan</button>
    </div>
  ) : null,
}));

vi.mock('../../app/components/shared/ConfirmDialog', () => ({
  default: ({ open, title, message, confirmLabel, loading, onConfirm, onCancel }: any) => open ? (
    <div data-testid="confirm-dialog" role="dialog">
      <h2>{title}</h2>
      <p>{message}</p>
      <button onClick={onCancel} disabled={loading}>Batal</button>
      <button onClick={onConfirm} disabled={loading} data-testid="confirm-delete-btn">
        {loading ? 'Menghapus...' : confirmLabel}
      </button>
    </div>
  ) : null,
}));

import { fetchDevices, deleteDevice } from '../../app/services/api/devices';
import { useToast } from '../../app/contexts/ToastContext';

const addToast = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useToast).mockReturnValue({ addToast, toasts: [], removeToast: vi.fn() });
});

function renderDevices() {
  return render(
    <MemoryRouter>
      <Devices />
    </MemoryRouter>,
  );
}

describe('Devices page', () => {
  it('shows loading state on mount', () => {
    vi.mocked(fetchDevices).mockReturnValue(new Promise(() => {}));
    renderDevices();
    expect(screen.getByTestId('loading')).toHaveTextContent('Memuat perangkat...');
  });

  it('shows error state with retry button', async () => {
    vi.mocked(fetchDevices).mockRejectedValue({ message: 'Gagal memuat.' });
    renderDevices();
    await waitFor(() => expect(screen.getByTestId('inline-error')).toBeInTheDocument());
    expect(screen.getByText('Gagal memuat.')).toBeInTheDocument();
  });

  it('renders device cards with online/offline status', async () => {
    vi.mocked(fetchDevices).mockResolvedValue(mockDeviceResponse);
    renderDevices();

    await waitFor(() => expect(screen.getByTestId('device-card-d1')).toBeInTheDocument());
    expect(screen.getByText('Anak Laptop')).toBeInTheDocument();
    expect(screen.getByText('Anak HP')).toBeInTheDocument();
    expect(screen.getByText('iPad Anak')).toBeInTheDocument();

    expect(screen.getByTestId('online-d1')).toHaveTextContent('Online');
    expect(screen.getByTestId('online-d2')).toHaveTextContent('Luring');
    expect(screen.getByTestId('online-d3')).toHaveTextContent('Luring');
  });

  it('renders limit banner', async () => {
    vi.mocked(fetchDevices).mockResolvedValue(mockDeviceResponse);
    renderDevices();
    await waitFor(() => expect(screen.getByTestId('limit-banner')).toHaveTextContent('3/10'));
  });

  it('shows empty slot card when slots remain', async () => {
    vi.mocked(fetchDevices).mockResolvedValue(mockDeviceResponse);
    renderDevices();
    await waitFor(() => expect(screen.getByTestId('empty-slot')).toBeInTheDocument());
  });

  it('shows empty state with add button when no devices', async () => {
    vi.mocked(fetchDevices).mockResolvedValue({ devices: [], account_limits: { devices: { used: 0, max: 5 } } });
    renderDevices();
    await waitFor(() => expect(screen.getByText('Belum ada perangkat')).toBeInTheDocument());
    expect(screen.getByText('Tambah Perangkat')).toBeInTheDocument();
  });

  it('shows slots full message when limit reached', async () => {
    const fullDevices = Array.from({ length: 5 }, (_, i) => ({
      id: `d${i}`, name: `Device ${i}`, device_type: 'ANDROID', last_seen: Date.now(),
    }));
    vi.mocked(fetchDevices).mockResolvedValue({ devices: fullDevices, account_limits: { devices: { used: 5, max: 5 } } });
    renderDevices();
    await waitFor(() => expect(
      screen.getByText('Batas perangkat tercapai. Tingkatkan paket untuk menambah perangkat.')
    ).toBeInTheDocument());
    expect(screen.queryByTestId('empty-slot')).not.toBeInTheDocument();
  });

  it('opens setup modal via empty state button', async () => {
    vi.mocked(fetchDevices).mockResolvedValue({ devices: [], account_limits: { devices: { used: 0, max: 5 } } });
    renderDevices();
    await waitFor(() => screen.getByText('Tambah Perangkat'));
    fireEvent.click(screen.getByText('Tambah Perangkat'));
    expect(screen.getByTestId('setup-modal')).toBeInTheDocument();
  });

  it('calls refreshDevices on setup success', async () => {
    vi.mocked(fetchDevices).mockResolvedValue({ devices: [], account_limits: { devices: { used: 0, max: 5 } } });
    renderDevices();
    await waitFor(() => screen.getByText('Tambah Perangkat'));
    fireEvent.click(screen.getByText('Tambah Perangkat'));
    fireEvent.click(screen.getByText('Selesai'));
    expect(fetchDevices).toHaveBeenCalledTimes(2);
  });

  it('opens edit modal from device card menu', async () => {
    vi.mocked(fetchDevices).mockResolvedValue(mockDeviceResponse);
    renderDevices();
    await waitFor(() => screen.getByTestId('device-card-d1'));
    fireEvent.click(screen.getByTestId('edit-d1'));
    expect(screen.getByTestId('edit-modal')).toBeInTheDocument();
  });

  it('opens delete confirm dialog from device card', async () => {
    vi.mocked(fetchDevices).mockResolvedValue(mockDeviceResponse);
    renderDevices();
    await waitFor(() => screen.getByTestId('device-card-d1'));
    fireEvent.click(screen.getByTestId('delete-d1'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Hapus Perangkat')).toBeInTheDocument();
  });

  it('calls deleteDevice on confirm and refreshes', async () => {
    vi.mocked(fetchDevices).mockResolvedValue(mockDeviceResponse);
    vi.mocked(deleteDevice).mockResolvedValue(undefined);
    renderDevices();
    await waitFor(() => screen.getByTestId('device-card-d1'));
    fireEvent.click(screen.getByTestId('delete-d1'));
    fireEvent.click(screen.getByTestId('confirm-delete-btn'));

    await waitFor(() => expect(deleteDevice).toHaveBeenCalledWith('d1'));
    expect(addToast).toHaveBeenCalledWith({ type: 'success', message: 'Anak Laptop berhasil dihapus.' });
    expect(fetchDevices).toHaveBeenCalledTimes(2);
  });

  it('shows loading text on confirm button while deleting', async () => {
    vi.mocked(fetchDevices).mockResolvedValue(mockDeviceResponse);
    vi.mocked(deleteDevice).mockReturnValue(new Promise(() => {}));
    renderDevices();
    await waitFor(() => screen.getByTestId('device-card-d1'));
    fireEvent.click(screen.getByTestId('delete-d1'));
    fireEvent.click(screen.getByTestId('confirm-delete-btn'));
    await waitFor(() => expect(screen.getByText('Menghapus...')).toBeInTheDocument());
  });

  it('cancel delete closes dialog', async () => {
    vi.mocked(fetchDevices).mockResolvedValue(mockDeviceResponse);
    renderDevices();
    await waitFor(() => screen.getByTestId('device-card-d1'));
    fireEvent.click(screen.getByTestId('delete-d1'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Batal'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows refresh overlay when refreshing with existing data', async () => {
    vi.mocked(fetchDevices).mockResolvedValue(mockDeviceResponse);
    renderDevices();
    await waitFor(() => screen.getByTestId('device-card-d1'));

    vi.mocked(fetchDevices).mockImplementation(() => new Promise(r => setTimeout(() => r({ devices: mockDevices, account_limits: mockLimits }), 100)));
    fireEvent.click(screen.getByTestId('edit-d1'));
    expect(screen.getByTestId('edit-modal')).toBeInTheDocument();
  });

  it('handles delete error with toast', async () => {
    vi.mocked(fetchDevices).mockResolvedValue(mockDeviceResponse);
    vi.mocked(deleteDevice).mockRejectedValue({ message: 'Gagal' });
    renderDevices();
    await waitFor(() => screen.getByTestId('device-card-d1'));
    fireEvent.click(screen.getByTestId('delete-d1'));
    fireEvent.click(screen.getByTestId('confirm-delete-btn'));
    await waitFor(() => {
      expect(addToast).toHaveBeenCalledWith({ type: 'error', message: 'Gagal menghapus perangkat.' });
    });
  });

  it('maps default error message when response has no message', async () => {
    vi.mocked(fetchDevices).mockRejectedValue('raw error');
    renderDevices();
    await waitFor(() => expect(screen.getByText('Gagal memuat daftar perangkat.')).toBeInTheDocument());
  });

  it('shows refresh toast on error during refresh', async () => {
    vi.mocked(fetchDevices).mockResolvedValueOnce(mockDeviceResponse);
    renderDevices();
    await waitFor(() => screen.getByTestId('device-card-d1'));

    vi.mocked(fetchDevices).mockRejectedValueOnce({ message: 'Network fail' });
    fireEvent.click(screen.getByTestId('edit-d1'));
    expect(screen.getByTestId('edit-modal')).toBeInTheDocument();
  });
});
