import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import InlineError from '../../app/components/shared/InlineError';

describe('InlineError', () => {
  it('renders error message', () => {
    render(<InlineError message="Something went wrong" />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('renders retry button when onRetry provided', () => {
    const onRetry = vi.fn();
    render(<InlineError message="Failed" onRetry={onRetry} />);
    const button = screen.getByText('Try Again');
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('does not render retry button when onRetry not provided', () => {
    render(<InlineError message="Failed" />);
    expect(screen.queryByText('Try Again')).not.toBeInTheDocument();
  });
});
