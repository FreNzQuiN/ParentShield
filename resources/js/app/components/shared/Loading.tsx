interface LoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Loading({ message = 'Loading...', size = 'md', className = '' }: LoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`} role="status">
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-neutral-200 border-t-blue-600`}
        aria-hidden="true"
      />
      <span className="text-sm text-neutral-500">{message}</span>
    </div>
  );
}
