"use client";

import Link from "next/link";
import { useNotificationsState } from "@/components/notifications/notifications-provider";

const links = [
  { href: "/app/dashboard", label: "Dashboard" },
  { href: "/app/organization", label: "Organización" },
  { href: "/app/organization/roles", label: "Roles" },
  { href: "/app/organization/billing", label: "Facturación" },
  { href: "/app/tasks", label: "Tareas" },
  { href: "/app/completed", label: "Finalizadas" },
  { href: "/app/projects", label: "Proyectos" },
  { href: "/app/clients", label: "Clientes" },
  { href: "/app/admin", label: "Admin SaaS" },
  { href: "/app/reminders", label: "Recordatorios" },
  { href: "/app/notifications", label: "Notificaciones", isNotifications: true },
  { href: "/app/reports", label: "Reportes" },
  { href: "/contact", label: "Contacto" },
  { href: "/app/settings", label: "Configuración" },
];

export function AppSidebar() {
  const { unreadCount } = useNotificationsState();

  return (
    <aside className="rounded-[24px] bg-slate-900 p-5 text-white shadow-soft">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.22em] text-slate-400">FlowTask</p>
        <p className="mt-2 text-xl font-bold">Tu pizarra web</p>
        <p className="mt-2 text-sm text-slate-400">Personal, colaborativa y fácil de compartir.</p>
      </div>
      <nav className="space-y-2">
        {links.map((link) => (
          <Link
            key={link.href}
            className="flex items-center justify-between rounded-2xl px-3 py-2.5 text-sm font-medium text-slate-100 transition hover:bg-slate-800"
            href={link.href}
          >
            <span>{link.label}</span>
            {link.isNotifications && unreadCount > 0 ? (
              <span className="inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            ) : null}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
