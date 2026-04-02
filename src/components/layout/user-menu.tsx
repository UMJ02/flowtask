'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { LogOut, Settings, UserCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

function getInitials(name: string, email: string) {
  const source = name?.trim() || email?.trim() || 'U';
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
}

export function UserMenu({
  fullName,
  email,
}: {
  fullName?: string | null;
  email: string;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const initials = useMemo(() => getInitials(fullName ?? '', email), [fullName, email]);
  const displayName = fullName?.trim() || 'Mi perfil';

  const handleLogout = async () => {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <>
      <Link
        href="/app/settings"
        aria-label="Abrir perfil"
        className="relative inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-left shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 md:hidden"
      >
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-950 text-sm font-bold text-white">
          {initials}
        </span>
      </Link>

      <div className="relative hidden md:block">
        <button
          type="button"
          aria-label="Abrir menú de usuario"
          onClick={() => setOpen((value) => !value)}
          className="group relative inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-left shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50"
        >
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-950 text-sm font-bold text-white">
            {initials}
          </span>
          <span className="pointer-events-none absolute -bottom-10 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-xl bg-slate-950 px-3 py-1.5 text-xs font-medium text-white shadow-lg group-hover:block">
            {email}
          </span>
        </button>

        {open ? (
          <div className="absolute right-0 top-[calc(100%+10px)] z-40 w-72 rounded-[24px] border border-slate-200 bg-white p-3 shadow-[0_24px_50px_rgba(15,23,42,0.16)]">
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-sm font-semibold text-slate-900">{displayName}</p>
              <p className="mt-1 break-all text-xs text-slate-500">{email}</p>
            </div>

            <div className="mt-3 space-y-2">
              <Link
                href="/app/settings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <UserCircle2 className="h-4 w-4 text-slate-500" />
                Ver y editar perfil
              </Link>
              <Link
                href="/app/settings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <Settings className="h-4 w-4 text-slate-500" />
                Configuración
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                disabled={loading}
                className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-medium text-rose-600 transition hover:bg-rose-50 disabled:opacity-60"
              >
                <LogOut className="h-4 w-4" />
                {loading ? 'Cerrando sesión...' : 'Cerrar sesión'}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
