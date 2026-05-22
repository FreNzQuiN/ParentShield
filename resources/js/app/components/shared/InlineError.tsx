interface InlineErrorProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export default function InlineError({ message, onRetry, className = '' }: InlineErrorProps) {
  return (
    <div
      className={`flex flex-col items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-6 ${className}`}
      role="alert"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
        <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      </div>
      <p className="text-sm text-red-700">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
