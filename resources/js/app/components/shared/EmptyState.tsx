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
    <div className={`flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border bg-bg-card-inner p-12 text-center ${className}`}>
      {icon && <div className="text-text-muted">{icon}</div>}
      <div>
        <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
        {description && <p className="mt-1 text-sm text-text-secondary">{description}</p>}
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
