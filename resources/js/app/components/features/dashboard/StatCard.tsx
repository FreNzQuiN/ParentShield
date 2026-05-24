import type { ReactNode } from 'react';

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  badge?: string;
  valueColor?: string;
  caption?: string;
}

export default function StatCard({ icon, label, value, badge, valueColor, caption }: StatCardProps) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-[rgba(193,198,214,0.2)] bg-white p-4 shadow-[0px_1px_1px_rgba(0,0,0,0.05)] md:gap-4 md:p-5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f7f9ff] md:h-10 md:w-10">
        {icon}
      </div>
      <div className="min-w-0 flex-1 text-right">
        <div className="flex items-center justify-end gap-2">
          <p className="font-['Roboto',sans-serif] text-[12px] font-medium tracking-[0.5px] text-[#414754] md:text-sm">
            {label}
          </p>
          {badge && (
            <span className="shrink-0 rounded-full bg-[#a0f399] px-2 py-0.5 text-xs font-medium text-[#1b6d24]">
              {badge}
            </span>
          )}
        </div>
        <p
          className="font-['Roboto',sans-serif] text-[22px] font-bold text-[#181c20] md:text-[24px]"
          style={valueColor ? { color: valueColor } : undefined}
        >
          {value}
        </p>
        {caption && (
          <p className="mt-0.5 truncate font-['Roboto',sans-serif] text-[10px] text-[#727785] md:text-xs">
            {caption}
          </p>
        )}
      </div>
    </div>
  );
}
