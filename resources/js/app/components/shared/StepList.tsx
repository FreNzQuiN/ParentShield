import { type ReactNode } from 'react';

export function Step({ number, text, children }: { number: number; text?: string; children?: ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-white">
        {number}
      </span>
      {text && <p className="pt-0.5 text-sm text-text-secondary">{text}</p>}
      {children}
    </div>
  );
}
