import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ToggleSwitch from '../../app/components/shared/ToggleSwitch';

describe('ToggleSwitch', () => {
  it('renders inactive by default', () => {
    render(<ToggleSwitch active={false} onClick={() => {}} ariaLabel="Toggle" />);
    expect(screen.getByRole('button', { name: 'Toggle' })).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<ToggleSwitch active={false} onClick={onClick} ariaLabel="Toggle" />);
    fireEvent.click(screen.getByRole('button', { name: 'Toggle' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<ToggleSwitch active={false} onClick={() => {}} disabled={true} ariaLabel="Toggle" />);
    expect(screen.getByRole('button', { name: 'Toggle' })).toBeDisabled();
  });

  it('does not call onClick when disabled', () => {
    const onClick = vi.fn();
    render(<ToggleSwitch active={false} onClick={onClick} disabled={true} ariaLabel="Toggle" />);
    fireEvent.click(screen.getByRole('button', { name: 'Toggle' }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('applies active color when active', () => {
    const { rerender } = render(<ToggleSwitch active={false} onClick={() => {}} ariaLabel="Toggle" />);
    const btn = screen.getByRole('button', { name: 'Toggle' });
    expect(btn.className).toContain('bg-inactive');

    rerender(<ToggleSwitch active={true} onClick={() => {}} ariaLabel="Toggle" />);
    expect(btn.className).toContain('bg-success');
  });

  it('applies custom active color', () => {
    render(<ToggleSwitch active={true} onClick={() => {}} ariaLabel="Toggle" activeColor="bg-danger" />);
    expect(screen.getByRole('button', { name: 'Toggle' }).className).toContain('bg-danger');
  });
});
