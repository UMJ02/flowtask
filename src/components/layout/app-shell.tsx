'use client';

import { AppFooter } from '@/components/layout/app-footer';
import { AppHeader } from '@/components/layout/app-header';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { SidebarStateProvider, useSidebarState } from '@/components/layout/sidebar-state';
import { NotificationsProvider } from '@/components/notifications/notifications-provider';
import type { OrganizationSummary } from '@/types/organization';

export function AppShell({
  userEmail,
  userName,
  userId,
  unreadCount,
  userAvatarUrl,
  organizations = [],
  activeOrganization = null,
  children,
}: {
  userEmail: string;
  userName?: string | null;
  userId: string;
  unreadCount: number;
  userAvatarUrl?: string | null;
  organizations?: OrganizationSummary[];
  activeOrganization?: OrganizationSummary | null;
  children: React.ReactNode;
}) {
  return (
    <NotificationsProvider userId={userId} initialUnreadCount={unreadCount}>
      <SidebarStateProvider>
        <ShellFrame
          userEmail={userEmail}
          userName={userName}
          userAvatarUrl={userAvatarUrl}
          organizations={organizations}
          activeOrganization={activeOrganization}
        >
          {children}
        </ShellFrame>
      </SidebarStateProvider>
    </NotificationsProvider>
  );
}

function ShellFrame({
  userEmail,
  userName,
  userAvatarUrl,
  organizations = [],
  activeOrganization = null,
  children,
}: {
  userEmail: string;
  userName?: string | null;
  userAvatarUrl?: string | null;
  organizations?: OrganizationSummary[];
  activeOrganization?: OrganizationSummary | null;
  children: React.ReactNode;
}) {
  const { collapsed } = useSidebarState();

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#f3f7f5_52%,#eef5f2_100%)] px-2 py-2 md:px-3 md:py-4">
      <div className={`mx-auto grid max-w-[1540px] gap-3 transition-[grid-template-columns] duration-300 xl:gap-4 ${collapsed ? 'md:grid-cols-[104px_minmax(0,1fr)]' : 'md:grid-cols-[292px_minmax(0,1fr)]'}`}>
        <AppSidebar organizations={organizations} activeOrganization={activeOrganization} userEmail={userEmail} userName={userName} />
        <div className="min-w-0 space-y-3 xl:space-y-4">
          <AppHeader userEmail={userEmail} userName={userName} avatarUrl={userAvatarUrl} />
          <main className="min-w-0 space-y-3 xl:space-y-4">{children}</main>
          <div className="page-section px-4 py-3 md:px-5">
            <AppFooter />
          </div>
        </div>
      </div>
    </div>
  );
}
