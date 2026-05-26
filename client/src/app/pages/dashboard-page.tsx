import { useProfile } from '@/hooks/auth/use-profile';
import { useAuthStore } from '@/store/auth-store';
import { ClipboardList, RefreshCw, ShieldCheck, UserRound, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/dashboard/stat-card';
import { ProfileSection } from '@/components/dashboard/profile-section';
import { useQuery } from '@tanstack/react-query';
import { userService } from '@/services/user-service';
import { taskService } from '@/services/task-service';

export function DashboardPage() {
   const { isLoading, error } = useProfile();
   const user = useAuthStore((state) => state.user);
   const isAdmin = user?.role === 'ADMIN';

   // Admin: fetch aggregate stats from /users/stats
   const { data: stats } = useQuery({
      queryKey: ['dashboard-stats'],
      queryFn: () => userService.getStats(),
      enabled: isAdmin,
   });

   // Member: fetch their assigned tasks total via meta.total (limit=1 is cheapest)
   const { data: myTasks } = useQuery({
      queryKey: ['my-tasks-count'],
      queryFn: () => taskService.getTasks(1, 1),
      enabled: !isAdmin,
   });

   if (isLoading) {
      return (
         <div className="flex items-center justify-center py-20">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Loading profile...</p>
         </div>
      );
   }

   if (error) {
      return (
         <div className="flex flex-col items-center justify-center gap-4 py-20">
            <p className="text-sm font-medium text-destructive">Failed to load profile.</p>
            <Button variant="outline" className="h-9 rounded-xl" onClick={() => window.location.reload()}>
               <RefreshCw className="size-4" />
               Retry
            </Button>
         </div>
      );
   }

   return (
      <div className="space-y-6">
         {/* ── Stat cards ── */}
         <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {isAdmin ? (
               <>
                  <StatCard
                     title="Admins"
                     value={stats ? String(stats.totalAdmins) : '—'}
                     label="Administrator accounts"
                     icon={<ShieldCheck className="size-6 text-white" />}
                     gradient="from-gray-400 to-gray-900"
                  />
                  <StatCard
                     title="Members"
                     value={stats ? String(stats.totalMembers) : '—'}
                     label="Regular member accounts"
                     icon={<UserRound className="size-6 text-white" />}
                     gradient="from-sky-400 to-blue-500"
                  />
                  <StatCard
                     title="Total Tasks"
                     value={stats ? String(stats.totalTasks) : '—'}
                     label="Across all members"
                     icon={<ClipboardList className="size-6 text-white" />}
                     gradient="from-violet-400 to-purple-500"
                  />
               </>
            ) : (
               <>
                  <StatCard
                     title="I'm"
                     value={user?.name ?? 'You'}
                     label="Member"
                     icon={<UserRound className="size-6 text-white" />}
                     gradient="from-sky-400 to-blue-500"
                  />
                  <StatCard
                     title="Assigned Tasks"
                     value={myTasks ? String(myTasks.meta.total) : '—'}
                     label="Tasks assigned to you"
                     icon={<ClipboardList className="size-6 text-white" />}
                     gradient="from-amber-400 to-orange-500"
                  />
               </>
            )}
         </div>

         {/* ── Profile section ── */}
         <ProfileSection user={user ?? null} />
      </div>
   );
}
