export const dynamic = 'force-dynamic';

import { AppShell } from '@/components/layout/app-shell';
import { requireUser } from '@/lib/auth/guards';
import { getUnreadNotificationsCount } from '@/lib/queries/notifications';
import { getOrganizationContext } from '@/lib/queries/organization';
import { getCurrentProfile } from '@/lib/queries/profile';
import { safeServerCall } from '@/lib/runtime/safe-server';
import { getAdminAccess } from '@/lib/queries/admin';

export default async function PrivateAppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const [unreadCount, organizationContext, profile, adminAccess] = await Promise.all([
    safeServerCall('getUnreadNotificationsCount', () => getUnreadNotificationsCount(), 0),
    safeServerCall('getOrganizationContext', () => getOrganizationContext(), null),
    safeServerCall('getCurrentProfile', () => getCurrentProfile(), null),
    safeServerCall('getAdminAccess', () => getAdminAccess(), { canAccess: false, userId: null }),
  ]);

  return (
    <AppShell
      userEmail={profile?.email || user.email || 'Usuario'}
      userName={profile?.fullName || user.user_metadata?.full_name || null}
      userId={user.id}
      unreadCount={unreadCount}
      organizations={organizationContext?.organizations ?? []}
      activeOrganization={organizationContext?.activeOrganization ?? null}
      canAccessPlatform={adminAccess?.canAccess ?? false}
    >
      {children}
    </AppShell>
  );
}
