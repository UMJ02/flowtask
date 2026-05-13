"use client";

import Link from "next/link";
import { BarChart3, ChevronDown, Folder, Home, Inbox, LayoutDashboard, Plus, Sparkles, Star, Table2 } from "lucide-react";
import type { WorkspaceContext, WorkspaceProjectSummary } from "@/lib/workspace-system/view-state";

export function WorkspaceSidebarPro({ projects, context }: { projects: WorkspaceProjectSummary[]; context: WorkspaceContext }) {
  const favorites = projects.slice(0, 5);
  const spaces = ["Campañas", "Branding", "Clientes", "Producción", "Contenido"];
  return (
    <aside className="ft-ws-sidebar">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-[14px] bg-emerald-400/15 text-sm font-black text-emerald-300">FT</span>
        <div className="min-w-0">
          <p className="truncate text-lg font-extrabold tracking-[-.03em]">FlowTask</p>
          <p className="text-xs font-semibold text-slate-400">Workspace System</p>
        </div>
      </div>

      <button className="mt-5 flex w-full items-center justify-between rounded-[18px] border border-white/10 bg-white/[.06] p-3 text-left transition hover:bg-white/[.09]">
        <span className="min-w-0">
          <b className="block truncate text-sm">{context.workspaceName}</b>
          <span className="text-xs text-slate-400">{context.mode === "personal" ? "Modo individual" : "Organización"}</span>
        </span>
        <ChevronDown className="h-4 w-4 text-slate-400" />
      </button>

      <Link href="/app/workspace" className="mt-5 flex h-11 items-center gap-3 rounded-[14px] bg-emerald-400/15 px-3 text-sm font-bold text-emerald-200">
        <Home className="h-4 w-4" /> Inicio workspace
      </Link>

      <nav className="mt-2 space-y-1">
        {[
          ["Mi trabajo", Inbox, "/app/tasks"],
          ["Pizarras", LayoutDashboard, "/app/boards"],
          ["Reportes", BarChart3, "/app/reports"],
          ["Tabla operativa", Table2, "/app/workspace?view=table"],
          ["IA Assistant", Sparkles, "/app/intelligence"],
        ].map(([label, Icon, href]: any) => (
          <Link key={label} href={href} className="flex h-10 items-center gap-3 rounded-[14px] px-3 text-sm font-semibold text-slate-300 transition hover:bg-white/[.06] hover:text-white">
            <Icon className="h-4 w-4" /> {label}
          </Link>
        ))}
      </nav>

      <div className="mt-6 flex items-center justify-between text-[11px] font-extrabold uppercase tracking-[.16em] text-slate-500">
        Espacios <Plus className="h-4 w-4" />
      </div>
      <div className="mt-2 space-y-1">
        {spaces.map((space) => (
          <Link key={space} href={`/app/workspace?space=${encodeURIComponent(space)}`} className="flex h-9 w-full items-center gap-2 rounded-[12px] px-2 text-left text-sm font-semibold text-slate-300 transition hover:bg-white/[.06] hover:text-white">
            <Folder className="h-4 w-4" /> {space}
          </Link>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between text-[11px] font-extrabold uppercase tracking-[.16em] text-slate-500">
        Proyectos <Plus className="h-4 w-4" />
      </div>
      <div className="mt-2 space-y-1">
        {favorites.length ? favorites.map((project) => (
          <Link key={project.id} href={`/app/workspace?projectId=${project.id}`} className={project.id === context.projectId ? "ft-ws-sidebar-project ft-ws-sidebar-project-active" : "ft-ws-sidebar-project"}>
            <span className="truncate">{project.title}</span>
            <Star className="h-3.5 w-3.5 text-amber-300" />
          </Link>
        )) : <p className="rounded-[14px] bg-white/[.04] px-3 py-3 text-xs font-semibold text-slate-400">No hay proyectos visibles todavía.</p>}
      </div>
    </aside>
  );
}
