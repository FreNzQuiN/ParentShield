import { type ReactNode } from 'react';

interface SettingsCardProps {
  title: string;
  description?: string;
  titleColor?: string;
  children: ReactNode;
}

export default function SettingsCard({ title, description, titleColor = 'text-primary', children }: SettingsCardProps) {
  return (
    <div className="rounded-xl bg-bg-card p-6 shadow-card">
      <h2 className={`mb-1 text-xl font-bold ${titleColor}`}>{title}</h2>
      {description && <p className="mb-4 text-sm text-text-secondary">{description}</p>}
      {children}
    </div>
  );
}
