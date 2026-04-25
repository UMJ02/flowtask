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
    <div className="min-h-screen bg-[#F7F9FC] text-[#0F172A]">
      <div className={`grid min-h-screen transition-[grid-template-columns] duration-300 ${collapsed ? 'md:grid-cols-[88px_minmax(0,1fr)]' : 'md:grid-cols-[280px_minmax(0,1fr)]'}`}>
        <AppSidebar organizations={organizations} activeOrganization={activeOrganization} userEmail={userEmail} userName={userName} />
        <div className="min-w-0 px-4 py-4 md:px-8 md:py-6">
          <AppHeader userEmail={userEmail} userName={userName} avatarUrl={userAvatarUrl} organizations={organizations} activeOrganization={activeOrganization} />
          <main className="mt-6 min-w-0">{children}</main>
          <div className="mt-6 px-1 py-2">
            <AppFooter />
          </div>
        </div>
      </div>
    </div>
  );
}
