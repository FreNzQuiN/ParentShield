import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RefreshBar from '../../app/components/shared/RefreshBar';

describe('RefreshBar', () => {
  it('renders refresh button with label', () => {
    render(<RefreshBar onRefresh={() => {}} isRefreshing={false} lastRefresh={null} />);
    expect(screen.getByText('Muat Ulang')).toBeInTheDocument();
  });

  it('disables refresh button when disabled', () => {
    render(<RefreshBar onRefresh={() => {}} isRefreshing={false} lastRefresh={null} disabled={true} />);
    expect(screen.getByLabelText('Muat ulang dashboard')).toBeDisabled();
  });

  it('disables refresh button when refreshing', () => {
    render(<RefreshBar onRefresh={() => {}} isRefreshing={true} lastRefresh={null} />);
    expect(screen.getByLabelText('Muat ulang dashboard')).toBeDisabled();
  });

  it('calls onRefresh when button clicked', () => {
    const onRefresh = vi.fn();
    render(<RefreshBar onRefresh={onRefresh} isRefreshing={false} lastRefresh={null} />);
    fireEvent.click(screen.getByLabelText('Muat ulang dashboard'));
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it('shows "Memuat ulang..." when refreshing', () => {
    render(<RefreshBar onRefresh={() => {}} isRefreshing={true} lastRefresh={null} />);
    expect(screen.getByText('Memuat ulang...')).toBeInTheDocument();
  });

  it('shows last refresh time', () => {
    const now = Date.now();
    const tenSecsAgo = now - 10000;
    render(<RefreshBar onRefresh={() => {}} isRefreshing={false} lastRefresh={tenSecsAgo} />);
    expect(screen.getByText(/detik lalu/)).toBeInTheDocument();
  });

  it('shows formatted time for older refresh', () => {
    const tenMinutesAgo = Date.now() - 600000;
    render(<RefreshBar onRefresh={() => {}} isRefreshing={false} lastRefresh={tenMinutesAgo} />);
    expect(screen.getByText(/10 menit lalu/)).toBeInTheDocument();
  });

  it('shows error when provided', () => {
    render(<RefreshBar onRefresh={() => {}} isRefreshing={false} lastRefresh={null} error="Some error" />);
    expect(screen.getByText('Some error')).toBeInTheDocument();
  });
});
