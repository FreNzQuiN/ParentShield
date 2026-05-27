import { LIMIT_OPTIONS } from '../../../hooks/useActivityLog';

interface ActivityPaginationProps {
  currentPage: number;
  totalPages: number;
  hasPrev: boolean;
  hasNext: boolean;
  loading: boolean;
  onGoToPage: (pageNumber: number) => void;
  limit: number;
  onLimitChange: (limit: number) => void;
}

export default function ActivityPagination({ currentPage, totalPages, hasPrev, hasNext, loading, onGoToPage, limit, onLimitChange }: ActivityPaginationProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-4 sm:flex-row sm:justify-between">
      <div className="flex items-center gap-2 text-xs text-text-secondary">
        <span>Tampilkan</span>
        <select
          value={limit}
          onChange={(e) => onLimitChange(Number(e.target.value))}
          disabled={loading}
          className="rounded-lg border border-border/40 bg-bg-card px-2 py-1.5 text-xs text-text-primary outline-none transition-colors focus:border-primary disabled:opacity-40"
        >
          {LIMIT_OPTIONS.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
        <span>baris</span>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            onClick={() => onGoToPage(currentPage - 1)}
            disabled={!hasPrev || loading}
            className="flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium text-text-secondary transition-colors hover:bg-bg-tag disabled:opacity-40"
            aria-label="Halaman sebelumnya"
          >
            <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Sebelumnya
          </button>

          <div className="flex items-center gap-1">
            {(() => {
              const pages: (number | 'ellipsis')[] = [];
              for (let i = 1; i <= totalPages; i++) {
                if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
                  pages.push(i);
                } else if (pages[pages.length - 1] !== 'ellipsis') {
                  pages.push('ellipsis');
                }
              }
              return pages.map((p, i) =>
                p === 'ellipsis' ? (
                  <span key={`e-${i}`} className="px-1 text-xs text-text-muted">...</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => onGoToPage(p)}
                    disabled={loading}
                    className={`flex size-8 items-center justify-center rounded-lg text-xs font-medium transition-colors ${
                      p === currentPage
                        ? 'bg-primary text-white'
                        : 'text-text-secondary hover:bg-bg-tag'
                    }`}
                    aria-label={`Halaman ${p}`}
                    aria-current={p === currentPage ? 'page' : undefined}
                  >
                    {p}
                  </button>
                )
              );
            })()}
          </div>

          <button
            onClick={() => onGoToPage(currentPage + 1)}
            disabled={!hasNext || loading}
            className="flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium text-text-secondary transition-colors hover:bg-bg-tag disabled:opacity-40"
            aria-label="Halaman selanjutnya"
          >
            Selanjutnya
            <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}