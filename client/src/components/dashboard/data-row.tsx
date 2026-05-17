import type { ReactNode } from 'react';

interface DataRowProps {
  label: string;
  value: string;
  icon: ReactNode;
  mono?: boolean;
}

export function DataRow({ label, value, icon, mono }: DataRowProps) {
  return (
    <div className="space-y-1">
      <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {icon}
        {label}
      </p>
      <p
        className={`text-sm font-medium text-slate-900 dark:text-slate-100 sm:text-base${mono ? ' break-all font-mono' : ''}`}
      >
        {value}
      </p>
    </div>
  );
}
