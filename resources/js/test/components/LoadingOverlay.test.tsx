import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoadingOverlay from '../../app/components/shared/LoadingOverlay';

describe('LoadingOverlay', () => {
  it('renders nothing when not visible', () => {
    const { container } = render(<LoadingOverlay visible={false} />);
    expect(container.querySelector('.fixed')).toBeNull();
  });

  it('renders overlay when visible', () => {
    const { container } = render(<LoadingOverlay visible={true} />);
    expect(container.querySelector('.fixed')).toBeInTheDocument();
  });
});
