import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { ToastProvider } from '../../app/contexts/ToastProvider';
import { useToast } from '../../app/contexts/ToastContext';
import ToastContainer from '../../app/components/shared/Toast';

function TestComponent() {
  const { addToast } = useToast();
  return (
    <div>
      <button onClick={() => addToast({ type: 'success', message: 'It worked!' })}>Success</button>
      <button onClick={() => addToast({ type: 'error', message: 'Failed!' })}>Error</button>
    </div>
  );
}

function renderWithToast() {
  return render(
    <ToastProvider>
      <TestComponent />
      <ToastContainer />
    </ToastProvider>,
  );
}

describe('ToastProvider + ToastContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders children', () => {
    render(
      <ToastProvider>
        <div>Child content</div>
      </ToastProvider>,
    );
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('shows success toast on addToast', () => {
    renderWithToast();
    act(() => {
      screen.getByText('Success').click();
    });
    expect(screen.getByText('It worked!')).toBeInTheDocument();
  });

  it('shows error toast', () => {
    renderWithToast();
    act(() => {
      screen.getByText('Error').click();
    });
    expect(screen.getByText('Failed!')).toBeInTheDocument();
  });

  it('auto-dismisses toast after timeout', () => {
    renderWithToast();
    act(() => {
      screen.getByText('Success').click();
    });
    expect(screen.getByText('It worked!')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(screen.queryByText('It worked!')).not.toBeInTheDocument();
  });
});
