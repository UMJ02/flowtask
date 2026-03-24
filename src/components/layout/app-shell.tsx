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
      <SidebarStateProvider>
        <ShellFrame
          userEmail={userEmail}
          userName={userName}
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
  organizations = [],
  activeOrganization = null,
  children,
}: {
  userEmail: string;
  userName?: string | null;
  organizations?: OrganizationSummary[];
  activeOrganization?: OrganizationSummary | null;
  children: React.ReactNode;
}) {
  const { collapsed } = useSidebarState();

  return (
    <div className="app-noise min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#effcf5_44%,#eef6ff_100%)] p-3 md:p-5 xl:p-6">
      <div className={`mx-auto grid max-w-7xl gap-4 transition-[grid-template-columns] duration-300 ${collapsed ? 'md:grid-cols-[104px_minmax(0,1fr)]' : 'md:grid-cols-[300px_minmax(0,1fr)]'}`}>
        <AppSidebar organizations={organizations} activeOrganization={activeOrganization} userEmail={userEmail} userName={userName} />
        <div className="min-w-0 space-y-4">
          <AppHeader userEmail={userEmail} userName={userName} />
          <main className="min-w-0 space-y-5">{children}</main>
          <AppFooter />
        </div>
      </div>
    </div>
  );
}
