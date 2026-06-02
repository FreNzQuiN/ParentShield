import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CreateDeviceForm from '../../app/components/features/devices/CreateDeviceForm';

describe('CreateDeviceForm', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders form fields', () => {
    render(<CreateDeviceForm loading={false} error={null} onSubmit={vi.fn()} />);
    expect(screen.getByLabelText('Nama Perangkat')).toBeInTheDocument();
    expect(screen.getByText('Android')).toBeInTheDocument();
    expect(screen.getByText('iOS')).toBeInTheDocument();
    expect(screen.getByText('Windows')).toBeInTheDocument();
  });

  it('submit button is disabled when name is empty', () => {
    render(<CreateDeviceForm loading={false} error={null} onSubmit={vi.fn()} />);
    const submitBtn = screen.getByRole('button', { name: /Buat Perangkat/ });
    expect(submitBtn).toBeDisabled();
  });

  it('submit button enabled when name is entered', () => {
    render(<CreateDeviceForm loading={false} error={null} onSubmit={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('Nama Perangkat'), { target: { value: 'Phone' } });
    const submitBtn = screen.getByRole('button', { name: /Buat Perangkat/ });
    expect(submitBtn).not.toBeDisabled();
  });

  it('shows type error when no type selected', () => {
    const onSubmit = vi.fn();
    render(<CreateDeviceForm loading={false} error={null} onSubmit={onSubmit} />);
    fireEvent.change(screen.getByLabelText('Nama Perangkat'), { target: { value: 'Phone' } });
    fireEvent.click(screen.getByText('Buat Perangkat'));
    expect(screen.getByText('Pilih tipe perangkat.')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit with valid data', () => {
    const onSubmit = vi.fn();
    render(<CreateDeviceForm loading={false} error={null} onSubmit={onSubmit} />);
    fireEvent.change(screen.getByLabelText('Nama Perangkat'), { target: { value: 'My Phone' } });
    fireEvent.click(screen.getByText('Android'));
    fireEvent.click(screen.getByText('Buat Perangkat'));
    expect(onSubmit).toHaveBeenCalledWith('My Phone', 'ANDROID');
  });

  it('shows loading state', () => {
    render(<CreateDeviceForm loading={true} error={null} onSubmit={vi.fn()} />);
    expect(screen.getByText('Membuat...')).toBeDisabled();
  });

  it('shows error message', () => {
    render(<CreateDeviceForm loading={false} error="Failed to create" onSubmit={vi.fn()} />);
    expect(screen.getByText('Failed to create')).toBeInTheDocument();
  });

  it('selects device type visually', () => {
    render(<CreateDeviceForm loading={false} error={null} onSubmit={vi.fn()} />);
    fireEvent.click(screen.getByText('iOS'));
    const iosButton = screen.getByText('iOS').closest('button');
    expect(iosButton?.className).toContain('border-primary');
  });
});
