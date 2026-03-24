'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Bell } from 'lucide-react';
import { useNotificationsState } from '@/components/notifications/notifications-provider';
import { cn } from '@/lib/utils/classnames';

export function NotificationBell({ compact = false }: { compact?: boolean }) {
  const { unreadCount, recentToasts } = useNotificationsState();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={cn(
          'relative inline-flex items-center justify-center border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50',
          compact ? 'h-12 w-12 rounded-full shadow-sm' : 'h-11 w-11 rounded-2xl',
        )}
        aria-label="Abrir avisos"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-[calc(100%+12px)] z-50 w-[320px] rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">Avisos</p>
              <p className="mt-1 text-xs text-slate-500">Revisa lo nuevo sin salir de la pantalla.</p>
            </div>
            {unreadCount > 0 ? <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-600">{unreadCount} nuevas</span> : null}
          </div>
          <div className="mt-4 space-y-3">
            {recentToasts.length ? recentToasts.map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                {item.body ? <p className="mt-1 text-sm leading-6 text-slate-600">{item.body}</p> : null}
              </div>
            )) : <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-4 text-sm text-slate-500">No hay avisos nuevos por ahora.</p>}
          </div>
          <Link href="/app/notifications" onClick={() => setOpen(false)} className="mt-4 inline-flex text-sm font-semibold text-slate-900 hover:text-emerald-600">
            Ver todos los avisos
          </Link>
        </div>
      ) : null}
    </div>
  );
}
