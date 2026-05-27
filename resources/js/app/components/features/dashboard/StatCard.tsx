import type { ReactNode } from 'react';

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  badge?: string;
  badgeVariant?: 'success' | 'warning';
  valueColor?: string;
  caption?: ReactNode;
}

const BADGE_STYLES: Record<string, string> = {
  success: 'bg-success-badge text-success',
  warning: 'bg-warning-bg text-warning-text',
};

export default function StatCard({ icon, label, value, badge, badgeVariant = 'success', valueColor, caption }: StatCardProps) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-[rgba(193,198,214,0.2)] bg-white p-4 shadow-[0px_1px_1px_rgba(0,0,0,0.05)] md:gap-4 md:p-5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-bg-card-inner md:h-10 md:w-10">
        {icon}
      </div>
      <div className="min-w-0 flex-1 text-right">
        <div className="flex items-center justify-end gap-2">
          <p className="text-[12px] font-medium tracking-[0.5px] text-text-secondary md:text-sm">
            {label}
          </p>
          {badge && (
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${BADGE_STYLES[badgeVariant]}`}>
              {badge}
            </span>
          )}
        </div>
        <p
          className="text-[22px] font-bold text-text-primary md:text-2xl"
          style={valueColor ? { color: valueColor } : undefined}
        >
          {value}
        </p>
        {caption && (
          <p className={`mt-0.5 text-[10px] md:text-xs ${typeof caption === 'string' ? 'text-text-muted' : ''}`}>
            {caption}
          </p>
        )}
      </div>
    </div>
  );
}
