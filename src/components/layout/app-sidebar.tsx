'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { coreNavLinks, organizationNavLinks, utilityNavLinks } from '@/components/layout/nav-links';
import { SidebarFooter } from '@/components/layout/sidebar-footer';
import { useSidebarState } from '@/components/layout/sidebar-state';
import { isRouteActive } from '@/lib/navigation/routes';
import type { OrganizationSummary } from '@/types/organization';

function SidebarLink({
  href,
  label,
  hint,
  icon: Icon,
  active,
  collapsed,
}: {
  href: string;
  label: string;
  hint: string;
  icon: typeof coreNavLinks[number]['icon'];
  active: boolean;
  collapsed: boolean;
}) {
  return (
    <Link
      className={`group flex items-center ${collapsed ? 'justify-center' : 'justify-between'} rounded-[26px] px-2.5 py-2.5 transition-all duration-200 ${active ? 'bg-white/10 ring-1 ring-emerald-400/30 shadow-[0_0_0_1px_rgba(16,185,129,0.12)]' : 'hover:bg-white/8'}`}
      href={href}
      title={collapsed ? label : undefined}
    >
      <div className={`flex min-w-0 items-center ${collapsed ? '' : 'gap-3'}`}>
        <span className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-all duration-200 ${active ? 'bg-emerald-500 text-white shadow-[0_10px_24px_rgba(16,185,129,0.28)]' : 'bg-white/10 text-emerald-300 group-hover:bg-emerald-500 group-hover:text-white'}`}>
          <Icon className="h-4 w-4" />
        </span>
        {!collapsed ? (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{label}</p>
            <p className={`truncate text-[11px] ${active ? 'text-slate-200' : 'text-slate-400'}`}>{hint}</p>
          </div>
        ) : null}
      </div>
    </Link>
  );
}

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
              <p className="mt-1 text-xl font-bold">Navigation Hardening</p>
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
          <p className="mt-1 text-xs leading-5 text-slate-300">Rutas más seguras, estado activo consistente y accesos de soporte sin ruido extra.</p>
        </div>
      )}

      <nav className="space-y-1.5 border-t border-white/10 pt-3">
        {coreNavLinks.map((link) => (
          <SidebarLink
            key={link.href}
            href={link.href}
            label={link.label}
            hint={link.hint}
            icon={link.icon}
            active={isRouteActive(pathname, link.href)}
            collapsed={collapsed}
          />
        ))}
      </nav>

      {!collapsed ? (
        <div className="mt-4 space-y-4 border-t border-white/10 pt-4">
          <div>
            <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Organización</p>
            <div className="space-y-1.5">
              {organizationNavLinks.map((link) => (
                <SidebarLink
                  key={link.href}
                  href={link.href}
                  label={link.label}
                  hint={link.hint}
                  icon={link.icon}
                  active={isRouteActive(pathname, link.href)}
                  collapsed={false}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Soporte operativo</p>
            <div className="space-y-1.5">
              {utilityNavLinks.map((link) => (
                <SidebarLink
                  key={link.href}
                  href={link.href}
                  label={link.label}
                  hint={link.hint}
                  icon={link.icon}
                  active={isRouteActive(pathname, link.href)}
                  collapsed={false}
                />
              ))}
            </div>
          </div>
        </div>
      ) : null}

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
