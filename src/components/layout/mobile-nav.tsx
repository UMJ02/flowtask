'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { LogOut, Menu, X } from 'lucide-react';
import { appNavLinks } from '@/components/layout/nav-links';
import { createClient } from '@/lib/supabase/client';

const footerHrefs = new Set([
  '/app/organization/roles',
  '/app/organization/billing',
  '/app/organization/support',
  '/app/platform',
  '/contact',
  '/app/settings',
]);

const mainNavLinks = appNavLinks.filter((link) => !footerHrefs.has(link.href));

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const groups = useMemo(() => {
    return { main: mainNavLinks };
  }, []);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  const handleLogout = async () => {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const panel = (
    <div className="fixed inset-0 z-[140] md:hidden">
      <button
        className="absolute inset-0 bg-slate-950/55 backdrop-blur-[2px]"
        onClick={() => setOpen(false)}
        type="button"
        aria-label="Cerrar menú"
      />
      <div className="absolute left-0 top-0 mt-2 flex w-[88%] max-w-sm flex-col overflow-hidden rounded-r-[32px] bg-[linear-gradient(180deg,#020617_0%,#0f172a_100%)] p-4 text-white shadow-[0_24px_60px_rgba(15,23,42,0.35)] max-h-[calc(100vh-1rem)]">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">FlowTask</p>
            <h2 className="text-xl font-bold text-white">Workspace</h2>
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

        <div className="space-y-4 overflow-y-auto pr-1">
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

          <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-2">
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex w-full items-center gap-3 rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-left transition hover:bg-white/8 disabled:opacity-60"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-rose-300">
                <LogOut className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  {loggingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}
                </p>
                <p className="truncate text-xs text-slate-300">Salir del workspace</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

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

      {mounted && open ? createPortal(panel, document.body) : null}
    </>
  );
}
