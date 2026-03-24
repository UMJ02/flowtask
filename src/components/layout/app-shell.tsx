'use client';

import { usePathname } from 'next/navigation';
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
  const pathname = usePathname();
  const isInteractiveDashboard = pathname === '/app/dashboard';

  if (isInteractiveDashboard) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#f0fdf4_100%)] p-3 md:p-6">
        <main className="mx-auto max-w-[1500px] min-w-0">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#f0fdf4_100%)] p-3 md:p-6">
      <div className={`mx-auto grid max-w-7xl gap-4 transition-[grid-template-columns] duration-300 ${collapsed ? 'md:grid-cols-[104px_minmax(0,1fr)]' : 'md:grid-cols-[300px_minmax(0,1fr)]'}`}>
        <AppSidebar organizations={organizations} activeOrganization={activeOrganization} userEmail={userEmail} userName={userName} />
        <div className="space-y-4 min-w-0">
          <AppHeader userEmail={userEmail} userName={userName} />
          <main className="space-y-4 min-w-0">{children}</main>
          <AppFooter />
        </div>
      </div>
    </div>
  );
}
