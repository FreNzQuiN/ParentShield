interface LoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Loading({ message = 'Memuat...', size = 'md', className = '' }: LoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`} role="status">
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-border border-t-primary`}
        aria-hidden="true"
      />
      <span className="text-sm text-text-secondary">{message}</span>
    </div>
  );
}
