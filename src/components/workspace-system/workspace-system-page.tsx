"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, FolderKanban, Menu, PanelRightClose, PanelRightOpen, SlidersHorizontal, X } from "lucide-react";
import type { ReportsOverview } from "@/lib/queries/reports";
import type { WorkspaceActivityItem, WorkspaceBoardSummary, WorkspaceContext, WorkspaceFileSummary, WorkspacePersistenceGuardStatus, WorkspaceProjectSpaceAssignment, WorkspaceProjectSummary, WorkspaceProjectViewPreference, WorkspaceSpaceSummary, WorkspaceTaskItem, WorkspaceViewId } from "@/lib/workspace-system/view-state";
import { BoardView } from "./views/board-view";
import { CanvasView } from "./views/canvas-view";
import { FilesView } from "./views/files-view";
import { ListView } from "./views/list-view";
import { ReportsView } from "./views/reports-view";
import { TableView } from "./views/table-view";
import { TimelineView } from "./views/timeline-view";
import { WorkspaceContextHeader } from "./workspace-context-header";
import { WorkspaceRightPanel } from "./workspace-right-panel";
import { WorkspaceSidebarPro } from "./workspace-sidebar-pro";
import { WorkspaceViewTabs } from "./workspace-view-tabs";
import { WorkspaceQuickCreate } from "./workspace-quick-create";
import { WorkspaceSavedViewsManager } from "./workspace-saved-views-manager";
import { WorkspaceSpacesManager } from "./workspace-spaces-manager";

export function WorkspaceSystemPage({
  activeView,
  tasks,
  projects,
  spaces,
  reports,
  boards,
  files,
  activity,
  projectViews,
  projectSpaceAssignments,
  persistenceStatus,
  context,
}: {
  activeView: WorkspaceViewId;
  tasks: WorkspaceTaskItem[];
  projects: WorkspaceProjectSummary[];
  spaces: WorkspaceSpaceSummary[];
  reports: ReportsOverview | null;
  boards: WorkspaceBoardSummary[];
  files: WorkspaceFileSummary[];
  activity: WorkspaceActivityItem[];
  projectViews: WorkspaceProjectViewPreference[];
  projectSpaceAssignments: WorkspaceProjectSpaceAssignment[];
  persistenceStatus: WorkspacePersistenceGuardStatus;
  context: WorkspaceContext;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusParam = context.activeFilters?.status ?? "todos";
  const groupByParam = context.activeFilters?.groupBy ?? "status";
  const sortParam = context.activeFilters?.sort ?? "updated";
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [savedViewsOpen, setSavedViewsOpen] = useState(false);
  const [spacesManagerOpen, setSpacesManagerOpen] = useState(false);

  function setWorkspaceParam(key: string, value: string, emptyValue = "") {
    const next = new URLSearchParams(searchParams.toString());
    if (value === emptyValue) next.delete(key);
    else next.set(key, value);
    if (key !== "savedViewId") next.delete("savedViewId");
    router.replace(`/app/workspace?${next.toString()}`, { scroll: false });
    router.refresh();
  }

  function setStatusFilter(status: string) {
    setWorkspaceParam("status", status, "todos");
  }

  return (
    <div className="ft-ws-shell ft-ws-fullscreen grid h-screen min-h-screen grid-cols-1 overflow-hidden lg:grid-cols-[296px_minmax(0,1fr)]">
      <div className="hidden min-w-0 lg:block">
        <WorkspaceSidebarPro projects={projects} spaces={spaces} context={context} />
      </div>

      {mobileSidebarOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm" aria-label="Cerrar menú workspace" onClick={() => setMobileSidebarOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-[min(88vw,340px)] overflow-hidden rounded-r-[28px] shadow-2xl">
            <WorkspaceSidebarPro projects={projects} spaces={spaces} context={context} compactHeader onNavigate={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      ) : null}

      <section className="min-w-0 overflow-y-auto px-4 py-4 ft-ws-scroll md:px-6 md:py-5 xl:px-7">
        <div className="mb-4 flex items-center justify-between gap-3 lg:hidden">
          <button type="button" onClick={() => setMobileSidebarOpen(true)} className="ft-ws-control h-11 px-4 text-sm font-black">
            <Menu className="h-4 w-4" /> Workspace
          </button>
          <button type="button" onClick={() => setRightPanelOpen((value) => !value)} className="ft-ws-control h-11 px-4 text-sm font-black">
            {rightPanelOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
            Resumen
          </button>
        </div>

        <WorkspaceContextHeader context={context} tasks={tasks} />

        {context.invalidProjectId ? (
          <div className="mt-4 flex items-start gap-3 rounded-[18px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>El proyecto solicitado no pertenece al workspace/espacio activo o ya no está disponible. No se muestran datos cruzados para proteger el aislamiento del workspace.</p>
          </div>
        ) : null}

        <div className="mt-5 flex flex-col gap-4 2xl:flex-row 2xl:items-center 2xl:justify-between">
          <WorkspaceViewTabs activeView={activeView} projectViews={projectViews} />
          <div className="ft-ws-action-bar flex flex-wrap items-center gap-2">
            <button className="ft-ws-control h-11 px-4 text-sm font-bold"><SlidersHorizontal className="h-4 w-4" /> Filtros</button>
            <select className="ft-ws-control h-11 px-4 text-sm font-bold" value={statusParam} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="todos">Estado: todos</option>
              <option value="en_proceso">En proceso</option>
              <option value="produccion">Producción</option>
              <option value="en_espera">En espera</option>
              <option value="pendiente">Pendiente</option>
              <option value="concluido">Concluido</option>
            </select>
            <select className="ft-ws-control h-11 px-4 text-sm font-bold" value={groupByParam} onChange={(event) => setWorkspaceParam("groupBy", event.target.value, "status")}>
              <option value="status">Agrupar: Estado</option>
              <option value="priority">Agrupar: Prioridad</option>
              <option value="project">Agrupar: Proyecto</option>
              <option value="none">Sin agrupación</option>
            </select>
            <select className="ft-ws-control h-11 px-4 text-sm font-bold" value={sortParam} onChange={(event) => setWorkspaceParam("sort", event.target.value, "updated")}>
              <option value="updated">Orden: reciente</option>
              <option value="due_date">Orden: fecha</option>
              <option value="priority">Orden: prioridad</option>
              <option value="title">Orden: título</option>
            </select>
            <button type="button" onClick={() => setSpacesManagerOpen((value) => !value)} className={context.spaceId ? "ft-ws-control h-11 border-blue-200 bg-blue-50 px-4 text-sm font-bold text-blue-700" : "ft-ws-control h-11 px-4 text-sm font-bold"}>
              <FolderKanban className="h-4 w-4" /> Espacios
            </button>
            <button type="button" onClick={() => setSavedViewsOpen((value) => !value)} className={context.activeSavedView ? "ft-ws-control h-11 border-emerald-200 bg-emerald-50 px-4 text-sm font-bold text-emerald-700" : "ft-ws-control h-11 px-4 text-sm font-bold"}>
              {context.activeSavedView ? `Vista: ${context.activeSavedView.title}` : "Vistas guardadas"}
            </button>
            <button type="button" onClick={() => setShowQuickCreate((value) => !value)} className="ft-ws-active h-11 rounded-[16px] px-5 text-sm font-extrabold">+ Nueva tarea</button>
            <button type="button" onClick={() => setRightPanelOpen((value) => !value)} className="ft-ws-control hidden h-11 px-4 text-sm font-bold 2xl:inline-flex">
              {rightPanelOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
              Panel
            </button>
          </div>
        </div>
        {showQuickCreate ? (
          <div className="mt-4">
            <WorkspaceQuickCreate context={context} projects={projects} onClose={() => setShowQuickCreate(false)} />
          </div>
        ) : null}

        {spacesManagerOpen ? (
          <div className="mt-4">
            <WorkspaceSpacesManager context={context} spaces={spaces} projects={projects} assignments={projectSpaceAssignments} persistenceStatus={persistenceStatus} onClose={() => setSpacesManagerOpen(false)} />
          </div>
        ) : null}

        {savedViewsOpen ? (
          <div className="mt-4">
            <WorkspaceSavedViewsManager activeView={activeView} context={context} projectViews={projectViews} persistenceStatus={persistenceStatus} onClose={() => setSavedViewsOpen(false)} />
          </div>
        ) : null}

        <div className={rightPanelOpen ? "mt-5 grid gap-5 2xl:grid-cols-[minmax(0,1fr)_340px]" : "mt-5 grid gap-5"}>
          <main className="min-w-0">
            {activeView === "list" ? <ListView tasks={tasks} /> : null}
            {activeView === "board" ? <BoardView tasks={tasks} /> : null}
            {activeView === "timeline" ? <TimelineView tasks={tasks} /> : null}
            {activeView === "table" ? <TableView tasks={tasks} /> : null}
            {activeView === "canvas" ? <CanvasView tasks={tasks} boards={boards} context={context} /> : null}
            {activeView === "files" ? <FilesView boards={boards} files={files} context={context} projects={projects} /> : null}
            {activeView === "reports" ? <ReportsView reports={reports} tasks={tasks} /> : null}
          </main>
          {rightPanelOpen ? (
            <div className="min-w-0">
              <div className="mb-3 flex justify-end 2xl:hidden">
                <button type="button" onClick={() => setRightPanelOpen(false)} className="ft-ws-control h-10 px-3 text-xs font-black">
                  <X className="h-4 w-4" /> Ocultar resumen
                </button>
              </div>
              <WorkspaceRightPanel tasks={tasks} projects={projects} files={files} activity={activity} projectViews={projectViews} persistenceStatus={persistenceStatus} context={context} />
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
