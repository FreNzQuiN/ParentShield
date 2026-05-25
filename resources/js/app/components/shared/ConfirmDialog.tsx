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
    danger: 'bg-[#ba1a1a] text-white hover:bg-[#a01515]',
    default: 'bg-[#005bbf] text-white hover:bg-[#004d9e]',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget && !loading) onCancel(); }}
    >
      <div
        className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        aria-describedby={descId}
      >
        <h2 className="mb-2 font-['Roboto',sans-serif] text-[20px] font-medium text-[#181c20]">
          {title}
        </h2>
        <p id={descId} className="mb-6 font-['Roboto',sans-serif] text-sm text-[#414754]">
          {message}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 rounded-[8px] border border-[#c1c6d6] bg-white py-3 font-['Roboto',sans-serif] text-sm text-[#414754] transition-colors hover:bg-[#f1f4fa] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 rounded-[8px] py-3 font-['Roboto',sans-serif] text-sm tracking-[0.5px] transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${confirmStyles[variant]}`}
          >
            {loading ? (loadingLabel ?? `${confirmLabel}...`) : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
