"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { BarChart3, CalendarRange, Columns3, FileArchive, LayoutGrid, List, Table2 } from "lucide-react";
import type { WorkspaceProjectViewPreference, WorkspaceViewId } from "@/lib/workspace-system/view-state";

const views: Array<{ id: WorkspaceViewId; label: string; icon: typeof List }> = [
  { id: "list", label: "Lista", icon: List },
  { id: "board", label: "Board", icon: Columns3 },
  { id: "timeline", label: "Timeline", icon: CalendarRange },
  { id: "table", label: "Tabla", icon: Table2 },
  { id: "canvas", label: "Canvas", icon: LayoutGrid },
  { id: "files", label: "Archivos", icon: FileArchive },
  { id: "reports", label: "Reportes", icon: BarChart3 },
];

export function WorkspaceViewTabs({ activeView, projectViews = [] }: { activeView: WorkspaceViewId; projectViews?: WorkspaceProjectViewPreference[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const persistedByType = new Map(projectViews.map((view) => [view.viewType, view]));
  const defaultByType = new Map(projectViews.filter((view) => view.isDefault).map((view) => [view.viewType, view]));

  function setView(view: WorkspaceViewId) {
    const next = new URLSearchParams(params.toString());
    next.set("view", view);
    next.delete("savedViewId");
    router.replace(`/app/workspace?${next.toString()}`, { scroll: false });
  }

  return (
    <div className="ft-ws-tabs">
      {views.map((view) => {
        const Icon = view.icon;
        const active = activeView === view.id;
        return (
          <button key={view.id} type="button" onClick={() => setView(view.id)} className={active ? "ft-ws-tab ft-ws-tab-active" : "ft-ws-tab"}>
            <Icon className="h-4 w-4" />
            {persistedByType.get(view.id)?.title ?? view.label}
            {persistedByType.has(view.id) ? <span className={defaultByType.has(view.id) ? "ft-ws-view-saved-dot ft-ws-view-default-dot" : "ft-ws-view-saved-dot"} title={defaultByType.has(view.id) ? "Vista predeterminada" : "Vista persistida"} /> : null}
          </button>
        );
      })}
    </div>
  );
}
