import { useState } from 'react';
import type { QueryLogItem } from '../../../types/activity';
import Loading from '../../shared/Loading';

interface ActivityTableProps {
  entries: QueryLogItem[];
  deviceMap?: Record<string, string>;
  loading?: boolean;
}

function formatTime(millis: number): string {
  const diff = Date.now() - millis;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'Baru saja';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} hari lalu`;
  return new Date(millis).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getDisplayName(entry: QueryLogItem): string {
  if (entry.company_id) {
    return entry.company_id.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }
  const parts = entry.domain.split('.');
  const sld = parts.length >= 2 ? parts[parts.length - 2] : parts[0];
  return sld.charAt(0).toUpperCase() + sld.slice(1);
}

function getStatusBadge(status?: string) {
  if (!status) return { label: '—', className: 'bg-bg-tag text-text-muted' };
  if (status.includes('BLOCKED')) return { label: 'Diblokir', className: 'bg-red-100 text-danger' };
  if (status.includes('ALLOWED')) return { label: 'Diizinkan', className: 'bg-green-100 text-success' };
  if (status === 'MODIFIED') return { label: 'Dimodifikasi', className: 'bg-orange-100 text-orange-700' };
  return { label: status, className: 'bg-bg-tag text-text-muted' };
}

function getFilteringTypeLabel(type?: string): string {
  if (!type) return '—';
  const map: Record<string, string> = {
    'PARENTAL_CONTROL': 'Kontrol Orang Tua',
    'SAFE_SEARCH': 'Penelusuran Aman',
    'THREAT': 'Ancaman',
    'BLOCKED_SERVICE': 'Layanan Diblokir',
    'CUSTOM': 'Kustom',
  };
  return map[type] ?? type;
}

function DetailSection({ entry }: { entry: QueryLogItem }) {
  return (
    <div className="grid grid-cols-2 gap-3 text-xs">
      <div>
        <span className="text-text-muted">Domain:</span>
        <p className="font-medium text-text-primary break-all">{entry.domain}</p>
      </div>
      <div>
        <span className="text-text-muted">Sumber Filter:</span>
        <p className="font-medium text-text-primary">{getFilteringTypeLabel(entry.filtering_info?.filtering_type)}</p>
      </div>
      <div>
        <span className="text-text-muted">Tipe DNS:</span>
        <p className="font-medium text-text-primary">{entry.dns_request_type ?? '—'}</p>
      </div>
      <div>
        <span className="text-text-muted">Kategori:</span>
        <p className="font-medium text-text-primary">{entry.category_type ?? '—'}</p>
      </div>
    </div>
  );
}

export default function ActivityTable({ entries, deviceMap = {}, loading = false }: ActivityTableProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpand = (idx: number) => {
    setExpandedIndex((prev) => (prev === idx ? null : idx));
  };

  const content = (
    <>
      <div className="hidden overflow-hidden rounded-xl bg-bg-card shadow-[0px_4px_20px_-2px_rgba(0,91,192,0.15)] md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border/20 text-xs font-medium text-text-muted">
              <th className="px-4 py-3 md:px-5">Layanan / Situs</th>
              <th className="px-4 py-3 md:px-5">Waktu</th>
              <th className="px-4 py-3 md:px-5">Perangkat</th>
              <th className="px-4 py-3 md:px-5">Status</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, idx) => {
              const badge = getStatusBadge(entry.filtering_info?.filtering_status);
              return (
                <tr key={idx} className="group cursor-pointer">
                  <td colSpan={4} className="p-0">
                    <div
                      onClick={() => toggleExpand(idx)}
                      className="flex items-center border-b border-border/10 px-4 py-3 transition-colors hover:bg-bg-tag/30 md:px-5"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-medium text-text-primary">{getDisplayName(entry)}</p>
                        <p className="truncate text-xs text-text-muted">{entry.domain}</p>
                      </div>
                      <div className="flex-1 text-text-secondary">
                        {formatTime(entry.time_millis)}
                      </div>
                      <div className="flex-1 text-text-secondary">
                        {entry.device_id ? (deviceMap[entry.device_id] ?? entry.device_id) : '—'}
                      </div>
                      <div className="flex-1">
                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.className}`}>
                          {badge.label}
                        </span>
                      </div>
                      <div className="ml-2 shrink-0">
                        <svg
                          className={`size-4 text-text-muted transition-transform ${expandedIndex === idx ? 'rotate-180' : ''}`}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </div>
                    </div>
                    {expandedIndex === idx && (
                      <div className="border-b border-border/10 bg-bg-card-inner px-4 py-3 md:px-5">
                        <DetailSection entry={entry} />
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 md:hidden">
        {entries.map((entry, idx) => {
          const badge = getStatusBadge(entry.filtering_info?.filtering_status);
          return (
            <div key={idx} className="rounded-xl border border-border/20 bg-bg-card p-3 shadow-[0px_4px_20px_-2px_rgba(0,91,192,0.15)]">
              <div onClick={() => toggleExpand(idx)} className="cursor-pointer">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-text-primary text-sm">{getDisplayName(entry)}</p>
                    <p className="truncate text-xs text-text-muted">{entry.domain}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}>
                    {badge.label}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs text-text-muted">
                  <span>{formatTime(entry.time_millis)}</span>
                  <span className="text-border">|</span>
                  <span>{entry.device_id ? (deviceMap[entry.device_id] ?? entry.device_id) : '—'}</span>
                </div>
                <div className="mt-1 flex justify-end">
                  <svg
                    className={`size-4 text-text-muted transition-transform ${expandedIndex === idx ? 'rotate-180' : ''}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>
              {expandedIndex === idx && (
                <div className="mt-2 border-t border-border/10 pt-2">
                  <DetailSection entry={entry} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );

  return (
    <div className="relative">
      {content}
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/70">
          <Loading size="sm" message="Memuat ulang..." />
        </div>
      )}
    </div>
  );
}