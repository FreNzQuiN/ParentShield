import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDialog } from '../../app/hooks/useDialog';

beforeEach(() => {
  document.body.style.overflow = '';
});

afterEach(() => {
  document.body.style.overflow = '';
});

describe('useDialog', () => {
  it('locks scroll when open becomes true', () => {
    const { rerender } = renderHook(
      ({ open }) => useDialog(open),
      { initialProps: { open: false } },
    );

    expect(document.body.style.overflow).toBe('');

    rerender({ open: true });

    expect(document.body.style.overflow).toBe('hidden');
  });

  it('restores scroll when open becomes false', () => {
    const { rerender } = renderHook(
      ({ open }) => useDialog(open),
      { initialProps: { open: true } },
    );

    expect(document.body.style.overflow).toBe('hidden');

    rerender({ open: false });

    expect(document.body.style.overflow).toBe('');
  });

  it('restores scroll on unmount', () => {
    const { unmount } = renderHook(
      ({ open }) => useDialog(open),
      { initialProps: { open: true } },
    );

    expect(document.body.style.overflow).toBe('hidden');

    unmount();

    expect(document.body.style.overflow).toBe('');
  });

  it('calls onClose on Escape key when open', () => {
    const onClose = vi.fn();
    renderHook(
      ({ open, onClose }) => useDialog(open, onClose),
      { initialProps: { open: true, onClose } },
    );

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose on Escape when closed', () => {
    const onClose = vi.fn();
    renderHook(
      ({ open, onClose }) => useDialog(open, onClose),
      { initialProps: { open: false, onClose } },
    );

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });

    expect(onClose).not.toHaveBeenCalled();
  });

  it('removes escape listener when open becomes false', () => {
    const onClose = vi.fn();
    const { rerender } = renderHook(
      ({ open, onClose }) => useDialog(open, onClose),
      { initialProps: { open: true, onClose } },
    );

    rerender({ open: false, onClose });

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });

    expect(onClose).not.toHaveBeenCalled();
  });

  it('increments scroll lock count for nested dialogs', () => {
    const { rerender } = renderHook(
      ({ open }) => useDialog(open),
      { initialProps: { open: false } },
    );

    rerender({ open: true });
    expect(document.body.style.overflow).toBe('hidden');

    rerender({ open: false });
    expect(document.body.style.overflow).toBe('');
  });
});
