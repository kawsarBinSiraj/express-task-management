import type { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string;
  label: string;
  icon: ReactNode;
  gradient: string;
}

export function StatCard({ title, value, label, icon, gradient }: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <p className="mt-1.5 truncate text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {value}
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{label}</p>
        </div>
        <div
          className={`flex size-12 shrink-0 items-center justify-center rounded-full bg-linear-to-br ${gradient} shadow-md`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
