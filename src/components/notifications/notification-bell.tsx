"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Bell, ChevronRight } from "lucide-react";
import { useNotificationsState } from "@/components/notifications/notifications-provider";

export function NotificationBell() {
  const { unreadCount, recentItems } = useNotificationsState();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
        aria-label="Abrir avisos"
        aria-expanded={open}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-[calc(100%+12px)] z-50 w-[320px] rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_20px_40px_rgba(15,23,42,0.12)]">
          <div className="flex items-start justify-between gap-3 px-1 pb-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">Avisos</p>
              <p className="mt-1 text-xs text-slate-500">
                {unreadCount > 0 ? `Tienes ${unreadCount} aviso${unreadCount === 1 ? "" : "s"} nuevo${unreadCount === 1 ? "" : "s"}.` : "Todo está al día por ahora."}
              </p>
            </div>
            <Link href="/app/notifications" onClick={() => setOpen(false)} className="text-xs font-semibold text-emerald-700 hover:text-emerald-800">
              Ver todo
            </Link>
          </div>

          <div className="space-y-2">
            {recentItems.length ? recentItems.slice(0, 3).map((item) => (
              <Link
                key={item.id}
                href="/app/notifications"
                onClick={() => setOpen(false)}
                className="block rounded-xl border border-slate-200 px-3 py-3 transition hover:border-emerald-200 hover:bg-emerald-50/60"
              >
                <p className="truncate text-sm font-semibold text-slate-900">{item.title}</p>
                {item.body ? <p className="mt-1 line-clamp-2 text-sm text-slate-500">{item.body}</p> : null}
              </Link>
            )) : (
              <div className="rounded-xl border border-dashed border-slate-200 px-3 py-4 text-sm text-slate-500">
                Cuando llegue algo nuevo lo verás aquí, sin salir de la pantalla.
              </div>
            )}
          </div>

          <Link
            href="/app/notifications"
            onClick={() => setOpen(false)}
            className="mt-3 inline-flex w-full items-center justify-between rounded-xl border border-slate-200 px-3 py-3 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50/60"
          >
            Ir a notificaciones
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      ) : null}
    </div>
  );
}
