import { BadgeCheck, ShieldCheck, UserRound } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { DataRow } from '@/components/dashboard/data-row';
import type { User } from '@/types';

interface ProfileSectionProps {
  user: User | null;
}

export function ProfileSection({ user }: ProfileSectionProps) {
  return (
    <div className="space-y-1">
      <div className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
        <ShieldCheck className="size-3.5" />
        Profile overview
      </div>
      <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
        Welcome, {user?.name ?? 'User'}
      </h2>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Your account information and current session details.
      </p>

      <Separator className="bg-slate-200 dark:bg-slate-800 my-5" />

      <div className="grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-2">
        <DataRow label="Name" value={user?.name ?? 'N/A'} icon={<UserRound className="size-4" />} />
        <DataRow label="Email" value={user?.email ?? 'N/A'} icon={<BadgeCheck className="size-4" />} />
        <DataRow label="Role" value={user?.role ?? 'N/A'} icon={<ShieldCheck className="size-4" />} />
        <DataRow label="User ID" value={user?.id ?? 'N/A'} icon={<ShieldCheck className="size-4" />} mono />
      </div>
    </div>
  );
}
