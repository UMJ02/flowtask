import { AppFooter } from '@/components/layout/app-footer';
import { AppHeader } from '@/components/layout/app-header';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { NotificationsProvider } from '@/components/notifications/notifications-provider';
import type { OrganizationSummary } from '@/types/organization';

export function AppShell({
  userEmail,
  userName,
  userId,
  unreadCount,
  organizations = [],
  activeOrganization = null,
  children,
}: {
  userEmail: string;
  userName?: string | null;
  userId: string;
  unreadCount: number;
  organizations?: OrganizationSummary[];
  activeOrganization?: OrganizationSummary | null;
  children: React.ReactNode;
}) {
  return (
    <NotificationsProvider userId={userId} initialUnreadCount={unreadCount}>
      <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#f0fdf4_100%)] p-3 md:p-6">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-[300px_minmax(0,1fr)]">
          <AppSidebar organizations={organizations} activeOrganization={activeOrganization} userEmail={userEmail} userName={userName} />
          <div className="space-y-4">
            <AppHeader userEmail={userEmail} userName={userName} />
            <main className="space-y-4">{children}</main>
            <AppFooter />
          </div>
        </div>
      </div>
    </NotificationsProvider>
  );
}
