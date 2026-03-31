export const dynamic = 'force-dynamic';

import { AppShell } from '@/components/layout/app-shell';
import { requireUser } from '@/lib/auth/guards';
import { getUnreadNotificationsCount } from '@/lib/queries/notifications';
import { getOrganizationContext } from '@/lib/queries/organization';
import { getCurrentProfile } from '@/lib/queries/profile';
import { safeServerCall } from '@/lib/runtime/safe-server';

export default async function PrivateAppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const [unreadCount, organizationContext, profile] = await Promise.all([
    safeServerCall('getUnreadNotificationsCount', () => getUnreadNotificationsCount(), 0),
    safeServerCall('getOrganizationContext', () => getOrganizationContext(), null),
    safeServerCall('getCurrentProfile', () => getCurrentProfile(), null),
  ]);

  return (
    <AppShell
      userEmail={profile?.email || user.email || 'Usuario'}
      userName={profile?.fullName || user.user_metadata?.full_name || null}
      userId={user.id}
      unreadCount={unreadCount}
      organizations={organizationContext?.organizations ?? []}
      activeOrganization={organizationContext?.activeOrganization ?? null}
    >
      {children}
    </AppShell>
  );
}
