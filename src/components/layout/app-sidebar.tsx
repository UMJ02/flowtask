'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  const { collapsed } = useSidebarState();

  return (
    <aside className={`hidden bg-[linear-gradient(180deg,#071120,#08162A)] px-4 py-5 text-white shadow-[18px_0_50px_rgba(7,17,32,0.22)] md:sticky md:top-0 md:flex md:h-screen md:flex-col transition-all duration-300 ${collapsed ? 'md:w-[88px]' : 'md:w-[280px]'}`}>
      <div className={`mb-9 flex items-center ${collapsed ? 'justify-center' : 'justify-between px-2'}`}>
        <Link href="/app/dashboard" className="flex min-w-0 items-center gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-emerald-400/10 ring-1 ring-emerald-400/20">
            <Image src="/icons/icon.png" alt="FlowTask" width={28} height={28} className="h-7 w-7 object-contain" priority />
          </span>
          {!collapsed ? <span className="truncate text-[16px] font-black uppercase tracking-[0.18em] text-white">FlowTask</span> : null}
        </Link>
      </div>

      <nav className="space-y-2.5">
        {mainNavLinks.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.href || pathname?.startsWith(`${link.href}/`) || (link.href === '/app/dashboard' && pathname === '/app/board');
          return (
            <Link
              key={link.href}
              className={`group flex h-[54px] items-center rounded-2xl px-3 transition-all duration-200 ${collapsed ? 'justify-center' : 'gap-3'} ${active ? 'border border-emerald-400/25 bg-emerald-400/10 text-white shadow-[0_0_0_1px_rgba(22,199,132,0.05),0_16px_34px_rgba(22,199,132,0.12)]' : 'text-slate-300 hover:translate-x-1 hover:bg-white/5 hover:text-white'}`}
              href={link.href}
              title={collapsed ? link.label : undefined}
            >
              <Icon className={`h-5 w-5 shrink-0 transition ${active ? 'text-[#16C784]' : 'text-slate-300 group-hover:text-white'}`} />
              {!collapsed ? <span className="truncate text-[15px] font-bold">{link.label}</span> : null}
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
