'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { appNavLinks } from '@/components/layout/nav-links';
import { useNotificationsState } from '@/components/notifications/notifications-provider';

export function AppSidebar() {
  const pathname = usePathname();
  const { unreadCount } = useNotificationsState();

  return (
    <aside className="hidden rounded-[32px] border border-emerald-900/20 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 p-5 text-white shadow-[0_20px_50px_rgba(15,23,42,0.24)] md:block">
      <div className="mb-8 rounded-[28px] bg-white/5 p-4 ring-1 ring-white/10">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-300">FlowTask</p>
        <p className="mt-2 text-2xl font-bold">Todo más claro</p>
        <p className="mt-2 text-sm text-slate-300">Un panel simple para seguir pendientes, proyectos y clientes sin perderte entre módulos.</p>
      </div>
      <nav className="space-y-2">
        {appNavLinks.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.href || (link.href !== '/app/dashboard' && pathname?.startsWith(`${link.href}/`));
          return (
            <Link
              key={link.href}
              className={`group flex items-center justify-between rounded-3xl px-3 py-3 transition ${active ? 'bg-white/10 ring-1 ring-emerald-400/30' : 'hover:bg-white/8'}`}
              href={link.href}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl transition ${active ? 'bg-emerald-500 text-white shadow-[0_10px_24px_rgba(16,185,129,0.28)]' : 'bg-white/10 text-emerald-300 group-hover:bg-emerald-500 group-hover:text-white'}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{link.label}</p>
                  <p className={`truncate text-xs ${active ? 'text-slate-200' : 'text-slate-400'}`}>{link.hint}</p>
                </div>
              </div>
              {link.isNotifications && unreadCount > 0 ? (
                <span className="inline-flex min-h-6 min-w-6 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
