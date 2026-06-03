import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ConfirmDialog from '../../app/components/shared/ConfirmDialog';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ConfirmDialog', () => {
  it('renders nothing when closed', () => {
    render(<ConfirmDialog open={false} title="Confirm" message="Are you sure?" onConfirm={() => {}} onCancel={() => {}} />);
    expect(screen.queryByText('Confirm')).not.toBeInTheDocument();
  });

  it('renders title and message when open', () => {
    render(<ConfirmDialog open={true} title="Delete Item" message="This cannot be undone." onConfirm={() => {}} onCancel={() => {}} />);
    expect(screen.getByText('Delete Item')).toBeInTheDocument();
    expect(screen.getByText('This cannot be undone.')).toBeInTheDocument();
  });

  it('renders custom button labels', () => {
    render(<ConfirmDialog open={true} title="Confirm" message="Sure?" confirmLabel="Yes, do it" cancelLabel="Nope" onConfirm={() => {}} onCancel={() => {}} />);
    expect(screen.getByText('Yes, do it')).toBeInTheDocument();
    expect(screen.getByText('Nope')).toBeInTheDocument();
  });

  it('calls onConfirm when confirm button clicked', () => {
    const onConfirm = vi.fn();
    render(<ConfirmDialog open={true} title="Confirm" message="Sure?" onConfirm={onConfirm} onCancel={() => {}} />);
    fireEvent.click(screen.getByText('Hapus'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when cancel button clicked', () => {
    const onCancel = vi.fn();
    render(<ConfirmDialog open={true} title="Confirm" message="Sure?" onConfirm={() => {}} onCancel={onCancel} />);
    fireEvent.click(screen.getByText('Batal'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('disables buttons when loading', () => {
    render(<ConfirmDialog open={true} title="Confirm" message="Sure?" onConfirm={() => {}} onCancel={() => {}} loading={true} />);
    expect(screen.getByText('Hapus...')).toBeDisabled();
    expect(screen.getByText('Batal')).toBeDisabled();
  });

  it('calls onCancel when overlay clicked', () => {
    const onCancel = vi.fn();
    const { container } = render(<ConfirmDialog open={true} title="Confirm" message="Sure?" onConfirm={() => {}} onCancel={onCancel} />);
    const overlay = container.querySelector('.fixed.inset-0');
    fireEvent.click(overlay!);
    expect(onCancel).toHaveBeenCalled();
  });
});
