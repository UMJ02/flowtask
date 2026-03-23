'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { appNavLinks } from '@/components/layout/nav-links';
import { SidebarFooter } from '@/components/layout/sidebar-footer';
import { useSidebarState } from '@/components/layout/sidebar-state';
import { useNotificationsState } from '@/components/notifications/notifications-provider';
import type { OrganizationSummary } from '@/types/organization';

const footerHrefs = new Set(['/app/organization', '/app/organization/roles', '/app/organization/billing', '/app/admin', '/contact', '/app/settings']);
const mainNavLinks = appNavLinks.filter((link) => !footerHrefs.has(link.href));

export function AppSidebar({
  organizations = [],
  activeOrganization = null,
  userEmail,
  userName,
}: {
  organizations?: OrganizationSummary[];
  activeOrganization?: OrganizationSummary | null;
  userEmail: string;
  userName?: string | null;
}) {
  const pathname = usePathname();
  const { unreadCount } = useNotificationsState();
  const { collapsed, toggle } = useSidebarState();

  return (
    <aside className={`hidden sticky top-6 rounded-[32px] border border-emerald-900/20 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 px-3 py-4 text-white shadow-[0_20px_50px_rgba(15,23,42,0.24)] md:flex md:min-h-[calc(100vh-3rem)] md:flex-col transition-all duration-300 ${collapsed ? 'md:w-[104px]' : 'md:w-full'}`}>
      {collapsed ? (
        <div className="mb-4 flex justify-center">
          <button
            type="button"
            onClick={toggle}
            aria-label="Expandir menú"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/8 text-slate-200 transition hover:bg-white/12 hover:text-white"
          >
            <PanelLeftOpen className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="mb-4 rounded-[26px] bg-white/5 p-3 ring-1 ring-white/10 transition-all duration-300">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">FlowTask</p>
              <p className="mt-1 text-xl font-bold">Todo más claro</p>
            </div>
            <button
              type="button"
              onClick={toggle}
              aria-label="Colapsar menú"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/8 text-slate-200 transition hover:bg-white/12 hover:text-white"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-1 text-xs leading-5 text-slate-300">Pendientes, proyectos y clientes en un solo lugar.</p>
        </div>
      )}

      <nav className="space-y-1.5 border-t border-white/10 pt-3">
        {mainNavLinks.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.href || (link.href !== '/app/dashboard' && pathname?.startsWith(`${link.href}/`));
          return (
            <Link
              key={link.href}
              className={`group flex items-center ${collapsed ? 'justify-center' : 'justify-between'} rounded-[26px] px-2.5 py-2.5 transition-all duration-200 ${active ? 'bg-white/10 ring-1 ring-emerald-400/30 shadow-[0_0_0_1px_rgba(16,185,129,0.12)]' : 'hover:bg-white/8'}`}
              href={link.href}
              title={collapsed ? link.label : undefined}
            >
              <div className={`flex min-w-0 items-center ${collapsed ? '' : 'gap-3'}`}>
                <span className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-all duration-200 ${active ? 'bg-emerald-500 text-white shadow-[0_10px_24px_rgba(16,185,129,0.28)]' : 'bg-white/10 text-emerald-300 group-hover:bg-emerald-500 group-hover:text-white'}`}>
                  <Icon className="h-4 w-4" />
                </span>
                {!collapsed ? (
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{link.label}</p>
                    <p className={`truncate text-[11px] ${active ? 'text-slate-200' : 'text-slate-400'}`}>{link.hint}</p>
                  </div>
                ) : null}
              </div>
              {!collapsed && link.isNotifications && unreadCount > 0 ? (
                <span className="inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              ) : null}
              {collapsed && link.isNotifications && unreadCount > 0 ? (
                <span className="absolute ml-7 -mt-7 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-3">
        <SidebarFooter
          organizations={organizations}
          activeOrganization={activeOrganization}
          userEmail={userEmail}
          userName={userName}
          collapsed={collapsed}
        />
      </div>
    </aside>
  );
}
