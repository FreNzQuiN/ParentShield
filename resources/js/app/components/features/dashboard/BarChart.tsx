import { useMemo } from 'react';
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

export default function BarChart({ data }: BarChartProps) {
  const isMobile = useIsMobile();

  const displayData = useMemo(() => {
    if (!data.length) return [];
    return isMobile ? mergePoints(data, 2) : data;
  }, [data, isMobile]);

  if (!displayData.length) {
    return (
      <div className="flex h-[200px] items-center justify-center text-sm text-[#727785]">
        Belum ada data aktivitas.
      </div>
    );
  }

  const maxVal = Math.max(...displayData.map((d) => d.allowed + d.blocked), 1);
  const yTicks = [0, Math.round(maxVal / 2), maxVal];

  return (
    <div className="flex h-[200px] items-end gap-0.5">
      <div className="flex h-full flex-col justify-between pb-6 pr-2 text-right">
        {yTicks.reverse().map((v) => (
          <span key={v} className="text-[10px] leading-none text-[#727785]">
            {formatAxisValue(v)}
          </span>
        ))}
      </div>
      {displayData.map((point) => {
        const total = point.allowed + point.blocked;
        const hasBlocked = point.blocked > 0;
        const hasAllowed = point.allowed > 0;
        const allowedPct = maxVal === 0 ? 0 : (point.allowed / maxVal) * 100;
        const blockedPct = maxVal === 0 ? 0 : (point.blocked / maxVal) * 100;
        const totalPct = allowedPct + blockedPct;
        const barHeight = Math.max(totalPct, total > 0 ? 4 : 0);
        const isPeak = total === maxVal && total > 0;

        if (!total) {
          return (
            <div
              key={point.hour}
              className="relative flex flex-1 flex-col justify-end items-center h-full"
            >
              <div className="w-3/4 rounded-t bg-[#ebeef4]" style={{ height: '2px' }} />
              <span className="mt-1 text-[10px] text-[#727785]">
                {formatHourShort(point.hour)}
              </span>
            </div>
          );
        }

        return (
          <div
            key={point.hour}
            className="relative flex flex-1 flex-col justify-end items-center h-full"
            title={`${formatHourShort(point.hour)}:00 — Diizinkan: ${point.allowed.toLocaleString()}, Diblokir: ${point.blocked.toLocaleString()}`}
          >
            <div
              className="w-3/4 flex flex-col justify-end overflow-hidden rounded-t transition-all duration-500 ease-out"
              style={{ height: `${barHeight}%`, minHeight: '4px' }}
            >
              {hasAllowed && (
                <div
                  className="w-full transition-all duration-500 ease-out"
                  style={{
                    height: `${(allowedPct / totalPct) * 100}%`,
                    backgroundColor: isPeak ? '#005bbf' : '#adc7ff',
                    opacity: isPeak && !hasBlocked ? 1 : 0.65,
                    minHeight: '2px',
                  }}
                />
              )}
              {hasBlocked && (
                <div
                  className="w-full rounded-t transition-all duration-500 ease-out"
                  style={{
                    height: `${(blockedPct / totalPct) * 100}%`,
                    backgroundColor: '#dd3635',
                    minHeight: '2px',
                  }}
                />
              )}
            </div>
            <span className="mt-1 text-[10px] text-[#727785]">
              {formatHourShort(point.hour)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
