import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Modal from '../../app/components/shared/Modal';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Modal', () => {
  it('renders nothing when closed', () => {
    render(<Modal open={false} onClose={() => {}} title="My Modal">Content</Modal>);
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });

  it('renders title and content when open', () => {
    render(<Modal open={true} onClose={() => {}} title="My Modal">Modal Content</Modal>);
    expect(screen.getByText('My Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal Content')).toBeInTheDocument();
  });

  it('calls onClose when close button clicked', () => {
    const onClose = vi.fn();
    render(<Modal open={true} onClose={onClose} title="Modal">Content</Modal>);
    fireEvent.click(screen.getByLabelText('Tutup'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when overlay clicked', () => {
    const onClose = vi.fn();
    const { container } = render(<Modal open={true} onClose={onClose} title="Modal">Content</Modal>);
    const overlay = container.querySelector('.fixed.inset-0');
    fireEvent.click(overlay!);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when content clicked', () => {
    const onClose = vi.fn();
    render(<Modal open={true} onClose={onClose} title="Modal"><div data-testid="inner">Inner</div></Modal>);
    fireEvent.click(screen.getByTestId('inner'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('applies lg size class when size=lg', () => {
    render(<Modal open={true} onClose={() => {}} title="Modal" size="lg">Content</Modal>);
    const dialog = screen.getByRole('dialog');
    expect(dialog.className).toContain('max-w-2xl');
  });

  it('applies md size class by default', () => {
    render(<Modal open={true} onClose={() => {}} title="Modal">Content</Modal>);
    const dialog = screen.getByRole('dialog');
    expect(dialog.className).toContain('max-w-lg');
  });
});
