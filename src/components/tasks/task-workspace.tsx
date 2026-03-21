"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { TaskKanbanBoard } from "@/components/tasks/task-kanban-board";
import { TaskList } from "@/components/tasks/task-list";
import { Button } from "@/components/ui/button";

type TaskItem = {
  id: string;
  title: string;
  status: string;
  client_name?: string | null;
  due_date?: string | null;
};

type ViewMode = "kanban" | "list" | "both";

export function TaskWorkspace({
  tasks,
  filters,
}: {
  tasks: TaskItem[];
  filters?: { q?: string; status?: string; department?: string; due?: string; view?: string };
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const view: ViewMode = useMemo(() => {
    const candidate = filters?.view ?? searchParams.get("view") ?? "both";
    return candidate === "kanban" || candidate === "list" || candidate === "both" ? candidate : "both";
  }, [filters?.view, searchParams]);

  const updateView = (next: ViewMode) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "both") {
      params.delete("view");
    } else {
      params.set("view", next);
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] bg-white p-4 shadow-soft">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Vista de trabajo</h2>
          <p className="text-sm text-slate-500">La vista queda persistida en la URL para compartir filtros y contexto.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant={view === "kanban" ? "primary" : "secondary"} onClick={() => updateView("kanban")}>Kanban</Button>
          <Button type="button" variant={view === "list" ? "primary" : "secondary"} onClick={() => updateView("list")}>Listado</Button>
          <Button type="button" variant={view === "both" ? "primary" : "secondary"} onClick={() => updateView("both")}>Ambos</Button>
        </div>
      </div>

      {(view === "kanban" || view === "both") && <TaskKanbanBoard tasks={tasks} />}

      {(view === "list" || view === "both") && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-900">Listado</h2>
          <TaskList tasks={tasks} />
        </div>
      )}
    </div>
  );
}
