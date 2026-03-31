import { AppShell } from '@/components/layout/app-shell';
import { requireUser } from '@/lib/auth/guards';
import { getUnreadNotificationsCount } from '@/lib/queries/notifications';
import { getOrganizationContext } from '@/lib/queries/organization';
import { getCurrentProfile } from '@/lib/queries/profile';

export default async function PrivateAppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const [profile, organizationContext, unreadCount] = await Promise.all([
    getCurrentProfile(),
    getOrganizationContext(),
    getUnreadNotificationsCount(),
  ]);

  return (
    <AppShell
      userId={user.id}
      userEmail={profile?.email || user.email || ''}
      userName={profile?.fullName || user.user_metadata?.full_name || null}
      unreadCount={unreadCount}
      organizations={organizationContext?.organizations ?? []}
      activeOrganization={organizationContext?.activeOrganization ?? null}
    >
      {children}
    </AppShell>
  );
}
