import { useId } from 'react';
import { useDialog } from '../../hooks/useDialog';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loadingLabel?: string;
  variant?: 'danger' | 'default';
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Hapus',
  cancelLabel = 'Batal',
  loadingLabel,
  variant = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const descId = useId();
  useDialog(open, loading ? undefined : onCancel);

  if (!open) return null;

  const confirmStyles = {
    danger: 'bg-danger text-white hover:bg-danger-hover',
    default: 'bg-primary text-white hover:bg-primary-hover',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget && !loading) onCancel(); }}
    >
      <div
        className="w-full max-w-sm rounded-xl bg-bg-card p-6 shadow-lg"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        aria-describedby={descId}
      >
        <h2 className="mb-2 text-center text-xl font-semibold text-text-primary">
          {title}
        </h2>
        <p id={descId} className="mb-6 text-sm text-text-secondary">
          {message}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 rounded-lg border border-border bg-white py-3 text-sm text-text-secondary transition-colors hover:bg-bg-sidebar disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 rounded-lg py-3 text-sm tracking-[0.5px] transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${confirmStyles[variant]}`}
          >
            {loading ? (loadingLabel ?? `${confirmLabel}...`) : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
