"use client";

import { memo, useEffect, useMemo, useState } from "react";

import Link from "next/link";
import { AlertCircle, CheckCircle2, ChevronDown, ChevronUp, Clock3, FolderOpen, GripVertical, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { taskDetailRoute } from "@/lib/navigation/routes";
import { getTaskStatusUpdatePayload, todayIsoDate } from "@/lib/tasks/status";

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
  [key: string]: unknown;
};

type TaskKanbanBoardProps = {
  tasks: TaskItem[];
  showHeader?: boolean;
  currentQuery?: string;
  workspaceKey?: string;
};

function getScopedLayoutKey(base: keyof LayoutConfigShape, workspaceKey: string) {
  return `${String(base)}:${workspaceKey}`;
}

const columns = [
  { value: "en_proceso", label: "En progreso", icon: Clock3 },
  { value: "en_espera", label: "En espera", icon: AlertCircle },
  { value: "concluido", label: "Hecho", icon: CheckCircle2 },
] as const;

const STATUS_OVERRIDES_KEY = "flowtask.board.kanban.status-overrides.v1";
const ORDER_OVERRIDES_KEY = "flowtask.board.kanban.order-overrides.v1";

function getScopedKey(base: string, workspaceKey: string) {
  return `${base}:${workspaceKey}`;
}
const DEFAULT_VISIBLE_COUNT = 5;

function readStatusOverrides(workspaceKey: string) {
  if (typeof window === "undefined") return {} as Record<string, string>;
  try {
    const raw = window.localStorage.getItem(getScopedKey(STATUS_OVERRIDES_KEY, workspaceKey));
    if (!raw) return {} as Record<string, string>;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {} as Record<string, string>;
    return parsed as Record<string, string>;
  } catch {
    return {} as Record<string, string>;
  }
}

function writeStatusOverrides(workspaceKey: string, value: Record<string, string>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(getScopedKey(STATUS_OVERRIDES_KEY, workspaceKey), JSON.stringify(value));
  } catch {}
}

function readOrderOverrides(workspaceKey: string) {
  if (typeof window === "undefined") return {} as Record<string, string[]>;
  try {
    const raw = window.localStorage.getItem(getScopedKey(ORDER_OVERRIDES_KEY, workspaceKey));
    if (!raw) return {} as Record<string, string[]>;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {} as Record<string, string[]>;
    return parsed as Record<string, string[]>;
  } catch {
    return {} as Record<string, string[]>;
  }
}

function writeOrderOverrides(workspaceKey: string, value: Record<string, string[]>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(getScopedKey(ORDER_OVERRIDES_KEY, workspaceKey), JSON.stringify(value));
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
  workspaceKey: string,
  statusOverrides: Record<string, string>,
  orderOverrides: Record<string, string[]>,
) {
  const board = await readBoardLayoutConfig(supabase);
  if (!board?.id) return;

  const nextLayoutConfig: LayoutConfigShape = {
    ...board.layoutConfig,
    [getScopedLayoutKey("kanbanStatusOverrides", workspaceKey)]: statusOverrides,
    [getScopedLayoutKey("kanbanOrderOverrides", workspaceKey)]: orderOverrides,
  };

  await supabase.from("boards").update({ layout_config: nextLayoutConfig }).eq("id", board.id);
}

function TaskKanbanBoardComponent({ tasks, showHeader = true, currentQuery, workspaceKey = "personal" }: TaskKanbanBoardProps) {
  const supabase = useMemo(() => createClient(), []);
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
  }, [workspaceKey]);

  useEffect(() => {
    if (!hydrated) return;
    let active = true;

    const syncBoardConfig = async () => {
      const board = await readBoardLayoutConfig(supabase);
      if (!active || !board) return;

      const dbStatusOverrides = normalizeStatusValue(board.layoutConfig[getScopedLayoutKey("kanbanStatusOverrides", workspaceKey)] ?? board.layoutConfig.kanbanStatusOverrides);
      const dbOrderOverrides = normalizeOrderValue(board.layoutConfig[getScopedLayoutKey("kanbanOrderOverrides", workspaceKey)] ?? board.layoutConfig.kanbanOrderOverrides);
      const localStatusOverrides = readStatusOverrides(workspaceKey);
      const localOrderOverrides = readOrderOverrides(workspaceKey);

      const mergedStatusOverrides = { ...dbStatusOverrides, ...localStatusOverrides };
      const mergedOrderOverrides = mergeOrderOverrides(dbOrderOverrides, localOrderOverrides);

      setStatusOverrides(mergedStatusOverrides);
      setOrderOverrides(mergedOrderOverrides);
      setBoardTasks(applyStatusOverrides(tasks, mergedStatusOverrides));
      writeStatusOverrides(workspaceKey, mergedStatusOverrides);
      writeOrderOverrides(workspaceKey, mergedOrderOverrides);
    };

    void syncBoardConfig();

    return () => {
      active = false;
    };
  }, [hydrated, serverSignature, supabase, tasks, workspaceKey]);

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
      <div className="grid gap-3 xl:grid-cols-3">
        {columns.map((column) => {
          const Icon = column.icon;
          return (
            <Card key={column.value} className="rounded-[20px] border border-slate-200/85 bg-white p-4 shadow-[0_14px_30px_rgba(15,23,42,0.045)]">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200/90 text-slate-500 bg-slate-50"><Icon className="h-7 w-7" /></span>
                  <h3 className="text-2xl font-bold tracking-tight text-slate-950">{column.label}</h3>
                </div>
                <span className="inline-flex h-11 min-w-11 items-center justify-center rounded-2xl border border-slate-200/90 px-3 text-lg font-semibold text-slate-700 bg-white">0</span>
              </div>
            </Card>
          );
        })}
      </div>
    );
  }

  const persistLayout = async (nextStatusOverrides: Record<string, string>, nextOrderOverrides: Record<string, string[]>) => {
    writeStatusOverrides(workspaceKey, nextStatusOverrides);
    writeOrderOverrides(workspaceKey, nextOrderOverrides);
    await persistBoardLayoutConfig(supabase, workspaceKey, nextStatusOverrides, nextOrderOverrides);
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
    const nextTasks = normalizedTasks.map((item) => (item.id === taskId ? { ...item, status: nextStatus, due_date: nextStatus === "en_proceso" || nextStatus === "concluido" ? todayIsoDate() : item.due_date } : item));
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
        const { error: updateError } = await supabase.from("tasks").update(getTaskStatusUpdatePayload(nextStatus, currentTask.due_date ?? null)).eq("id", taskId);
        if (updateError) throw updateError;
      }

      await persistLayout(nextStatusOverrides, nextOrderOverrides);
      setLastServerSignature(nextTasks.map((task) => `${task.id}:${task.status}:${task.due_date ?? ""}:${task.title}`).join("|"));
    } catch {
      setBoardTasks(previousTasks);
      setStatusOverrides(previousStatusOverrides);
      setOrderOverrides(previousOrderOverrides);
      writeStatusOverrides(workspaceKey, previousStatusOverrides);
      writeOrderOverrides(workspaceKey, previousOrderOverrides);
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
        <Card className="rounded-[18px] border border-slate-200/85 p-4 shadow-[0_14px_28px_rgba(15,23,42,0.05)] md:p-4.5">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Pizarra</p>
              <h2 className="mt-2 text-[1.55rem] font-bold tracking-tight text-slate-900">Flujo</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[560px] xl:grid-cols-3">
              {grouped.map((column) => {
                const Icon = column.icon;
                return (
                  <span key={column.value} className="inline-flex min-h-[60px] items-center justify-center gap-2 rounded-[16px] border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-semibold text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
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

      <div className="grid gap-3 xl:grid-cols-3">
        {grouped.map((column) => {
          const isActiveDropzone = hoverColumn === column.value;
          const isRecentDrop = recentDropColumn === column.value;
          return (
            <section
              key={column.value}
              className={`rounded-[18px] border p-3 transition ${
                isActiveDropzone || isRecentDrop ? "border-emerald-300 bg-emerald-50/60 shadow-[0_12px_28px_rgba(16,185,129,0.08)]" : column.value === "en_proceso" ? "border-[#BFDBFE] bg-[linear-gradient(180deg,#F8FBFF,#FFFFFF)]" : column.value === "en_espera" ? "border-[#FDE68A] bg-[linear-gradient(180deg,#FFFDF5,#FFFFFF)]" : "border-[#BBF7D0] bg-[linear-gradient(180deg,#F7FFFB,#FFFFFF)]"
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
              <div className="mb-3 flex items-center justify-between gap-3 pb-1.5">
                <div className="flex min-w-0 items-center gap-3">
                  <span className={`inline-flex h-2.5 w-2.5 rounded-full ${column.value === "en_proceso" ? "bg-[#2F80ED]" : column.value === "en_espera" ? "bg-[#F59E0B]" : "bg-[#16C784]"}`} />
                  <p className="text-base font-bold tracking-tight text-slate-900">{column.label}</p>
                </div>
                <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-xl bg-white px-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
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
                        <Card className={`rounded-[14px] border bg-white p-3 shadow-[0_8px_20px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_24px_rgba(15,23,42,0.08)] ${
                          isHoverCard ? "border-emerald-300 ring-2 ring-emerald-100" : "border-white/70 hover:border-slate-200"
                        }`}>
                          <div className="space-y-3">
                            <div className="flex items-start gap-3">
                              <span
                                title="Arrastrar"
                                aria-label="Arrastrar tarea"
                                className="inline-flex h-8 w-8 shrink-0 cursor-grab items-center justify-center rounded-xl bg-slate-50 text-slate-400 ring-1 ring-slate-100 active:cursor-grabbing"
                              >
                                <GripVertical className="h-4 w-4" />
                              </span>
                              <div className="min-w-0 flex-1">
                                <Link href={taskDetailRoute(task.id, currentQuery)} className="block line-clamp-2 text-sm font-bold leading-snug tracking-[-0.01em] text-slate-900 transition hover:text-emerald-700">
                                  {task.title}
                                </Link>
                              </div>
                            </div>

                            <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-1.5">
                              <span className="inline-flex shrink-0 items-center rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-500 ring-1 ring-slate-200">
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
                                      className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-100 disabled:opacity-60"
                                    >
                                      {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <option.icon className="h-3.5 w-3.5" />}
                                    </button>
                                  ))}
                                <Link
                                  href={taskDetailRoute(task.id, currentQuery)}
                                  title="Abrir"
                                  aria-label="Abrir tarea"
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 transition hover:bg-emerald-100"
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
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 px-4 py-6 text-center text-sm text-slate-500">
                    {isActiveDropzone ? "Suelta para moverla aquí." : "Suelta una tarea aquí."}
                  </div>
                )}

                {column.hiddenCount > 0 ? (
                  <button
                    type="button"
                    onClick={() => setExpandedColumns((current) => ({ ...current, [column.value]: !column.expanded }))}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-white"
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


export const TaskKanbanBoard = memo(TaskKanbanBoardComponent);
