interface ProgressItem {
  label: string;
  value: number;
  percentage: number;
}

interface ProgressBarListProps {
  title: string;
  items: ProgressItem[];
  barColor?: string;
}

export default function ProgressBarList({ title, items, barColor = '#005bbf' }: ProgressBarListProps) {
  if (!items.length) {
    return (
      <div className="flex-1 rounded-xl border border-[rgba(193,198,214,0.2)] bg-white p-4 shadow-[0px_1px_1px_rgba(0,0,0,0.05)]">
        <h3 className="mb-3 font-['Roboto',sans-serif] text-sm font-medium text-[#414754]">{title}</h3>
        <p className="text-xs text-[#727785]">Belum ada data.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 rounded-xl border border-[rgba(193,198,214,0.2)] bg-white p-4 shadow-[0px_1px_1px_rgba(0,0,0,0.05)]">
      <h3 className="mb-3 font-['Roboto',sans-serif] text-sm font-medium text-[#414754]">{title}</h3>
      <div className="flex flex-col gap-2.5">
        {items.map((item) => (
          <div key={item.label}>
            <div className="mb-1 flex items-center justify-between">
              <span className="truncate font-['Roboto',sans-serif] text-xs text-[#181c20]">{item.label}</span>
              <span className="ml-2 shrink-0 font-['Roboto',sans-serif] text-xs text-[#727785]">{item.percentage}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#ebeef4]">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(item.percentage, 100)}%`,
                  backgroundColor: barColor,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

