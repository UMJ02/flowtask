"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useNotificationsState } from "@/components/notifications/notifications-provider";

export function NotificationBell() {
  const { unreadCount } = useNotificationsState();

  return (
    <Link href="/app/notifications" className="group relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#E5EAF1] bg-white text-slate-700 shadow-[0_8px_18px_rgba(15,23,42,.035)] transition hover:scale-[1.04] hover:border-emerald-100 hover:bg-emerald-50 hover:text-[#0F172A]" aria-label="Abrir notificaciones">
      <Bell className="h-5 w-5 transition group-hover:-rotate-6" />
      {unreadCount > 0 ? (
        <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 animate-[pulse_1.8s_ease-in-out_infinite] items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white shadow-[0_0_0_3px_rgba(244,63,94,.12)]">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      ) : null}
    </Link>
  );
}
