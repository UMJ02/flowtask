'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { appNavLinks } from '@/components/layout/nav-links';
import { SidebarFooter } from '@/components/layout/sidebar-footer';
import { useSidebarState } from '@/components/layout/sidebar-state';
import type { OrganizationSummary } from '@/types/organization';

const mainNavLinks = appNavLinks.filter((link) => link.href !== '/app/settings');

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
    <aside className={`hidden bg-[#071120] px-3 py-5 text-white shadow-[18px_0_50px_rgba(7,17,32,0.18)] md:sticky md:top-0 md:flex md:h-screen md:flex-col transition-all duration-300 ${collapsed ? 'md:w-[96px]' : 'md:w-[260px]'}`}>
      <div className={`mb-8 flex items-center ${collapsed ? 'justify-center' : 'justify-between px-2'}`}>
        <Link href="/app/dashboard" className="flex min-w-0 items-center gap-3">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-emerald-400/10 ring-1 ring-emerald-400/20">
            <Image src="/icons/icon.png" alt="FlowTask" width={28} height={28} className="h-7 w-7 object-contain" priority />
          </span>
          {!collapsed ? <span className="truncate text-[15px] font-black uppercase tracking-[0.22em] text-white">FlowTask</span> : null}
        </Link>
        {!collapsed ? (
          <button
            type="button"
            onClick={toggle}
            aria-label="Colapsar menú"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl text-slate-400 transition hover:bg-white/8 hover:text-white"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        ) : null}
      </div>

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
      ) : null}

      <nav className="space-y-2">
        {mainNavLinks.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.href || pathname?.startsWith(`${link.href}/`) || (link.href === '/app/dashboard' && pathname === '/app/board');
          return (
            <Link
              key={link.href}
              className={`group flex h-12 items-center rounded-[12px] px-3 transition-all duration-200 ${collapsed ? 'justify-center' : 'gap-3'} ${active ? 'border border-emerald-400/25 bg-emerald-400/14 text-white shadow-[0_12px_28px_rgba(22,199,132,0.10)]' : 'text-slate-300 hover:bg-white/7 hover:text-white'}`}
              href={link.href}
              title={collapsed ? link.label : undefined}
            >
              <Icon className={`h-5 w-5 shrink-0 ${active ? 'text-[#16C784]' : 'text-slate-300 group-hover:text-white'}`} />
              {!collapsed ? <span className="truncate text-[15px] font-semibold">{link.label}</span> : null}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-4">
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
