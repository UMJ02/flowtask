'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { appNavLinks } from '@/components/layout/nav-links';
import { useNotificationsState } from '@/components/notifications/notifications-provider';

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { unreadCount } = useNotificationsState();

  return (
    <>
      <button
        aria-label="Abrir menú"
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-900 shadow-sm md:hidden"
        onClick={() => setOpen(true)}
        type="button"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button className="absolute inset-0 bg-slate-950/45" onClick={() => setOpen(false)} type="button" />
          <div className="absolute left-0 top-0 h-full w-[86%] max-w-sm overflow-y-auto bg-white p-4 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">FlowTask</p>
                <h2 className="text-xl font-bold text-slate-900">Menú</h2>
              </div>
              <button
                aria-label="Cerrar menú"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-900"
                onClick={() => setOpen(false)}
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="space-y-2">
              {appNavLinks.map((link) => {
                const Icon = link.icon;
                const active = pathname === link.href || (link.href !== '/app/dashboard' && pathname?.startsWith(`${link.href}/`));
                return (
                  <Link
                    key={link.href}
                    className={`flex items-center justify-between rounded-3xl border px-4 py-3 ${active ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-white'}`}
                    href={link.href}
                    onClick={() => setOpen(false)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl ${active ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-600'}`}>
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">{link.label}</p>
                        <p className="truncate text-xs text-slate-500">{link.hint}</p>
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
          </div>
        </div>
      ) : null}
    </>
  );
}
