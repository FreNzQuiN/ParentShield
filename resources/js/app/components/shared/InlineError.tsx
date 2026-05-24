interface InlineErrorProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export default function InlineError({ message, onRetry, className = '' }: InlineErrorProps) {
  return (
    <div
      className={`flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 ${className}`}
      role="alert"
    >
      <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-red-100">
        <svg className="size-3 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      </div>
      <div className="flex-1">
        <p className="text-sm text-red-700">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
          >
            Coba Lagi
          </button>
        )}
      </div>
    </div>
  );
}
