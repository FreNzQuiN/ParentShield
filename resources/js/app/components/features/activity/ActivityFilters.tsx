import { useState, useRef, useEffect, useCallback } from 'react';
import type { ActivityFilters, FilteringActionStatus } from '../../../types/activity';
import type { DeviceDetail } from '../../../types/device';
import DateRangePicker from './DateRangePicker';

interface ActivityFiltersProps {
  filters: ActivityFilters;
  onFiltersChange: (filters: ActivityFilters) => void;
  devices?: DeviceDetail[];
  devicesLoading?: boolean;
  devicesError?: string | null;
  bufferStart?: number | null;
  bufferEnd?: number | null;
}

type StatusOption = 'ALL' | 'ALLOWED' | 'BLOCKED' | 'MODIFIED' | 'NONE';

const statusValuesMap: Record<Exclude<StatusOption, 'ALL'>, FilteringActionStatus[]> = {
  ALLOWED: ['REQUEST_ALLOWED', 'RESPONSE_ALLOWED'],
  BLOCKED: ['REQUEST_BLOCKED', 'RESPONSE_BLOCKED'],
  MODIFIED: ['MODIFIED'],
  NONE: ['UNKNOWN', 'NONE'],
};

const periodOptions: { key: ActivityFilters['period']; label: string }[] = [
  { key: '1h', label: '1 Jam' },
  { key: '12h', label: '12 Jam' },
  { key: '24h', label: '24 Jam' },
  { key: '7d', label: '7 Hari' },
  { key: 'custom', label: 'Kustom' },
];

function formatCustomLabel(filters: ActivityFilters): string {
  if (!filters.timeFrom || !filters.timeTo) return 'Pilih rentang';
  const f = (ms: number) => new Date(ms).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  return `${f(filters.timeFrom)} — ${f(filters.timeTo)}`;
}

export default function ActivityFilters({ filters, onFiltersChange, devices, devicesLoading, devicesError, bufferStart, bufferEnd }: ActivityFiltersProps) {
  const [deviceDropdownOpen, setDeviceDropdownOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(filters.search);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  useEffect(() => {
    setSearchInput(filters.search);
  }, [filters.search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filtersRef.current.search) {
        onFiltersChange({ ...filtersRef.current, search: searchInput });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  }, []);

  const handlePeriodSelect = useCallback((period: ActivityFilters['period']) => {
    if (period === 'custom') {
      setPickerOpen(true);
      onFiltersChange({ ...filters, period, timeFrom: null, timeTo: null });
    } else {
      setPickerOpen(false);
      onFiltersChange({ ...filters, period, timeFrom: null, timeTo: null });
    }
  }, [filters, onFiltersChange]);

  const handleCustomApply = useCallback((timeFrom: number, timeTo: number) => {
    onFiltersChange({ ...filters, period: 'custom', timeFrom, timeTo });
  }, [filters, onFiltersChange]);

  const handleStatusSelect = useCallback((option: StatusOption) => {
    if (option === 'ALL') {
      onFiltersChange({ ...filters, statuses: [] });
    } else {
      onFiltersChange({ ...filters, statuses: statusValuesMap[option] });
    }
  }, [filters, onFiltersChange]);

  const selectedStatus: StatusOption = filters.statuses.length === 0
    ? 'ALL'
    : filters.statuses.every(s => s.includes('BLOCKED'))
      ? 'BLOCKED'
      : filters.statuses.every(s => s.includes('ALLOWED'))
        ? 'ALLOWED'
        : filters.statuses.every(s => s === 'UNKNOWN' || s === 'NONE')
          ? 'NONE'
          : filters.statuses.length === 1 && filters.statuses[0] === 'MODIFIED'
            ? 'MODIFIED'
            : 'ALL';

  const toggleDevice = useCallback((deviceId: string) => {
    const current = filters.devices;
    const next = current.includes(deviceId)
      ? current.filter((id) => id !== deviceId)
      : [...current, deviceId];
    onFiltersChange({ ...filters, devices: next });
  }, [filters, onFiltersChange]);

  const toggleAllDevices = useCallback(() => {
    if (filters.devices.length === (devices ?? []).length) {
      onFiltersChange({ ...filters, devices: [] });
    } else {
      onFiltersChange({ ...filters, devices: (devices ?? []).map((d) => d.id) });
    }
  }, [filters, onFiltersChange, devices]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDeviceDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const deviceLabel = devicesLoading
    ? 'Memuat...'
    : filters.devices.length === 0
      ? 'Semua Perangkat'
      : `${filters.devices.length} Perangkat`;

  return (
    <div className="rounded-xl bg-bg-card p-3 shadow-[0px_4px_20px_-2px_rgba(0,91,192,0.15)] md:p-4">
      <div className="flex flex-col gap-4">
        <div className="relative">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Cari domain..."
            value={searchInput}
            onChange={handleSearchChange}
            className="w-full rounded-lg border border-border/40 bg-transparent py-2 pl-9 pr-3 text-sm text-text-primary placeholder-text-muted outline-none transition-colors focus:border-primary"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-text-secondary">Periode:</span>
          {periodOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => handlePeriodSelect(opt.key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                filters.period === opt.key
                  ? 'bg-primary text-white'
                  : 'bg-bg-tag text-text-secondary hover:bg-border/40'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {filters.period === 'custom' && (
          <div className="relative">
            <button
              onClick={() => setPickerOpen((p) => !p)}
              className="flex items-center gap-2 rounded-lg border border-border/40 bg-transparent px-3 py-1.5 text-xs text-text-secondary transition-colors hover:border-border"
            >
              <svg className="size-3.5 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span className="text-text-primary">{formatCustomLabel(filters)}</span>
              <svg className={`size-3 transition-transform ${pickerOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {pickerOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setPickerOpen(false)} />
                <div className="absolute left-0 top-full z-50 mt-2 w-[680px] max-w-[95vw]">
                <DateRangePicker
                  onApply={handleCustomApply}
                  onClose={() => setPickerOpen(false)}
                  bufferStart={bufferStart ?? undefined}
                  bufferEnd={bufferEnd ?? undefined}
                />
                </div>
              </>
            )}
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDeviceDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 rounded-lg border border-border/40 bg-transparent px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:border-border"
            >
              <svg className="size-3.5 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
                <path d="M9 1v3" />
                <path d="M15 1v3" />
                <path d="M9 9h6" />
                <path d="M9 13h6" />
                <path d="M9 17h4" />
              </svg>
              {deviceLabel}
              <svg className={`size-3 transition-transform ${deviceDropdownOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {deviceDropdownOpen && (
              <div className="absolute left-0 top-full z-50 mt-1 w-64 rounded-xl border border-border/40 bg-bg-card p-2 shadow-lg">
                {devicesLoading ? (
                  <p className="px-2 py-3 text-center text-xs text-text-muted">Memuat...</p>
                ) : devicesError ? (
                  <p className="px-2 py-3 text-center text-xs text-danger">{devicesError}</p>
                ) : (
                  <>
                    <label className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium text-text-primary hover:bg-bg-tag/50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.devices.length === (devices ?? []).length}
                        onChange={toggleAllDevices}
                        className="size-3.5 rounded border-border text-primary focus:ring-primary/30"
                      />
                      Semua
                    </label>
                    <div className="my-1 border-t border-border/20" />
                    {(devices ?? []).map((device) => (
                      <label
                        key={device.id}
                        className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-text-secondary hover:bg-bg-tag/50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={filters.devices.includes(device.id)}
                          onChange={() => toggleDevice(device.id)}
                          className="size-3.5 rounded border-border text-primary focus:ring-primary/30"
                        />
                        {device.name}
                      </label>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {(['ALL', 'ALLOWED', 'BLOCKED', 'MODIFIED', 'NONE'] as StatusOption[]).map((opt) => {
              const labels: Record<StatusOption, string> = {
                ALL: 'Semua',
                ALLOWED: 'Diizinkan',
                BLOCKED: 'Diblokir',
                MODIFIED: 'Dimodifikasi',
                NONE: 'Tidak Diketahui',
              };
              return (
                <button
                  key={opt}
                  onClick={() => handleStatusSelect(opt)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    selectedStatus === opt
                      ? 'bg-primary text-white'
                      : 'bg-bg-tag text-text-secondary hover:bg-border/40'
                  }`}
                >
                  {labels[opt]}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
