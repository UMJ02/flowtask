"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Clock3, FolderOpen, GripVertical, Loader2 } from "lucide-react";
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
  { value: "en_proceso", label: "En progreso", icon: Clock3 },
  { value: "en_espera", label: "Pendiente", icon: AlertCircle },
  { value: "concluido", label: "Hecho", icon: CheckCircle2 },
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

export function TaskKanbanBoard({ tasks, showHeader = true }: { tasks: TaskItem[]; showHeader?: boolean }) {
  const supabase = createClient();
  const serverSignature = useMemo(() => tasks.map((task) => `${task.id}:${task.status}:${task.due_date ?? ""}:${task.title}`).join("|"), [tasks]);
  const [boardTasks, setBoardTasks] = useState<TaskItem[]>(tasks);
  const [lastServerSignature, setLastServerSignature] = useState(serverSignature);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [hoverColumn, setHoverColumn] = useState<string | null>(null);
  const [busyStatus, setBusyStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (serverSignature !== lastServerSignature) {
      setBoardTasks(tasks);
      setLastServerSignature(serverSignature);
    }
  }, [lastServerSignature, serverSignature, tasks]);

  const normalizedTasks = useMemo(() => {
    return boardTasks.map((task) => {
      if (columns.some((column) => column.value === task.status)) return task;
      return { ...task, status: "en_espera" };
    });
  }, [boardTasks]);

  const grouped = useMemo(() => {
    return columns.map((column) => ({
      ...column,
      items: sortItems(normalizedTasks.filter((task) => task.status === column.value)).slice(0, 5),
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
      setLastServerSignature(nextTasks.map((task) => `${task.id}:${task.status}:${task.due_date ?? ""}:${task.title}`).join("|"));
    }

    setBusyStatus(null);
    setDraggingId(null);
    setHoverColumn(null);
  };

  return (
    <div className="space-y-4">
      {showHeader ? (
        <Card className="rounded-[28px] border border-slate-200/90 p-5 shadow-[0_14px_30px_rgba(15,23,42,0.05)] md:p-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Pizarra</p>
              <h2 className="mt-2 text-[1.55rem] font-bold tracking-tight text-slate-900">Flujo</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[560px] xl:grid-cols-3">
              {grouped.map((column) => {
                const Icon = column.icon;
                return (
                  <span key={column.value} className="inline-flex min-h-[72px] items-center justify-center gap-2.5 rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{column.label}: {column.items.length}</span>
                  </span>
                );
              })}
            </div>
          </div>
        </Card>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-3">
        {grouped.map((column) => {
          const Icon = column.icon;
          const isActiveDropzone = hoverColumn === column.value;
          return (
            <section
              key={column.value}
              className={`rounded-[24px] border p-4 transition ${
                isActiveDropzone ? "border-emerald-300 bg-emerald-50/60 shadow-[0_12px_28px_rgba(16,185,129,0.08)]" : "border-slate-200 bg-slate-50/90"
              }`}
              onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = "move";
                setHoverColumn(column.value);
              }}
              onDragLeave={() => setHoverColumn((current) => (current === column.value ? null : current))}
              onDrop={(event) => {
                event.preventDefault();
                const taskId = event.dataTransfer.getData("text/task-id") || event.dataTransfer.getData("text/plain");
                if (taskId) moveTask(taskId, column.value);
              }}
            >
              <div className="mb-3 flex items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-600 ring-1 ring-slate-200">
                    <Icon className="h-4 w-4" />
                  </span>
                  <p className="text-[1.2rem] font-bold tracking-tight text-slate-900 md:text-[1.35rem]">{column.label}</p>
                </div>
                <span className="inline-flex h-10 min-w-10 items-center justify-center rounded-full bg-white px-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                  {column.items.length}
                </span>
              </div>

              <div className="space-y-2.5">
                {column.items.length ? (
                  column.items.map((task) => {
                    const saving = busyStatus?.startsWith(`${task.id}:`);
                    return (
                      <article
                        key={task.id}
                        draggable
                        onDragStart={(event) => {
                          event.dataTransfer.effectAllowed = "move";
                          event.dataTransfer.setData("text/task-id", task.id);
                          event.dataTransfer.effectAllowed = "move";
                          event.dataTransfer.setData("application/x-flowtask-task-id", task.id);
                          event.dataTransfer.setData("text/plain", task.id);
                          setDraggingId(task.id);
                        }}
                        onDragEnd={() => {
                          setDraggingId(null);
                          setHoverColumn(null);
                        }}
                        className={draggingId === task.id ? "opacity-60" : "opacity-100"}
                      >
                        <Card className="rounded-[20px] border border-white/70 bg-white/95 p-3 shadow-[0_6px_18px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-slate-200 hover:shadow-[0_14px_26px_rgba(15,23,42,0.08)]">
                          <div className="space-y-3">
                            <div className="flex items-start gap-3">
                              <span
                                title="Arrastrar"
                                aria-label="Arrastrar tarea"
                                className="inline-flex h-9 w-9 shrink-0 cursor-grab items-center justify-center rounded-2xl bg-slate-50 text-slate-400 ring-1 ring-slate-200 active:cursor-grabbing"
                              >
                                <GripVertical className="h-4 w-4" />
                              </span>
                              <div className="min-w-0 flex-1">
                                <Link href={taskDetailRoute(task.id)} className="block line-clamp-2 text-[1.02rem] font-bold leading-tight tracking-tight text-slate-900 transition hover:text-emerald-700">
                                  {task.title}
                                </Link>
                              </div>
                            </div>

                            <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-2">
                              <span className="inline-flex shrink-0 items-center rounded-full bg-white px-2.5 py-1 text-[12px] font-semibold text-slate-700 ring-1 ring-slate-200">
                                {formatDate(task.due_date)}
                              </span>
                              <div className="flex items-center gap-1.5">
                                {columns
                                  .filter((option) => option.value !== task.status)
                                  .map((option) => (
                                    <button
                                      key={option.value}
                                      type="button"
                                      onClick={() => moveTask(task.id, option.value)}
                                      disabled={Boolean(saving)}
                                      title={option.label}
                                      aria-label={`Mover a ${option.label}`}
                                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-100 disabled:opacity-60"
                                    >
                                      {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <option.icon className="h-3.5 w-3.5" />}
                                    </button>
                                  ))}
                                <Link
                                  href={taskDetailRoute(task.id)}
                                  title="Abrir"
                                  aria-label="Abrir tarea"
                                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 transition hover:bg-emerald-100"
                                >
                                  <FolderOpen className="h-3.5 w-3.5" />
                                </Link>
                              </div>
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
