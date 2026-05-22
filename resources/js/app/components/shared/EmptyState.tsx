import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export default function EmptyState({ icon, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-12 text-center ${className}`}>
      {icon && <div className="text-neutral-400">{icon}</div>}
      <div>
        <h3 className="text-lg font-semibold text-neutral-700">{title}</h3>
        {description && <p className="mt-1 text-sm text-neutral-500">{description}</p>}
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
