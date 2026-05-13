"use client";

import { SlidersHorizontal } from "lucide-react";
import type { ReportsOverview } from "@/lib/queries/reports";
import type { WorkspaceContext, WorkspaceProjectSummary, WorkspaceTaskItem, WorkspaceViewId } from "@/lib/workspace-system/view-state";
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

export function WorkspaceSystemPage({
  activeView,
  tasks,
  projects,
  reports,
  context,
}: {
  activeView: WorkspaceViewId;
  tasks: WorkspaceTaskItem[];
  projects: WorkspaceProjectSummary[];
  reports: ReportsOverview | null;
  context: WorkspaceContext;
}) {
  return (
    <div className="ft-ws-shell -mx-5 -my-5 grid min-h-screen grid-cols-1 overflow-hidden lg:grid-cols-[280px_minmax(0,1fr)]">
      <WorkspaceSidebarPro projects={projects} context={context} />
      <section className="min-w-0 overflow-y-auto px-4 py-5 ft-ws-scroll md:px-6">
        <WorkspaceContextHeader context={context} tasks={tasks} />
        <div className="mt-5 flex flex-col gap-4 2xl:flex-row 2xl:items-center 2xl:justify-between">
          <WorkspaceViewTabs activeView={activeView} />
          <div className="flex flex-wrap items-center gap-2">
            <button className="ft-ws-control h-11 px-4 text-sm font-bold"><SlidersHorizontal className="h-4 w-4" /> Filtros</button>
            <button className="ft-ws-control h-11 px-4 text-sm font-bold">Agrupar: Estado</button>
            <button className="ft-ws-control h-11 px-4 text-sm font-bold">Personalizar</button>
            <button className="ft-ws-active h-11 rounded-[16px] px-5 text-sm font-extrabold">+ Nueva tarea</button>
          </div>
        </div>
        <div className="mt-5 grid gap-5 2xl:grid-cols-[minmax(0,1fr)_320px]">
          <main className="min-w-0">
            {activeView === "list" ? <ListView tasks={tasks} /> : null}
            {activeView === "board" ? <BoardView tasks={tasks} /> : null}
            {activeView === "timeline" ? <TimelineView tasks={tasks} /> : null}
            {activeView === "table" ? <TableView tasks={tasks} /> : null}
            {activeView === "canvas" ? <CanvasView tasks={tasks} /> : null}
            {activeView === "files" ? <FilesView /> : null}
            {activeView === "reports" ? <ReportsView reports={reports} tasks={tasks} /> : null}
          </main>
          <WorkspaceRightPanel tasks={tasks} projects={projects} />
        </div>
      </section>
    </div>
  );
}
