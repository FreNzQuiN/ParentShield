import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Step } from '../../app/components/shared/StepList';

describe('Step', () => {
  it('renders step number', () => {
    render(<Step number={1} />);
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('renders step text when provided', () => {
    render(<Step number={2} text="Install dependencies" />);
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Install dependencies')).toBeInTheDocument();
  });

  it('renders children', () => {
    render(<Step number={3}><div data-testid="custom">Custom content</div></Step>);
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByTestId('custom')).toBeInTheDocument();
  });

  it('does not render text area when text is not provided', () => {
    const { container } = render(<Step number={1} />);
    expect(container.querySelector('p')).toBeNull();
  });
});
