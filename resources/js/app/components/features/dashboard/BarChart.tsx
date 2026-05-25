import { useMemo, type CSSProperties } from 'react';
import type { TimeSeriesPoint } from '../../../types/dashboard';
import { useIsMobile } from '../../../hooks/useIsMobile';

interface BarChartProps {
  data: TimeSeriesPoint[];
}

function formatHourShort(millis: number): string {
  const d = new Date(millis);
  return String(d.getHours());
}

function formatAxisValue(n: number): string {
  if (n >= 1000) return `${Math.round(n / 1000)}rb`;
  return String(n);
}

function mergePoints(points: TimeSeriesPoint[], factor: number): TimeSeriesPoint[] {
  if (factor <= 1) return points;
  const result: TimeSeriesPoint[] = [];
  for (let i = 0; i < points.length; i += factor) {
    const slice = points.slice(i, i + factor);
    result.push({
      hour: slice[0].hour,
      allowed: slice.reduce((s, p) => s + p.allowed, 0),
      blocked: slice.reduce((s, p) => s + p.blocked, 0),
    });
  }
  return result;
}

function BarSegment({ pct, color, style: extraStyle }: { pct: number; color: string; style?: CSSProperties }) {
  if (pct <= 0) return null;
  return (
    <div
      className="w-full transition-all duration-500 ease-out"
      style={{ height: `${pct}%`, backgroundColor: color, minHeight: '2px', ...extraStyle }}
    />
  );
}

const EMPTY_BAR_HEIGHT = 2;

export default function BarChart({ data }: BarChartProps) {
  const isMobile = useIsMobile();

  const displayData = useMemo(() => {
    if (!data.length) return [];
    return isMobile ? mergePoints(data, 2) : data;
  }, [data, isMobile]);

  if (!displayData.length) {
    return (
      <div className="flex h-[200px] items-center justify-center text-sm text-text-muted">
        Belum ada data aktivitas.
      </div>
    );
  }

  const maxVal = Math.max(...displayData.map((d) => d.allowed + d.blocked), 1);
  const yTicks = [0, Math.round(maxVal / 2), maxVal];

  return (
    <div className="flex h-[200px] items-end gap-0.5">
      <div className="flex h-full flex-col justify-between pb-6 pr-2 text-right">
        {[...yTicks].reverse().map((v) => (
          <span key={v} className="text-[10px] leading-none text-text-muted">
            {formatAxisValue(v)}
          </span>
        ))}
      </div>
      {displayData.map((point) => {
        const total = point.allowed + point.blocked;
        const hasBlocked = point.blocked > 0;
        const allowedPct = maxVal === 0 ? 0 : (point.allowed / maxVal) * 100;
        const blockedPct = maxVal === 0 ? 0 : (point.blocked / maxVal) * 100;
        const totalPct = allowedPct + blockedPct;
        const barHeight = Math.max(totalPct, total > 0 ? 4 : 0);
        const isPeak = total === maxVal && total > 0;
        const hourLabel = formatHourShort(point.hour);

        return (
          <div
            key={point.hour}
            className="relative flex flex-1 flex-col justify-end items-center h-full"
            title={total > 0 ? `${hourLabel}:00 — Diizinkan: ${point.allowed.toLocaleString()}, Diblokir: ${point.blocked.toLocaleString()}` : undefined}
          >
            {total > 0 ? (
              <div
                className="w-3/4 flex flex-col justify-end overflow-hidden rounded-t transition-all duration-500 ease-out"
                style={{ height: `${barHeight}%`, minHeight: '4px' }}
              >
                <BarSegment
                  pct={(allowedPct / totalPct) * 100}
                  color={isPeak ? 'var(--color-primary)' : 'var(--color-chart-blue)'}
                  style={{ opacity: isPeak && !hasBlocked ? 1 : 0.65 }}
                />
                {hasBlocked && <BarSegment pct={(blockedPct / totalPct) * 100} color="var(--color-danger-bar)" />}
              </div>
            ) : (
              <div className="w-3/4 rounded-t bg-bg-tag" style={{ height: `${EMPTY_BAR_HEIGHT}px` }} />
            )}
            <span className="mt-1 text-[10px] text-text-muted">{hourLabel}</span>
          </div>
        );
      })}
    </div>
  );
}
