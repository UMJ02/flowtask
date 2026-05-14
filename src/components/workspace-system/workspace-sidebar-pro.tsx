"use client";

import Link from "next/link";
import { ArrowLeft, BarChart3, CalendarRange, Columns3, Folder, Home, Inbox, LayoutDashboard, Plus, Sparkles, Star, Table2 } from "lucide-react";
import type { WorkspaceContext, WorkspaceProjectSummary, WorkspaceSpaceSummary, WorkspaceViewId } from "@/lib/workspace-system/view-state";

function workspaceHref(params: Record<string, string | null | undefined>) {
  const next = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) next.set(key, value);
  }
  const query = next.toString();
  return query ? `/app/workspace?${query}` : "/app/workspace";
}

const viewNavigation: Array<{ view: WorkspaceViewId; label: string; icon: typeof Inbox }> = [
  { view: "home", label: "Home del proyecto", icon: Home },
  { view: "list", label: "Mi trabajo", icon: Inbox },
  { view: "board", label: "Board", icon: Columns3 },
  { view: "timeline", label: "Timeline", icon: CalendarRange },
  { view: "table", label: "Tabla operativa", icon: Table2 },
  { view: "canvas", label: "Canvas / Pizarras", icon: LayoutDashboard },
  { view: "reports", label: "Reportes", icon: BarChart3 },
];

export function WorkspaceSidebarPro({
  projects,
  spaces,
  context,
  compactHeader = false,
  onNavigate,
}: {
  projects: WorkspaceProjectSummary[];
  spaces: WorkspaceSpaceSummary[];
  context: WorkspaceContext;
  compactHeader?: boolean;
  onNavigate?: () => void;
}) {
  const visibleProjects = projects.slice(0, 8);
  const activeView = context.activeFilters?.view ?? "list";
  const activeSpace = context.activeFilters?.space ?? null;
  const activeProjectId = context.activeFilters?.projectId ?? context.projectId ?? null;
  const baseParams = { space: activeSpace, projectId: activeProjectId };

  return (
    <aside className={compactHeader ? "ft-ws-sidebar ft-ws-sidebar-fullscreen ft-ws-sidebar-mobile" : "ft-ws-sidebar ft-ws-sidebar-fullscreen"}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-[14px] bg-emerald-400/15 text-sm font-black text-emerald-300">FT</span>
          <div className="min-w-0">
            <p className="truncate text-lg font-extrabold tracking-[-.03em]">FlowTask</p>
            <p className="text-xs font-semibold text-slate-400">Workspace Pro</p>
          </div>
        </div>
        <Link href="/app/dashboard" onClick={onNavigate} className="grid h-9 w-9 place-items-center rounded-[12px] border border-white/10 bg-white/[.05] text-slate-300 transition hover:bg-white/[.09] hover:text-white" title="Volver al dashboard clásico">
          <ArrowLeft className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-5 rounded-[20px] border border-white/10 bg-white/[.06] p-3">
        <div className="flex items-start justify-between gap-3">
          <span className="min-w-0">
            <b className="block truncate text-sm">{context.workspaceName}</b>
            <span className="text-xs text-slate-400">{context.mode === "personal" ? "Modo individual" : "Organización activa"}</span>
          </span>
          <span className="rounded-full bg-emerald-400/15 px-2 py-1 text-[10px] font-black uppercase tracking-[.14em] text-emerald-200">Live</span>
        </div>
        <Link href={workspaceHref({ view: "home" })} onClick={onNavigate} className="mt-3 flex h-10 items-center justify-center rounded-[14px] bg-emerald-400/15 text-sm font-extrabold text-emerald-100 transition hover:bg-emerald-400/20">
          Todo el workspace
        </Link>
      </div>

      <div className="mt-5 flex items-center justify-between text-[11px] font-extrabold uppercase tracking-[.16em] text-slate-500">
        Vistas del proyecto <Plus className="h-4 w-4" />
      </div>
      <nav className="mt-2 space-y-1">
        {viewNavigation.map((item) => {
          const Icon = item.icon;
          const active = activeView === item.view;
          return (
            <Link key={item.view} href={workspaceHref({ ...baseParams, view: item.view })} onClick={onNavigate} className={active ? "ft-ws-sidebar-nav ft-ws-sidebar-nav-active" : "ft-ws-sidebar-nav"}>
              <Icon className="h-4 w-4" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
        <Link href="/app/boards" onClick={onNavigate} className="ft-ws-sidebar-nav">
          <LayoutDashboard className="h-4 w-4" />
          <span className="truncate">Biblioteca de pizarras</span>
        </Link>
        <Link href="/app/intelligence" onClick={onNavigate} className="ft-ws-sidebar-nav">
          <Sparkles className="h-4 w-4" />
          <span className="truncate">IA Assistant</span>
        </Link>
      </nav>

      <div className="mt-6 flex items-center justify-between text-[11px] font-extrabold uppercase tracking-[.16em] text-slate-500">
        Espacios reales / guardados <Plus className="h-4 w-4" />
      </div>
      <div className="mt-2 space-y-1">
        {spaces.length ? spaces.map((space) => {
          const isActive = activeSpace === space.slug;
          return (
            <Link key={space.id} href={workspaceHref({ view: activeView, space: space.slug })} onClick={onNavigate} className={isActive ? "ft-ws-sidebar-space ft-ws-sidebar-space-active" : "ft-ws-sidebar-space"}>
              <span className="flex min-w-0 items-center gap-2"><Folder className="h-4 w-4 shrink-0" /> <span className="truncate">{space.name}</span></span>
              <span className="text-[10px] text-slate-500">{space.taskCount + space.projectCount}</span>
            </Link>
          );
        }) : <p className="rounded-[14px] bg-white/[.04] px-3 py-3 text-xs font-semibold text-slate-400">Los espacios se generan con departamentos/clientes reales.</p>}
      </div>

      <div className="mt-6 flex items-center justify-between text-[11px] font-extrabold uppercase tracking-[.16em] text-slate-500">
        Proyectos filtrados <Plus className="h-4 w-4" />
      </div>
      <div className="mt-2 space-y-1 pb-5">
        {visibleProjects.length ? visibleProjects.map((project) => (
          <Link key={project.id} href={workspaceHref({ view: activeView, space: activeSpace, projectId: project.id })} onClick={onNavigate} className={project.id === activeProjectId ? "ft-ws-sidebar-project ft-ws-sidebar-project-active" : "ft-ws-sidebar-project"}>
            <span className="truncate">{project.title}</span>
            <Star className="h-3.5 w-3.5 text-amber-300" />
          </Link>
        )) : <p className="rounded-[14px] bg-white/[.04] px-3 py-3 text-xs font-semibold text-slate-400">No hay proyectos visibles en este filtro.</p>}
      </div>
    </aside>
  );
}
