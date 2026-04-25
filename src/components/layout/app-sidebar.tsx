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
    <aside className={`hidden overflow-visible bg-[linear-gradient(180deg,#071120,#08162A)] px-4 py-6 text-white shadow-[18px_0_50px_rgba(7,17,32,0.22)] transition-all duration-200 md:sticky md:top-0 md:flex md:h-screen md:flex-col ${collapsed ? 'md:w-[88px]' : 'md:w-[280px]'}`}>
      <div className={`mb-8 flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
        <Link href="/app/dashboard" className="group flex min-w-0 items-center gap-3" title={collapsed ? 'FlowTask' : undefined}>
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-emerald-400/10 ring-1 ring-emerald-400/25 transition group-hover:scale-[1.04] group-hover:bg-emerald-400/15">
            <Image src="/icons/icon.png" alt="FlowTask" width={30} height={30} className="h-8 w-8 object-contain" priority />
          </span>
          {!collapsed ? <span className="truncate text-[16px] font-black uppercase tracking-[0.20em] text-white">FlowTask</span> : null}
        </Link>
        {!collapsed ? (
          <button type="button" onClick={toggle} aria-label="Colapsar menú" className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-300 transition hover:scale-[1.04] hover:bg-white/10 hover:text-white">
            <PanelLeftClose className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {collapsed ? (
        <div className="mb-4 flex justify-center">
          <button type="button" onClick={toggle} aria-label="Expandir menú" className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/8 text-slate-200 transition hover:scale-[1.04] hover:bg-white/12 hover:text-white">
            <PanelLeftOpen className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      <nav className="space-y-2.5">
        {mainNavLinks.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.href || pathname?.startsWith(`${link.href}/`) || (link.href === '/app/dashboard' && pathname === '/app/board');
          return (
            <Link key={link.href} className={`group relative flex h-14 items-center rounded-2xl px-3 transition-all duration-200 ${collapsed ? 'justify-center' : 'gap-3'} ${active ? 'border border-emerald-400/25 bg-emerald-400/10 text-white shadow-[0_12px_30px_rgba(22,199,132,0.14)]' : 'text-slate-300 hover:translate-x-1 hover:bg-white/5 hover:text-white'}`} href={link.href} title={collapsed ? link.label : undefined}>
              {active ? <span className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-[#16C784] shadow-[0_0_18px_rgba(22,199,132,.55)]" /> : null}
              <Icon className={`h-5 w-5 shrink-0 transition ${active ? 'text-[#16C784]' : 'text-slate-300 group-hover:text-white'}`} />
              {!collapsed ? <span className="truncate text-[15px] font-semibold">{link.label}</span> : null}
              {collapsed ? <span className="pointer-events-none absolute left-[calc(100%+12px)] top-1/2 z-50 hidden -translate-y-1/2 whitespace-nowrap rounded-xl bg-slate-950 px-3 py-2 text-xs font-semibold text-white shadow-xl group-hover:block">{link.label}</span> : null}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-5">
        <SidebarFooter organizations={organizations} activeOrganization={activeOrganization} userEmail={userEmail} userName={userName} collapsed={collapsed} />
      </div>
    </aside>
  );
}
