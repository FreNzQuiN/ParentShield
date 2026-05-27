import { useState, useMemo } from 'react';

interface DateRangePickerProps {
  onApply: (timeFrom: number, timeTo: number) => void;
  onClose: () => void;
  bufferStart?: number;
  bufferEnd?: number;
}

const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const QUICK_OPTIONS = [
  { label: '5 menit', ms: 300_000 },
  { label: '1 jam', ms: 3_600_000 },
  { label: '12 jam', ms: 43_200_000 },
  { label: '24 jam', ms: 86_400_000 },
  { label: '2 hari', ms: 172_800_000 },
  { label: '7 hari', ms: 604_800_000 },
  { label: '30 hari', ms: 2_592_000_000 },
  { label: '90 hari', ms: 7_776_000_000 },
];

const DAY_MS = 86400000;

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function startOffset(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function toDateInput(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${day} ${h}:${min}`;
}

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isBetween(d: Date, start: Date | null, end: Date | null): boolean {
  if (!start || !end) return false;
  return d > start && d < end;
}

function CalendarMonth({ year, month, startDate, endDate, minDate, maxDate, onSelect }: {
  year: number; month: number; startDate: Date | null; endDate: Date | null;
  minDate: Date; maxDate: Date;
  onSelect: (d: Date) => void;
}) {
  const totalDays = daysInMonth(year, month);
  const offset = startOffset(year, month);
  const rows: (number | null)[][] = [];
  let row: (number | null)[] = [];

  for (let i = 0; i < offset; i++) row.push(null);
  for (let d = 1; d <= totalDays; d++) {
    row.push(d);
    if (row.length === 7) { rows.push(row); row = []; }
  }
  if (row.length > 0) { while (row.length < 7) row.push(null); rows.push(row); }

  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month, totalDays);
  const allDisabled = monthEnd < minDate || monthStart > maxDate;

  return (
    <div className={`select-none ${allDisabled ? 'opacity-40' : ''}`}>
      <p className="mb-2 text-center text-sm font-semibold text-text-primary">{MONTHS[month]} {year}</p>
      <div className="mb-1 grid grid-cols-7 text-center text-[10px] font-medium text-text-muted">
        {DAYS.map((d) => <div key={d}>{d}</div>)}
      </div>
      {rows.map((r, ri) => (
        <div key={ri} className="grid grid-cols-7 text-center text-xs">
          {r.map((d, ci) => {
            if (!d) return <div key={ci} />;
            const date = new Date(year, month, d);
            const isBeforeRange = date < minDate;
            const isAfterRange = date > maxDate;
            const disabled = isBeforeRange || isAfterRange;
            const isStart = startDate && sameDay(date, startDate);
            const isEnd = endDate && sameDay(date, endDate);
            const inRange = isBetween(date, startDate, endDate);
            const isToday = sameDay(date, maxDate);
            return (
              <button
                key={ci}
                disabled={disabled}
                onClick={() => onSelect(date)}
                className={`relative flex h-7 w-full items-center justify-center rounded text-xs transition-colors
                  ${disabled ? 'cursor-not-allowed text-border/60' : 'cursor-pointer hover:bg-primary-light'}
                  ${isStart || isEnd ? 'z-10 bg-primary text-white font-semibold' : ''}
                  ${inRange && !isStart && !isEnd ? 'bg-primary-light' : ''}
                  ${isToday && !isStart && !isEnd ? 'font-semibold text-primary ring-1 ring-primary/40' : ''}
                  ${!disabled && !isStart && !isEnd && !inRange && !isToday ? 'text-text-primary' : ''}
                `}
              >
                {d}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default function DateRangePicker({ onApply, onClose, bufferStart, bufferEnd }: DateRangePickerProps) {
  const rawNow = useMemo(() => new Date(), []);
  const todayEnd = new Date(rawNow.getFullYear(), rawNow.getMonth(), rawNow.getDate(), 23, 59, 59, 999);
  const apiMinDate = new Date(todayEnd.getTime() - 90 * DAY_MS);
  apiMinDate.setHours(0, 0, 0, 0);

  const minDate = apiMinDate;
  const maxDate = todayEnd;

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [startInput, setStartInput] = useState('');
  const [endInput, setEndInput] = useState('');
  const defaultNavTs = Math.max(minDate.getTime(), new Date(rawNow.getFullYear(), rawNow.getMonth() - 1, 1).getTime());
  const defaultNav = new Date(new Date(defaultNavTs).getFullYear(), new Date(defaultNavTs).getMonth(), 1);
  const [navMonth, setNavMonth] = useState(() => defaultNav);
  const [error, setError] = useState<string | null>(null);

  const nextMonth = new Date(navMonth.getFullYear(), navMonth.getMonth() + 1, 1);
  const prevMonth = new Date(navMonth.getFullYear(), navMonth.getMonth() - 1, 1);
  const canGoPrev = prevMonth >= new Date(minDate.getFullYear(), minDate.getMonth(), 1);
  const canGoNext = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 1) <= new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);

  const handlePrev = () => { if (canGoPrev) setNavMonth(new Date(navMonth.getFullYear(), navMonth.getMonth() - 1, 1)); };
  const handleNext = () => { if (canGoNext) setNavMonth(new Date(navMonth.getFullYear(), navMonth.getMonth() + 1, 1)); };

  const handleQuick = (ms: number) => {
    const to = new Date();
    const from = new Date(Math.max(to.getTime() - ms, minDate.getTime()));
    setStartDate(from);
    setEndDate(to);
    setStartInput(toDateInput(from));
    setEndInput(toDateInput(to));
    setError(null);
  };

  const handleDaySelect = (d: Date) => {
    if (d < minDate || d > maxDate) return;
    if (!startDate || (startDate && endDate)) {
      setStartDate(d);
      setEndDate(null);
      setStartInput(toDateInput(d));
      setEndInput('');
    } else {
      if (d < startDate) {
        setStartDate(d);
        setStartInput(toDateInput(d));
      } else if (d.getTime() > maxDate.getTime()) {
        return;
      } else {
        setEndDate(d);
        setEndInput(toDateInput(d));
      }
    }
    setError(null);
  };

  const handleApply = () => {
    if (!startDate || !endDate) {
      setError('Pilih tanggal awal dan akhir.');
      return;
    }
    if (startDate >= endDate) {
      setError('Tanggal awal harus sebelum tanggal akhir.');
      return;
    }
    if (endDate > maxDate) {
      setError('Tanggal akhir tidak boleh di masa depan.');
      return;
    }
    if (startDate < minDate) {
      setError('Data hanya tersedia 90 hari ke belakang.');
      return;
    }
    setError(null);
    onApply(startDate.getTime(), endDate.getTime());
    onClose();
  };

  const handleStartInput = (val: string) => {
    setStartInput(val);
    const parsed = new Date(val.replace(' ', 'T'));
    if (!isNaN(parsed.getTime())) setStartDate(parsed);
  };

  const handleStartBlur = () => {
    if (!startDate || isNaN(new Date(startInput.replace(' ', 'T')).getTime())) {
      setStartInput(startDate ? toDateInput(startDate) : '');
    }
  };

  const handleEndInput = (val: string) => {
    setEndInput(val);
    const parsed = new Date(val.replace(' ', 'T'));
    if (!isNaN(parsed.getTime())) setEndDate(parsed);
  };

  const handleEndBlur = () => {
    if (!endDate || isNaN(new Date(endInput.replace(' ', 'T')).getTime())) {
      setEndInput(endDate ? toDateInput(endDate) : '');
    }
  };

  return (
    <div className="rounded-xl border border-border/40 bg-bg-card p-4 shadow-lg">
      <p className="mb-3 text-[11px] text-text-muted">
        Data tersedia: <span className="font-medium">{bufferStart ? toDateInput(new Date(bufferStart)) : '—'}</span> hingga <span className="font-medium">{bufferEnd ? toDateInput(new Date(bufferEnd)) : '—'}</span>
      </p>

      <div className="mb-4 flex flex-wrap gap-2">
        {QUICK_OPTIONS.map((opt) => (
          <button
            key={opt.label}
            onClick={() => handleQuick(opt.ms)}
            className="rounded-lg bg-bg-tag px-2.5 py-1 text-xs font-medium text-text-secondary transition-colors hover:bg-primary hover:text-white"
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-text-secondary">Dari</label>
          <input
            type="text"
            value={startInput}
            onChange={(e) => handleStartInput(e.target.value)}
            onBlur={handleStartBlur}
            placeholder="YYYY-MM-DD HH:MM"
            className="w-full rounded-lg border border-border/40 bg-transparent px-3 py-1.5 text-xs text-text-primary outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-text-secondary">Sampai</label>
          <input
            type="text"
            value={endInput}
            onChange={(e) => handleEndInput(e.target.value)}
            onBlur={handleEndBlur}
            placeholder="YYYY-MM-DD HH:MM"
            className="w-full rounded-lg border border-border/40 bg-transparent px-3 py-1.5 text-xs text-text-primary outline-none focus:border-primary"
          />
        </div>
      </div>

      {error && (
        <p className="mb-3 text-xs text-danger">{error}</p>
      )}

      <div className="mb-3 flex items-center gap-3 text-[10px] text-text-muted">
        <span className="flex items-center gap-1"><span className="inline-block size-2.5 rounded bg-primary-light" /> Dipilih</span>
        <span className="flex items-center gap-1"><span className="inline-block size-2.5 rounded bg-primary" /> Terpilih</span>
        <span className="flex items-center gap-1"><span className="inline-block size-2.5 rounded border border-border/60 bg-transparent" /> Tidak tersedia</span>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <CalendarMonth year={navMonth.getFullYear()} month={navMonth.getMonth()} startDate={startDate} endDate={endDate} minDate={minDate} maxDate={maxDate} onSelect={handleDaySelect} />
        <CalendarMonth year={nextMonth.getFullYear()} month={nextMonth.getMonth()} startDate={startDate} endDate={endDate} minDate={minDate} maxDate={maxDate} onSelect={handleDaySelect} />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button onClick={handlePrev} disabled={!canGoPrev} className="rounded-lg border border-border/40 px-2.5 py-1.5 text-xs text-text-secondary transition-colors hover:bg-bg-tag disabled:opacity-30">&lt; Sebulan</button>
          <button onClick={handleNext} disabled={!canGoNext} className="rounded-lg border border-border/40 px-2.5 py-1.5 text-xs text-text-secondary transition-colors hover:bg-bg-tag disabled:opacity-30">Sebulan &gt;</button>
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="rounded-lg border border-border/40 px-4 py-1.5 text-xs font-medium text-text-secondary hover:bg-bg-tag">Batal</button>
          <button onClick={handleApply} className="rounded-lg bg-primary px-4 py-1.5 text-xs font-medium text-white hover:bg-primary-hover">Terapkan</button>
        </div>
      </div>
    </div>
  );
}