import type { TimeSeriesPoint } from '../../../types/dashboard';

interface BarChartProps {
  data: TimeSeriesPoint[];
}

function formatHour(millis: number): string {
  const d = new Date(millis);
  const h = d.getHours();
  return `${h.toString().padStart(2, '0')}:00`;
}

function formatAxisValue(n: number): string {
  if (n >= 1000) return `${Math.round(n / 1000)}rb`;
  return String(n);
}

export default function BarChart({ data }: BarChartProps) {
  if (!data.length) {
    return (
      <div className="flex h-[200px] items-center justify-center text-sm text-[#727785]">
        Belum ada data aktivitas.
      </div>
    );
  }

  const maxVal = Math.max(...data.map((d) => d.allowed + d.blocked), 1);
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
      {data.map((point, i) => {
        const total = point.allowed + point.blocked;
        const heightPct = maxVal === 0 ? 0 : Math.max((total / maxVal) * 100, 2);
        const isPeak = total === maxVal && total > 0;
        return (
          <div
            key={point.hour}
            className="relative flex flex-1 flex-col justify-end items-center h-full"
            title={`${formatHour(point.hour)} — Diizinkan: ${point.allowed.toLocaleString()}, Diblokir: ${point.blocked.toLocaleString()}`}
          >
            <div
              className="w-3/4 rounded-t transition-all"
              style={{
                height: `${heightPct}%`,
                backgroundColor: isPeak ? '#005bbf' : '#adc7ff',
                opacity: isPeak ? 1 : 0.65,
                minHeight: total > 0 ? '4px' : '0px',
              }}
            />
            <span className="mt-1 text-[10px] text-[#727785]">
              {formatHour(point.hour)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
