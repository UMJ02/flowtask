"use client";

import { useEffect, useState } from "react";
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
const STORAGE_KEY = "flowtask.tasks.view";

export function TaskWorkspace({ tasks }: { tasks: TaskItem[] }) {
  const [view, setView] = useState<ViewMode>("both");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY) as ViewMode | null;
    if (saved === "kanban" || saved === "list" || saved === "both") setView(saved);
  }, []);

  const updateView = (next: ViewMode) => {
    setView(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] bg-white p-4 shadow-soft">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Vista de trabajo</h2>
          <p className="text-sm text-slate-500">Cambia entre Kanban, listado o ambos. Se guarda en este navegador.</p>
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
