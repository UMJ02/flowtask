"use client";

import { useState } from "react";
import { AlertTriangle, SlidersHorizontal } from "lucide-react";
import type { ReportsOverview } from "@/lib/queries/reports";
import type { WorkspaceBoardSummary, WorkspaceContext, WorkspaceProjectSummary, WorkspaceSpaceSummary, WorkspaceTaskItem, WorkspaceViewId } from "@/lib/workspace-system/view-state";
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

export function WorkspaceSystemPage({
  activeView,
  tasks,
  projects,
  spaces,
  reports,
  boards,
  context,
}: {
  activeView: WorkspaceViewId;
  tasks: WorkspaceTaskItem[];
  projects: WorkspaceProjectSummary[];
  spaces: WorkspaceSpaceSummary[];
  reports: ReportsOverview | null;
  boards: WorkspaceBoardSummary[];
  context: WorkspaceContext;
}) {
  const statusParam = context.activeFilters?.status ?? "todos";
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  return (
    <div className="ft-ws-shell -mx-5 -my-5 grid min-h-screen grid-cols-1 overflow-hidden lg:grid-cols-[280px_minmax(0,1fr)]">
      <WorkspaceSidebarPro projects={projects} spaces={spaces} context={context} />
      <section className="min-w-0 overflow-y-auto px-4 py-5 ft-ws-scroll md:px-6">
        <WorkspaceContextHeader context={context} tasks={tasks} />

        {context.invalidProjectId ? (
          <div className="mt-4 flex items-start gap-3 rounded-[18px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>El proyecto solicitado no pertenece al workspace/espacio activo o ya no está disponible. No se muestran datos cruzados para proteger el aislamiento del workspace.</p>
          </div>
        ) : null}

        <div className="mt-5 flex flex-col gap-4 2xl:flex-row 2xl:items-center 2xl:justify-between">
          <WorkspaceViewTabs activeView={activeView} />
          <div className="flex flex-wrap items-center gap-2">
            <button className="ft-ws-control h-11 px-4 text-sm font-bold"><SlidersHorizontal className="h-4 w-4" /> Filtros</button>
            <select className="ft-ws-control h-11 px-4 text-sm font-bold" value={statusParam} onChange={(event) => {
              const next = new URLSearchParams(window.location.search);
              if (event.target.value === "todos") next.delete("status");
              else next.set("status", event.target.value);
              window.history.replaceState(null, "", `/app/workspace?${next.toString()}`);
              window.location.reload();
            }}>
              <option value="todos">Estado: todos</option>
              <option value="en_proceso">En proceso</option>
              <option value="produccion">Producción</option>
              <option value="en_espera">En espera</option>
              <option value="pendiente">Pendiente</option>
              <option value="concluido">Concluido</option>
            </select>
            <button className="ft-ws-control h-11 px-4 text-sm font-bold">Agrupar: Estado</button>
            <button className="ft-ws-control h-11 px-4 text-sm font-bold">Personalizar</button>
            <button type="button" onClick={() => setShowQuickCreate((value) => !value)} className="ft-ws-active h-11 rounded-[16px] px-5 text-sm font-extrabold">+ Nueva tarea</button>
          </div>
        </div>
        {showQuickCreate ? (
          <div className="mt-4">
            <WorkspaceQuickCreate context={context} projects={projects} onClose={() => setShowQuickCreate(false)} />
          </div>
        ) : null}

        <div className="mt-5 grid gap-5 2xl:grid-cols-[minmax(0,1fr)_320px]">
          <main className="min-w-0">
            {activeView === "list" ? <ListView tasks={tasks} /> : null}
            {activeView === "board" ? <BoardView tasks={tasks} /> : null}
            {activeView === "timeline" ? <TimelineView tasks={tasks} /> : null}
            {activeView === "table" ? <TableView tasks={tasks} /> : null}
            {activeView === "canvas" ? <CanvasView tasks={tasks} boards={boards} context={context} /> : null}
            {activeView === "files" ? <FilesView boards={boards} /> : null}
            {activeView === "reports" ? <ReportsView reports={reports} tasks={tasks} /> : null}
          </main>
          <WorkspaceRightPanel tasks={tasks} projects={projects} context={context} />
        </div>
      </section>
    </div>
  );
}
