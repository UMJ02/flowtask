"use client";

import Link from "next/link";
import { Archive, Clock3, LayoutDashboard, Settings, Users } from "lucide-react";

const railItems = [
  { label: "Pizarra", href: "/app/boards", icon: LayoutDashboard, active: true },
  { label: "Plantillas", href: "/app/boards", icon: Archive },
  { label: "Archivos", href: "/app/boards", icon: Archive },
  { label: "Actividad", href: "/app/boards", icon: Clock3 },
  { label: "Miembros", href: "/app/boards", icon: Users },
  { label: "Ajustes", href: "/app/boards", icon: Settings },
];

export function BoardWorkspaceRail() {
  return (
    <aside className="z-40 hidden h-screen w-[76px] flex-col items-center border-r border-[#E5EAF1] bg-white/95 py-4 backdrop-blur-xl lg:flex">
      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
        <LayoutDashboard className="h-5 w-5" />
      </div>
      <nav className="mt-6 flex w-full flex-1 flex-col items-center gap-2">
        {railItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`group flex w-full flex-col items-center gap-1 border-l-2 px-2 py-2 text-[10px] font-semibold transition ${item.active ? "border-emerald-500 text-emerald-700" : "border-transparent text-slate-500 hover:border-emerald-200 hover:text-emerald-700"}`}
              title={item.label}
            >
              <span className={`grid h-9 w-9 place-items-center rounded-2xl transition ${item.active ? "bg-emerald-50" : "group-hover:bg-slate-50"}`}>
                <Icon className="h-4 w-4" />
              </span>
              <span className="leading-none">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="grid h-10 w-10 place-items-center rounded-full bg-slate-900 text-xs font-bold text-white">U</div>
    </aside>
  );
}
