"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useNotificationsState } from "@/components/notifications/notifications-provider";

export function NotificationBell() {
  const { unreadCount } = useNotificationsState();

  return (
    <Link
      href="/app/notifications"
      className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
      aria-label="Abrir notificaciones"
    >
      <Bell className="h-5 w-5" />
      {unreadCount > 0 ? (
        <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      ) : null}
    </Link>
  );
}
