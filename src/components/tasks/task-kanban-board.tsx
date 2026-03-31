"use client";

import { useEffect, useMemo, useState } from "react";

import Link from "next/link";
import { AlertCircle, CheckCircle2, ChevronDown, ChevronUp, Clock3, FolderOpen, GripVertical, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { taskDetailRoute } from "@/lib/navigation/routes";

export type TaskItem = {
  id: string;
  title: string;
  status: string;
  priority?: string | null;
  client_name?: string | null;
  due_date?: string | null;
};

type LayoutConfigShape = {
  kanbanStatusOverrides?: Record<string, string>;
  kanbanOrderOverrides?: Record<string, string[]>;
};

const columns = [
  { value: "en_proceso", label: "En progreso", icon: Clock3 },
  { value: "en_espera", label: "Pendiente", icon: AlertCircle },
  { value: "concluido", label: "Hecho", icon: CheckCircle2 },
] as const;

const STATUS_OVERRIDES_KEY = "flowtask.board.kanban.status-overrides.v1";
const ORDER_OVERRIDES_KEY = "flowtask.board.kanban.order-overrides.v1";
const DEFAULT_VISIBLE_COUNT = 5;

function readStatusOverrides() {
  if (typeof window === "undefined") return {} as Record<string, string>;
  try {
    const raw = window.localStorage.getItem(STATUS_OVERRIDES_KEY);
    if (!raw) return {} as Record<string, string>;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {} as Record<string, string>;
    return parsed as Record<string, string>;
  } catch {
    return {} as Record<string, string>;
  }
}

function writeStatusOverrides(value: Record<string, string>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STATUS_OVERRIDES_KEY, JSON.stringify(value));
  } catch {}
}

function readOrderOverrides() {
  if (typeof window === "undefined") return {} as Record<string, string[]>;
  try {
    const raw = window.localStorage.getItem(ORDER_OVERRIDES_KEY);
    if (!raw) return {} as Record<string, string[]>;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {} as Record<string, string[]>;
    return parsed as Record<string, string[]>;
  } catch {
    return {} as Record<string, string[]>;
  }
}

function writeOrderOverrides(value: Record<string, string[]>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ORDER_OVERRIDES_KEY, JSON.stringify(value));
  } catch {}
}

function applyStatusOverrides(items: TaskItem[], overrides: Record<string, string>) {
  return items.map((task) => {
    const override = overrides[task.id];
    return override ? { ...task, status: override } : task;
  });
}

function sortItems(items: TaskItem[], orderedIds: string[] = []) {
  const rank = new Map(orderedIds.map((id, index) => [id, index]));
  return [...items].sort((a, b) => {
    const aRank = rank.has(a.id) ? rank.get(a.id)! : Number.MAX_SAFE_INTEGER;
    const bRank = rank.has(b.id) ? rank.get(b.id)! : Number.MAX_SAFE_INTEGER;
    if (aRank !== bRank) return aRank - bRank;
    if (!a.due_date && !b.due_date) return a.title.localeCompare(b.title);
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;
    const byDate = a.due_date.localeCompare(b.due_date);
    return byDate !== 0 ? byDate : a.title.localeCompare(b.title);
  });
}

function formatDate(value?: string | null) {
  if (!value) return "Sin fecha";
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return value;
  const [, year, month, day] = match;
  const months = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  const monthIndex = Number(month) - 1;
  if (monthIndex < 0 || monthIndex > 11) return `${day}-${month}`;
  return `${day}-${months[monthIndex]}`;
}

function normalizeOrderValue(value: unknown): Record<string, string[]> {
  if (!value || typeof value !== "object") return {};
  const next: Record<string, string[]> = {};
  for (const column of columns) {
    const current = (value as Record<string, unknown>)[column.value];
    next[column.value] = Array.isArray(current) ? current.filter((item): item is string => typeof item === "string") : [];
  }
  return next;
}

function normalizeStatusValue(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object") return {};
  const next: Record<string, string> = {};
  for (const [taskId, status] of Object.entries(value as Record<string, unknown>)) {
    if (typeof taskId === "string" && typeof status === "string") next[taskId] = status;
  }
  return next;
}

function mergeOrderOverrides(...values: Array<Record<string, string[]>>) {
  const next: Record<string, string[]> = {};
  for (const column of columns) {
    const seen = new Set<string>();
    next[column.value] = [];
    for (const value of values) {
      const current = Array.isArray(value[column.value]) ? value[column.value] : [];
      for (const item of current) {
        if (!seen.has(item)) {
          seen.add(item);
          next[column.value].push(item);
        }
      }
    }
  }
  return next;
}

function buildNextOrderOverrides(
  value: Record<string, string[]>,
  taskId: string,
  nextStatus: string,
  beforeTaskId?: string | null,
) {
  const next: Record<string, string[]> = {};
  for (const column of columns) {
    const current = Array.isArray(value[column.value]) ? value[column.value] : [];
    next[column.value] = current.filter((id) => id !== taskId);
  }

  const target = [...(next[nextStatus] ?? [])];
  if (beforeTaskId && target.includes(beforeTaskId)) {
    const targetIndex = target.indexOf(beforeTaskId);
    target.splice(targetIndex, 0, taskId);
  } else {
    target.unshift(taskId);
  }
  next[nextStatus] = target;
  return next;
}

async function readBoardLayoutConfig(supabase: ReturnType<typeof createClient>) {
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData.user?.id;
  if (!userId) return null;

  const { data, error } = await supabase
    .from("boards")
    .select("id, layout_config")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return null;
  return { id: data.id as string, layoutConfig: (data.layout_config ?? {}) as LayoutConfigShape };
}

async function persistBoardLayoutConfig(
  supabase: ReturnType<typeof createClient>,
  statusOverrides: Record<string, string>,
  orderOverrides: Record<string, string[]>,
) {
  const board = await readBoardLayoutConfig(supabase);
  if (!board?.id) return;

  const nextLayoutConfig: LayoutConfigShape = {
    ...board.layoutConfig,
    kanbanStatusOverrides: statusOverrides,
    kanbanOrderOverrides: orderOverrides,
  };

  await supabase.from("boards").update({ layout_config: nextLayoutConfig }).eq("id", board.id);
}

export function TaskKanbanBoard({ tasks, showHeader = true, currentQuery }: { tasks: TaskItem[]; showHeader?: boolean; currentQuery?: string }) {
  const supabase = createClient();
  const serverSignature = useMemo(() => tasks.map((task) => `${task.id}:${task.status}:${task.priority ?? ''}:${task.due_date ?? ''}:${task.title}`).join('|'), [tasks]);
  const [hydrated, setHydrated] = useState(false);
  const [statusOverrides, setStatusOverrides] = useState<Record<string, string>>({});
  const [orderOverrides, setOrderOverrides] = useState<Record<string, string[]>>({});
  const [boardTasks, setBoardTasks] = useState<TaskItem[]>(tasks);
  const [lastServerSignature, setLastServerSignature] = useState(serverSignature);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [hoverColumn, setHoverColumn] = useState<string | null>(null);
  const [hoverTaskId, setHoverTaskId] = useState<string | null>(null);
  const [busyStatus, setBusyStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recentDropColumn, setRecentDropColumn] = useState<string | null>(null);
  const [expandedColumns, setExpandedColumns] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    let active = true;

    const syncBoardConfig = async () => {
      const board = await readBoardLayoutConfig(supabase);
      if (!active || !board) return;

      const dbStatusOverrides = normalizeStatusValue(board.layoutConfig.kanbanStatusOverrides);
      const dbOrderOverrides = normalizeOrderValue(board.layoutConfig.kanbanOrderOverrides);
      const localStatusOverrides = readStatusOverrides();
      const localOrderOverrides = readOrderOverrides();

      const mergedStatusOverrides = { ...dbStatusOverrides, ...localStatusOverrides };
      const mergedOrderOverrides = mergeOrderOverrides(dbOrderOverrides, localOrderOverrides);

      setStatusOverrides(mergedStatusOverrides);
      setOrderOverrides(mergedOrderOverrides);
      setBoardTasks(applyStatusOverrides(tasks, mergedStatusOverrides));
      writeStatusOverrides(mergedStatusOverrides);
      writeOrderOverrides(mergedOrderOverrides);
    };

    void syncBoardConfig();

    return () => {
      active = false;
    };
  }, [hydrated, serverSignature, supabase, tasks]);

  useEffect(() => {
    if (!hydrated || !recentDropColumn) return;
    const timer = window.setTimeout(() => setRecentDropColumn(null), 1200);
    return () => window.clearTimeout(timer);
  }, [recentDropColumn]);

  useEffect(() => {
    if (!hydrated) return;
    if (serverSignature !== lastServerSignature) {
      setBoardTasks(applyStatusOverrides(tasks, statusOverrides));
      setLastServerSignature(serverSignature);
    }
  }, [hydrated, lastServerSignature, serverSignature, statusOverrides, tasks]);

  const normalizedTasks = useMemo(() => {
    return boardTasks.map((task) => {
      if (columns.some((column) => column.value === task.status)) return task;
      return { ...task, status: "en_espera" };
    });
  }, [boardTasks]);

  const grouped = useMemo(() => {
    return columns.map((column) => {
      const orderedItems = sortItems(normalizedTasks.filter((task) => task.status === column.value), orderOverrides[column.value] ?? []);
      const expanded = expandedColumns[column.value] ?? false;
      return {
        ...column,
        allItems: orderedItems,
        items: expanded ? orderedItems : orderedItems.slice(0, DEFAULT_VISIBLE_COUNT),
        hiddenCount: Math.max(orderedItems.length - DEFAULT_VISIBLE_COUNT, 0),
        expanded,
      };
    });
  }, [expandedColumns, normalizedTasks, orderOverrides]);

  if (!hydrated) {
    return (
      <div className="grid gap-4 xl:grid-cols-3">
        {columns.map((column) => {
          const Icon = column.icon;
          return (
            <Card key={column.value} className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-[0_16px_36px_rgba(15,23,42,0.04)]">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-slate-200 text-slate-500"><Icon className="h-7 w-7" /></span>
                  <h3 className="text-2xl font-bold tracking-tight text-slate-950">{column.label}</h3>
                </div>
                <span className="inline-flex h-14 min-w-14 items-center justify-center rounded-full border border-slate-200 px-4 text-xl font-semibold text-slate-700">0</span>
              </div>
            </Card>
          );
        })}
      </div>
    );
  }

  const persistLayout = async (nextStatusOverrides: Record<string, string>, nextOrderOverrides: Record<string, string[]>) => {
    writeStatusOverrides(nextStatusOverrides);
    writeOrderOverrides(nextOrderOverrides);
    await persistBoardLayoutConfig(supabase, nextStatusOverrides, nextOrderOverrides);
  };

  const moveTask = async (taskId: string, nextStatus: string, beforeTaskId?: string | null) => {
    const currentTask = normalizedTasks.find((item) => item.id === taskId);
    if (!currentTask) {
      setDraggingId(null);
      setHoverColumn(null);
      setHoverTaskId(null);
      return;
    }

    const previousTasks = boardTasks;
    const previousStatusOverrides = statusOverrides;
    const previousOrderOverrides = orderOverrides;
    const nextTasks = normalizedTasks.map((item) => (item.id === taskId ? { ...item, status: nextStatus } : item));
    const nextStatusOverrides = { ...statusOverrides, [taskId]: nextStatus };
    const nextOrderOverrides = buildNextOrderOverrides(orderOverrides, taskId, nextStatus, beforeTaskId);

    setError(null);
    setBoardTasks(nextTasks);
    setStatusOverrides(nextStatusOverrides);
    setOrderOverrides(nextOrderOverrides);
    setBusyStatus(`${taskId}:${nextStatus}`);
    setRecentDropColumn(nextStatus);

    try {
      if (currentTask.status !== nextStatus) {
        const { error: updateError } = await supabase.from("tasks").update({ status: nextStatus }).eq("id", taskId);
        if (updateError) throw updateError;
      }

      await persistLayout(nextStatusOverrides, nextOrderOverrides);
      setLastServerSignature(nextTasks.map((task) => `${task.id}:${task.status}:${task.due_date ?? ""}:${task.title}`).join("|"));
    } catch {
      setBoardTasks(previousTasks);
      setStatusOverrides(previousStatusOverrides);
      setOrderOverrides(previousOrderOverrides);
      writeStatusOverrides(previousStatusOverrides);
      writeOrderOverrides(previousOrderOverrides);
      setError("No pudimos guardar el movimiento u orden de la tarea. Revisa permisos o intenta de nuevo.");
    }

    setBusyStatus(null);
    setDraggingId(null);
    setHoverColumn(null);
    setHoverTaskId(null);
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
                    <span>{column.label}: {column.allItems.length}</span>
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
          const isRecentDrop = recentDropColumn === column.value;
          return (
            <section
              key={column.value}
              className={`rounded-[24px] border p-4 transition ${
                isActiveDropzone || isRecentDrop ? "border-emerald-300 bg-emerald-50/60 shadow-[0_12px_28px_rgba(16,185,129,0.08)]" : "border-slate-200 bg-slate-50/90"
              }`}
              onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = "move";
                setHoverColumn(column.value);
              }}
              onDragLeave={() => setHoverColumn((current) => (current === column.value ? null : current))}
              onDrop={(event) => {
                event.preventDefault();
                const taskId = event.dataTransfer.getData("text/task-id") || event.dataTransfer.getData("application/x-flowtask-task-id") || event.dataTransfer.getData("text/plain");
                if (taskId) void moveTask(taskId, column.value);
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
                  {column.allItems.length}
                </span>
              </div>

              <div className="space-y-2.5">
                {column.items.length ? (
                  column.items.map((task) => {
                    const saving = busyStatus?.startsWith(`${task.id}:`);
                    const isHoverCard = hoverTaskId === task.id;
                    return (
                      <article
                        key={task.id}
                        draggable
                        onDragStart={(event) => {
                          event.dataTransfer.effectAllowed = "move";
                          event.dataTransfer.setData("text/task-id", task.id);
                          event.dataTransfer.setData("application/x-flowtask-task-id", task.id);
                          event.dataTransfer.setData("text/plain", task.id);
                          setDraggingId(task.id);
                        }}
                        onDragEnd={() => {
                          setDraggingId(null);
                          setHoverColumn(null);
                          setHoverTaskId(null);
                        }}
                        onDragOver={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          setHoverColumn(column.value);
                          setHoverTaskId(task.id);
                        }}
                        onDragLeave={(event) => {
                          event.stopPropagation();
                          setHoverTaskId((current) => (current === task.id ? null : current));
                        }}
                        onDrop={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          const taskId = event.dataTransfer.getData("text/task-id") || event.dataTransfer.getData("application/x-flowtask-task-id") || event.dataTransfer.getData("text/plain");
                          if (taskId) void moveTask(taskId, column.value, task.id);
                        }}
                        className={draggingId === task.id ? "opacity-60" : "opacity-100"}
                      >
                        <Card className={`rounded-[20px] border bg-white/95 p-3 shadow-[0_6px_18px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_26px_rgba(15,23,42,0.08)] ${
                          isHoverCard ? "border-emerald-300 ring-2 ring-emerald-100" : "border-white/70 hover:border-slate-200"
                        }`}>
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
                                <Link href={taskDetailRoute(task.id, currentQuery)} className="block line-clamp-2 text-[1.02rem] font-bold leading-tight tracking-tight text-slate-900 transition hover:text-emerald-700">
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
                                      onClick={() => void moveTask(task.id, option.value)}
                                      disabled={Boolean(saving)}
                                      title={option.label}
                                      aria-label={`Mover a ${option.label}`}
                                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-100 disabled:opacity-60"
                                    >
                                      {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <option.icon className="h-3.5 w-3.5" />}
                                    </button>
                                  ))}
                                <Link
                                  href={taskDetailRoute(task.id, currentQuery)}
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
                    {isActiveDropzone ? "Suelta para moverla aquí." : "Suelta una tarea aquí."}
                  </div>
                )}

                {column.hiddenCount > 0 ? (
                  <button
                    type="button"
                    onClick={() => setExpandedColumns((current) => ({ ...current, [column.value]: !column.expanded }))}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    {column.expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    {column.expanded ? "Ver menos" : `Ver más (${column.hiddenCount})`}
                  </button>
                ) : null}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
