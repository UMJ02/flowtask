"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useNotificationsState } from "@/components/notifications/notifications-provider";

export function NotificationBell() {
  const { unreadCount } = useNotificationsState();

  return (
    <Link
      href="/app/notifications"
      className="relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#E5EAF1] bg-white text-[#0F172A] shadow-[0_4px_14px_rgba(15,23,42,0.04)] transition-all duration-150 hover:-translate-y-0.5 hover:scale-[1.03] hover:bg-[#F7F9FC]"
      aria-label="Abrir notificaciones"
    >
      <Bell className="h-5 w-5" />
      {unreadCount > 0 ? (
        <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 animate-pulse items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white shadow-[0_0_0_4px_rgba(244,63,94,0.12)]">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      ) : null}
    </Link>
  );
}
