"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";

interface TaskItem {
  id: string;
  title: string;
  status: string;
  client_name?: string | null;
  due_date?: string | null;
}

const columns = [
  { value: "en_proceso", label: "En proceso" },
  { value: "en_espera", label: "En espera" },
  { value: "concluido", label: "Concluido" },
] as const;

export function TaskKanbanBoard({ tasks }: { tasks: TaskItem[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [busyStatus, setBusyStatus] = useState<string | null>(null);

  const grouped = useMemo(() => {
    return columns.map((column) => ({
      ...column,
      items: tasks.filter((task) => task.status === column.value),
    }));
  }, [tasks]);

  const moveTask = async (taskId: string, nextStatus: string) => {
    setBusyStatus(`${taskId}:${nextStatus}`);
    await supabase.from("tasks").update({ status: nextStatus }).eq("id", taskId);
    setBusyStatus(null);
    setDraggingId(null);
    router.refresh();
  };

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Tablero Kanban</h2>
        <p className="text-sm text-slate-500">Arrastra tareas entre columnas para actualizar el estado al instante.</p>
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        {grouped.map((column) => (
          <div
            key={column.value}
            className="rounded-[24px] border border-slate-200 bg-slate-50 p-4"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              const taskId = event.dataTransfer.getData("text/plain");
              if (taskId) moveTask(taskId, column.value);
            }}
          >
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">{column.label}</p>
                <p className="text-xs text-slate-500">{column.items.length} tarea(s)</p>
              </div>
            </div>
            <div className="space-y-3">
              {column.items.length ? (
                column.items.map((task) => {
                  const saving = busyStatus === `${task.id}:${column.value}`;
                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(event) => {
                        event.dataTransfer.setData("text/plain", task.id);
                        setDraggingId(task.id);
                      }}
                      onDragEnd={() => setDraggingId(null)}
                      className={draggingId === task.id ? "opacity-60" : "opacity-100"}
                    >
                      <Card className="space-y-3 border border-transparent p-4 shadow-none">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <Link href={`/app/tasks/${task.id}`} className="font-semibold text-slate-900 hover:text-slate-700">
                              {task.title}
                            </Link>
                            <p className="mt-1 text-xs text-slate-500">{task.client_name || "Sin cliente"}</p>
                          </div>
                          <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 ring-1 ring-slate-200">
                            {task.due_date || "Sin fecha"}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {columns
                            .filter((option) => option.value !== task.status)
                            .map((option) => (
                              <button
                                key={option.value}
                                type="button"
                                disabled={saving}
                                onClick={() => moveTask(task.id, option.value)}
                                className="rounded-xl bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100 disabled:opacity-60"
                              >
                                Mover a {option.label}
                              </button>
                            ))}
                        </div>
                      </Card>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 px-4 py-6 text-center text-sm text-slate-500">
                  Suelta una tarea aquí.
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
