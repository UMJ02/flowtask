"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Clock3, GripVertical } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { taskDetailRoute } from "@/lib/navigation/routes";

type TaskItem = {
  id: string;
  title: string;
  status: string;
  client_name?: string | null;
  due_date?: string | null;
};

const columns = [
  { value: "en_proceso", label: "En proceso", icon: Clock3 },
  { value: "en_espera", label: "En espera", icon: AlertCircle },
  { value: "concluido", label: "Concluido", icon: CheckCircle2 },
] as const;

function sortItems(items: TaskItem[]) {
  return [...items].sort((a, b) => {
    if (!a.due_date && !b.due_date) return a.title.localeCompare(b.title);
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;
    return a.due_date.localeCompare(b.due_date);
  });
}

export function TaskKanbanBoard({ tasks }: { tasks: TaskItem[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [boardTasks, setBoardTasks] = useState<TaskItem[]>(tasks);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [hoverColumn, setHoverColumn] = useState<string | null>(null);
  const [busyStatus, setBusyStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setBoardTasks(tasks);
  }, [tasks]);

  const grouped = useMemo(() => {
    return columns.map((column) => ({
      ...column,
      items: sortItems(boardTasks.filter((task) => task.status === column.value)),
    }));
  }, [boardTasks]);

  const moveTask = async (taskId: string, nextStatus: string) => {
    const currentTask = boardTasks.find((item) => item.id === taskId);
    if (!currentTask || currentTask.status === nextStatus) {
      setDraggingId(null);
      setHoverColumn(null);
      return;
    }

    const previousTasks = boardTasks;
    const nextTasks = boardTasks.map((item) => (item.id === taskId ? { ...item, status: nextStatus } : item));

    setError(null);
    setBoardTasks(nextTasks);
    setBusyStatus(`${taskId}:${nextStatus}`);

    const { error: updateError } = await supabase.from("tasks").update({ status: nextStatus }).eq("id", taskId);

    if (updateError) {
      setBoardTasks(previousTasks);
      setError("No pudimos mover la tarea. Revisa permisos o intenta de nuevo.");
    } else {
      router.refresh();
    }

    setBusyStatus(null);
    setDraggingId(null);
    setHoverColumn(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_14px_30px_rgba(15,23,42,0.06)] lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Tablero Kanban</h2>
          <p className="text-sm text-slate-500">Arrastra tareas entre columnas o usa los atajos rápidos para avanzar el trabajo sin salir del tablero.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {grouped.map((column) => {
            const Icon = column.icon;
            return (
              <span key={column.value} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">
                <Icon className="h-3.5 w-3.5" /> {column.label}: {column.items.length}
              </span>
            );
          })}
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-3">
        {grouped.map((column) => {
          const Icon = column.icon;
          const isActiveDropzone = hoverColumn === column.value;
          return (
            <div
              key={column.value}
              className={`rounded-[24px] border p-4 transition ${isActiveDropzone ? 'border-emerald-300 bg-emerald-50/60' : 'border-slate-200 bg-slate-50'}`}
              onDragOver={(event) => {
                event.preventDefault();
                setHoverColumn(column.value);
              }}
              onDragLeave={() => setHoverColumn((current) => (current === column.value ? null : current))}
              onDrop={(event) => {
                event.preventDefault();
                const taskId = event.dataTransfer.getData("text/plain");
                if (taskId) moveTask(taskId, column.value);
              }}
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-600 ring-1 ring-slate-200">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{column.label}</p>
                    <p className="text-xs text-slate-500">{column.items.length} tarea(s)</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {column.items.length ? (
                  column.items.map((task) => {
                    const saving = busyStatus?.startsWith(`${task.id}:`);
                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(event) => {
                          event.dataTransfer.setData("text/plain", task.id);
                          setDraggingId(task.id);
                        }}
                        onDragEnd={() => {
                          setDraggingId(null);
                          setHoverColumn(null);
                        }}
                        className={draggingId === task.id ? "opacity-60" : "opacity-100"}
                      >
                        <Card className="space-y-3 border border-transparent p-4 shadow-none">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="mb-2 flex items-center gap-2 text-slate-400">
                                <GripVertical className="h-4 w-4" />
                                <span className="text-[11px] font-semibold uppercase tracking-[0.16em]">Mover</span>
                              </div>
                              <Link href={taskDetailRoute(task.id)} className="font-semibold text-slate-900 hover:text-slate-700">
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
          );
        })}
      </div>
    </div>
  );
}
