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

export function AppSidebar({ organizations = [], activeOrganization = null, userEmail, userName }: { organizations?: OrganizationSummary[]; activeOrganization?: OrganizationSummary | null; userEmail: string; userName?: string | null }) {
  const pathname = usePathname();
  const { collapsed, toggle } = useSidebarState();

  return (
    <aside className={`hidden bg-[linear-gradient(180deg,#071120_0%,#0A1730_100%)] text-[#E2E8F0] shadow-[16px_0_40px_rgba(2,6,23,0.08)] md:sticky md:top-0 md:flex md:h-screen md:flex-col md:overflow-y-auto md:overflow-x-hidden transition-[width] duration-[220ms] ease-[cubic-bezier(.2,.8,.2,1)] ${collapsed ? 'md:w-[72px]' : 'md:w-[260px]'}`}>
      <div className={`flex shrink-0 items-center ${collapsed ? 'justify-center px-3 py-6' : 'justify-between px-5 py-6'}`}>
        <Link href="/app/dashboard" className={`group flex min-w-0 items-center ${collapsed ? 'justify-center' : 'gap-3'}`} title={collapsed ? 'FlowTask' : undefined}>
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[14px] bg-[#16C784]/10 ring-1 ring-[#16C784]/20 transition group-hover:scale-[1.03]">
            <Image src="/icons/icon.png" alt="FlowTask" width={30} height={30} className="h-7 w-7 object-contain" priority />
          </span>
          {!collapsed ? <span className="truncate text-[18px] font-black uppercase tracking-[0.06em] text-white">FlowTask</span> : null}
        </Link>
        {!collapsed ? (
          <button type="button" onClick={toggle} aria-label="Colapsar menú" className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] border border-white/10 bg-white/[0.04] text-slate-400 transition hover:-translate-y-px hover:bg-white/[0.08] hover:text-white">
            <PanelLeftClose className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {collapsed ? (
        <div className="mb-2 flex shrink-0 justify-center">
          <button type="button" onClick={toggle} aria-label="Expandir menú" className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border border-white/10 bg-white/[0.04] text-slate-300 transition hover:bg-white/[0.08] hover:text-white">
            <PanelLeftOpen className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      <div className={`min-h-0 flex-1 ${collapsed ? 'px-2' : 'px-4'}`}>
        {!collapsed ? <p className="mb-2 px-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Navegación</p> : null}
        <nav className="space-y-1.5 pb-4">
          {mainNavLinks.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href || pathname?.startsWith(`${link.href}/`) || (link.href === '/app/dashboard' && pathname === '/app/board');
            return (
              <Link key={link.href} className={`group relative flex h-11 items-center rounded-[12px] border transition-all duration-[150ms] ${collapsed ? 'justify-center px-0' : 'gap-3 px-3'} ${active ? 'border-[#16C784]/35 bg-white/[0.06] text-white shadow-[inset_4px_0_0_#16C784,0_12px_24px_rgba(22,199,132,0.10)]' : 'border-transparent text-slate-300 hover:translate-x-0.5 hover:bg-white/[0.04] hover:text-white'}`} href={link.href} title={collapsed ? link.label : undefined}>
                <Icon className={`h-[18px] w-[18px] shrink-0 transition ${active ? 'text-[#16C784]' : 'text-slate-300 group-hover:text-white'}`} />
                {!collapsed ? <span className="truncate text-[14px] font-semibold">{link.label}</span> : null}
                {collapsed ? <span className="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 z-50 hidden -translate-y-1/2 whitespace-nowrap rounded-[10px] bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white shadow-xl group-hover:block">{link.label}</span> : null}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className={`shrink-0 ${collapsed ? 'px-2 pb-4' : 'px-4 pb-5'}`}>
        <SidebarFooter organizations={organizations} activeOrganization={activeOrganization} userEmail={userEmail} userName={userName} collapsed={collapsed} />
        {!collapsed ? (
          <button type="button" onClick={toggle} className="mt-4 flex h-11 w-full items-center justify-center gap-3 rounded-[14px] border border-white/10 bg-white/[0.035] text-sm font-semibold text-slate-300 transition hover:-translate-y-px hover:bg-white/[0.07] hover:text-white">
            <PanelLeftClose className="h-4 w-4" />
            Colapsar menú
          </button>
        ) : null}
      </div>
    </aside>
  );
}
