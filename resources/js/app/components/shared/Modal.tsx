import { type ReactNode } from 'react';
import { CloseIcon } from './icons';
import { useDialog } from '../../hooks/useDialog';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'md' | 'lg';
}

export default function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  useDialog(open, onClose);

  if (!open) return null;

  const sizeClasses = {
    md: 'max-w-lg',
    lg: 'max-w-2xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:items-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className={`${sizeClasses[size]} max-h-[85vh] w-full overflow-y-auto rounded-xl bg-bg-card p-6 shadow-lg`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="relative mb-4">
          <h2 className="text-center text-xl font-semibold text-text-primary">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="absolute right-0 top-0 rounded-lg p-1 text-text-muted hover:bg-bg-sidebar transition-colors"
            aria-label="Tutup"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
