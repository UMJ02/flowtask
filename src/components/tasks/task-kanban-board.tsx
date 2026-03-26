"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Clock3, FolderOpen, GripVertical, Loader2 } from "lucide-react";
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
  { value: "en_proceso", label: "En progreso", hint: "Lo que ya está en marcha.", icon: Clock3 },
  { value: "en_espera", label: "Pendiente", hint: "Lo que espera atención o depende de alguien.", icon: AlertCircle },
  { value: "concluido", label: "Hecho", hint: "Lo que ya quedó resuelto.", icon: CheckCircle2 },
] as const;

function sortItems(items: TaskItem[]) {
  return [...items].sort((a, b) => {
    if (!a.due_date && !b.due_date) return a.title.localeCompare(b.title);
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;
    return a.due_date.localeCompare(b.due_date);
  });
}

function formatDate(value?: string | null) {
  if (!value) return "Sin fecha";
  try {
    return new Intl.DateTimeFormat("es-CR", { day: "2-digit", month: "short" }).format(new Date(value));
  } catch {
    return "Sin fecha";
  }
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

  const normalizedTasks = useMemo(() => {
    return boardTasks.map((task) => {
      if (columns.some((column) => column.value === task.status)) return task;
      return { ...task, status: "en_espera" };
    });
  }, [boardTasks]);

  const grouped = useMemo(() => {
    return columns.map((column) => ({
      ...column,
      items: sortItems(normalizedTasks.filter((task) => task.status === column.value)),
    }));
  }, [normalizedTasks]);

  const moveTask = async (taskId: string, nextStatus: string) => {
    const currentTask = normalizedTasks.find((item) => item.id === taskId);
    if (!currentTask || currentTask.status === nextStatus) {
      setDraggingId(null);
      setHoverColumn(null);
      return;
    }

    const previousTasks = boardTasks;
    const nextTasks = normalizedTasks.map((item) => (item.id === taskId ? { ...item, status: nextStatus } : item));

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
      <Card className="rounded-[28px] p-5 shadow-[0_14px_30px_rgba(15,23,42,0.06)] md:p-6">
        <div className="space-y-5">
          <div className="max-w-2xl">
            <h2 className="text-[1.55rem] font-bold tracking-tight text-slate-900">Pizarra</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">Arrastra tareas entre columnas o usa acciones rápidas dentro de cada tarjeta.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {grouped.map((column) => {
              const Icon = column.icon;
              return (
                <span key={column.value} className="inline-flex min-h-[72px] items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{column.label}: {column.items.length}</span>
                </span>
              );
            })}
          </div>
        </div>
      </Card>

      {error ? (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-3">
        {grouped.map((column) => {
          const Icon = column.icon;
          const isActiveDropzone = hoverColumn === column.value;
          return (
            <section
              key={column.value}
              className={`rounded-[24px] border p-4 transition ${
                isActiveDropzone ? "border-emerald-300 bg-emerald-50/60" : "border-slate-200 bg-slate-50"
              }`}
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
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-600 ring-1 ring-slate-200">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-xl font-bold tracking-tight text-slate-900">{column.label}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">{column.hint}</p>
                  </div>
                </div>
                <span className="inline-flex h-10 min-w-10 items-center justify-center rounded-full bg-white px-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-200">
                  {column.items.length}
                </span>
              </div>

              <div className="space-y-3">
                {column.items.length ? (
                  column.items.map((task) => {
                    const saving = busyStatus?.startsWith(`${task.id}:`);
                    return (
                      <article
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
                        <Card className="rounded-[24px] border border-transparent p-4 shadow-none transition hover:border-slate-200">
                          <div className="space-y-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <div className="mb-3 flex flex-wrap items-center gap-2 text-slate-400">
                                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ring-1 ring-slate-200">
                                    <GripVertical className="h-3.5 w-3.5" />
                                    Mover
                                  </span>
                                  <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-slate-700 ring-1 ring-slate-200">
                                    {formatDate(task.due_date)}
                                  </span>
                                </div>
                                <Link href={taskDetailRoute(task.id)} className="block line-clamp-2 text-[1.4rem] font-bold leading-tight tracking-tight text-slate-900 transition hover:text-emerald-700">
                                  {task.title}
                                </Link>
                                <p className="mt-2 text-sm leading-6 text-slate-500">{task.client_name || "Sin cliente"}</p>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              {columns
                                .filter((option) => option.value !== task.status)
                                .map((option) => (
                                  <button
                                    key={option.value}
                                    type="button"
                                    disabled={Boolean(saving)}
                                    onClick={() => moveTask(task.id, option.value)}
                                    title={option.label}
                                    aria-label={`Mover a ${option.label}`}
                                    className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-100 disabled:opacity-60"
                                  >
                                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <option.icon className="h-4 w-4" />}
                                  </button>
                                ))}
                              <Link
                                href={taskDetailRoute(task.id)}
                                title="Abrir"
                                aria-label="Abrir tarea"
                                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 transition hover:bg-emerald-100"
                              >
                                <FolderOpen className="h-4 w-4" />
                              </Link>
                            </div>
                          </div>
                        </Card>
                      </article>
                    );
                  })
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 px-4 py-8 text-center text-sm text-slate-500">
                    Suelta una tarea aquí.
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
