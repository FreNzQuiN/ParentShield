import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Loading from '../../app/components/shared/Loading';

describe('Loading', () => {
  it('renders with default message', () => {
    render(<Loading />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders custom message', () => {
    render(<Loading message="Fetching data..." />);
    expect(screen.getByText('Fetching data...')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Loading className="py-10" />);
    expect(screen.getByRole('status')).toHaveClass('py-10');
  });
});
