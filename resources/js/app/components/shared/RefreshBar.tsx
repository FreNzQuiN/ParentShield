interface RefreshBarProps {
  onRefresh: () => void;
  isRefreshing: boolean;
  lastRefresh: number | null;
  disabled?: boolean;
  error?: string | null;
}

function formatTime(ms: number): string {
  const diff = Math.max(0, Math.floor((Date.now() - ms) / 1000));
  if (diff < 2) return 'Baru saja';
  if (diff < 60) return `${diff} detik lalu`;
  const mins = Math.floor(diff / 60);
  if (mins < 60) return `${mins} menit lalu`;
  const hrs = Math.floor(mins / 60);
  return `${hrs} jam lalu`;
}

export default function RefreshBar({ onRefresh, isRefreshing, lastRefresh, disabled, error }: RefreshBarProps) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-[rgba(193,198,214,0.2)] bg-white px-4 py-3 shadow-[0px_1px_1px_rgba(0,0,0,0.05)]">
      <div className="flex items-center gap-2">
        <svg
          className={`size-4 text-text-secondary ${isRefreshing ? 'animate-spin' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 2v6h-6" />
          <path d="M3 12a9 9 0 0115.36-6.36L21 8" />
          <path d="M3 22v-6h6" />
          <path d="M21 12a9 9 0 01-15.36 6.36L3 16" />
        </svg>
        <span className="text-xs text-text-secondary">
          {isRefreshing ? 'Memuat ulang...' : lastRefresh ? `Terakhir ${formatTime(lastRefresh)}` : 'Dashboard'}
        </span>
        {error && (
          <span className="text-[10px] text-danger">{error}</span>
        )}
      </div>
      <button
        onClick={onRefresh}
        disabled={disabled || isRefreshing}
        className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-primary-hover disabled:opacity-60"
        aria-label="Muat ulang dashboard"
      >
        <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 2v6h-6" />
          <path d="M3 12a9 9 0 0115.36-6.36L21 8" />
          <path d="M3 22v-6h6" />
          <path d="M21 12a9 9 0 01-15.36 6.36L3 16" />
        </svg>
        Muat Ulang
      </button>
    </div>
  );
}