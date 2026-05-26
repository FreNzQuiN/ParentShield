import { useEffect, useRef } from 'react';

export function useDialog(open: boolean, onClose?: () => void) {
  const prevFocusRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  const scrollLockCountRef = useRef(0);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    prevFocusRef.current = document.activeElement as HTMLElement;
    if (scrollLockCountRef.current === 0) {
      document.body.style.overflow = 'hidden';
    }
    scrollLockCountRef.current++;
    return () => {
      if (scrollLockCountRef.current > 0) scrollLockCountRef.current--;
      if (scrollLockCountRef.current === 0) {
        document.body.style.overflow = '';
      }
      prevFocusRef.current?.focus();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current?.();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);
}
