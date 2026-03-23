'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Download, Menu, X } from 'lucide-react';
import { appNavLinks } from '@/components/layout/nav-links';
import { InstallAppButton } from '@/components/pwa/install-app-button';

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const groups = useMemo(() => {
    const main = appNavLinks.slice(0, 6);
    const more = appNavLinks.slice(6);
    return { main, more };
  }, []);

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
          <div className="absolute left-0 top-0 flex h-full w-[86%] max-w-sm flex-col overflow-hidden bg-[linear-gradient(180deg,#020617_0%,#0f172a_100%)] p-4 text-white shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">FlowTask</p>
                <h2 className="text-xl font-bold text-white">Menú</h2>
              </div>
              <button
                aria-label="Cerrar menú"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white"
                onClick={() => setOpen(false)}
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4 rounded-[24px] border border-white/10 bg-white/5 p-3">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-300">
                  <Download className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white">Instala la app</p>
                  <p className="mt-1 text-xs leading-5 text-slate-300">Ábrela más rápido desde tu pantalla principal.</p>
                </div>
              </div>
              <div className="mt-3">
                <InstallAppButton />
              </div>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto pr-1">
              <nav className="space-y-2 rounded-[28px] border border-white/10 bg-white/[0.03] p-2">
                {groups.main.map((link) => {
                  const Icon = link.icon;
                  const active = pathname === link.href || pathname?.startsWith(`${link.href}/`);
                  return (
                    <Link
                      key={link.href}
                      className={`flex items-center justify-between rounded-3xl border px-4 py-3 transition ${active ? 'border-emerald-400/40 bg-white/10 shadow-[0_0_0_1px_rgba(16,185,129,0.12)]' : 'border-white/10 bg-white/5 hover:bg-white/8'}`}
                      href={link.href}
                      onClick={() => setOpen(false)}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl ${active ? 'bg-emerald-500 text-white' : 'bg-white/10 text-emerald-300'}`}>
                          <Icon className="h-5 w-5" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-white">{link.label}</p>
                          <p className="truncate text-xs text-slate-300">{link.hint}</p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </nav>

              <div className="border-t border-white/10 pt-4">
                <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Cuenta y espacio</p>
                <nav className="space-y-2 rounded-[28px] border border-white/10 bg-white/[0.03] p-2">
                  {groups.more.map((link) => {
                    const Icon = link.icon;
                    const active = pathname === link.href || pathname?.startsWith(`${link.href}/`);
                    return (
                      <Link
                        key={link.href}
                        className={`flex items-center gap-3 rounded-3xl border px-4 py-3 transition ${active ? 'border-emerald-400/40 bg-white/10' : 'border-white/10 bg-white/5 hover:bg-white/8'}`}
                        href={link.href}
                        onClick={() => setOpen(false)}
                      >
                        <span className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl ${active ? 'bg-emerald-500 text-white' : 'bg-white/10 text-emerald-300'}`}>
                          <Icon className="h-5 w-5" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-white">{link.label}</p>
                          <p className="truncate text-xs text-slate-300">{link.hint}</p>
                        </div>
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
