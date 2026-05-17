import { useAuthStore } from '@/store/auth-store';
import { useProfile } from '@/hooks/auth/use-profile';
import { ProfileSection } from '@/components/dashboard/profile-section';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export function ProfilePage() {
  const { isLoading, error } = useProfile();
  const user = useAuthStore((state) => state.user);

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
    <div className="max-w-2xl">
      <ProfileSection user={user ?? null} />
    </div>
  );
}
