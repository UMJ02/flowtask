"use client";

import { memo, useEffect, useMemo, useState, useTransition, type ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, Eye, LayoutGrid, List, Pencil, Star, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { taskDetailRoute, taskEditRoute } from "@/lib/navigation/routes";
import { useWorkspaceMemory } from "@/hooks/use-workspace-memory";
import { getTaskStatusUpdatePayload, todayIsoDate } from "@/lib/tasks/status";

type TaskRow = {
  id: string;
  title: string;
  status: string;
  priority?: string | null;
  client_name?: string | null;
  due_date?: string | null;
  project_id?: string | null;
};

type PageAnimationState = "idle" | "out-next" | "out-prev" | "in-next" | "in-prev";
type ViewMode = "cards" | "list";

const TASK_VIEW_KEY = "flowtask.tasks.view-mode.v474";

function formatDeadline(value?: string | null) {
  if (!value) return "Sin deadline";
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return value;
  const [, year, month, day] = match;
  return `${day}/${month}/${year}`;
}

function priorityTone(priority?: string | null) {
  if (priority === "alta") return "border-rose-200 bg-rose-50 text-rose-700";
  if (priority === "baja") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  return "border-amber-200 bg-amber-50 text-amber-700";
}

function priorityLabel(priority?: string | null) {
  if (priority === "alta") return "Alta";
  if (priority === "baja") return "Baja";
  return "Media";
}

function statusTone(status?: string | null) {
  if (status === "concluido") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (status === "en_espera") return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-sky-200 bg-sky-50 text-sky-700";
}

function statusLabel(status?: string | null) {
  if (status === "concluido") return "Concluida";
  if (status === "en_espera") return "En espera";
  return "En proceso";
}

function readStoredViewMode(fallback: ViewMode) {
  if (typeof window === "undefined") return fallback;
  const raw = window.localStorage.getItem(TASK_VIEW_KEY);
  return raw === "list" || raw === "cards" ? raw : fallback;
}

function TaskActionListComponent({
  tasks,
  currentQuery = "",
  initialView = "cards",
  searchPanel,
}: {
  tasks: TaskRow[];
  currentQuery?: string;
  initialView?: string;
  searchPanel?: ReactNode;
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [items, setItems] = useState(tasks);
  const [closingId, setClosingId] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [pageSize, setPageSize] = useState<5 | 10>(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageAnimation, setPageAnimation] = useState<PageAnimationState>("idle");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>(initialView === "list" ? "list" : "cards");
  const [, startRefresh] = useTransition();
  const { favorites, version } = useWorkspaceMemory();

  useEffect(() => {
    setItems(tasks);
  }, [tasks]);

  useEffect(() => {
    setViewMode(readStoredViewMode(initialView === "list" ? "list" : "cards"));
  }, [initialView]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(TASK_VIEW_KEY, viewMode);
  }, [viewMode]);

  const favoriteTaskIds = useMemo(() => new Set(favorites.filter((item) => item.type === "task").map((item) => item.id)), [favorites, version]);
  const pendingItems = useMemo(() => items.filter((item) => item.status !== "concluido"), [items]);
  const completedItems = useMemo(() => items.filter((item) => item.status === "concluido"), [items]);
  const visiblePendingItems = useMemo(() => (favoritesOnly ? pendingItems.filter((item) => favoriteTaskIds.has(item.id)) : pendingItems), [favoriteTaskIds, favoritesOnly, pendingItems]);
  const totalPages = Math.max(1, Math.ceil(visiblePendingItems.length / pageSize));

  useEffect(() => {
    setCurrentPage((value) => Math.min(value, totalPages));
  }, [totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [favoritesOnly, pageSize]);

  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return visiblePendingItems.slice(start, start + pageSize);
  }, [currentPage, pageSize, visiblePendingItems]);

  const animatePage = (direction: "next" | "prev", targetPage: number) => {
    setPageAnimation(direction === "next" ? "out-next" : "out-prev");
    window.setTimeout(() => {
      setCurrentPage(targetPage);
      setPageAnimation(direction === "next" ? "in-next" : "in-prev");
      window.setTimeout(() => setPageAnimation("idle"), 220);
    }, 120);
  };

  const markComplete = async (taskId: string) => {
    setClosingId(taskId);
    const previousItems = items;
    const nextItems = items.map((item) => (item.id === taskId ? { ...item, status: "concluido", due_date: todayIsoDate() } : item));
    setItems(nextItems);

    const { error } = await supabase.from("tasks").update(getTaskStatusUpdatePayload("concluido")).eq("id", taskId);
    setClosingId(null);

    if (error) {
      setItems(previousItems);
      window.alert("No se pudo finalizar la tarea.");
      return;
    }

    startRefresh(() => router.refresh());
  };

  const deleteTask = async (taskId: string) => {
    const ok = window.confirm("¿Deseas eliminar esta tarea? Esta acción no se puede deshacer.");
    if (!ok) return;

    const current = items;
    setItems((list) => list.filter((item) => item.id !== taskId));

    const { error } = await supabase.from("tasks").delete().eq("id", taskId);
    if (error) {
      setItems(current);
      window.alert("No se pudo eliminar la tarea.");
      return;
    }

    startRefresh(() => router.refresh());
  };

  const renderActions = (task: TaskRow, completed = false) => (
    <div className="flex flex-wrap items-center gap-2 xl:justify-end">
      {!completed ? (
        <button
          type="button"
          onClick={() => markComplete(task.id)}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100"
        >
          <CheckCircle2 className="h-4 w-4" />
          Finalizar
        </button>
      ) : null}

      <Link href={taskDetailRoute(task.id, currentQuery)}>
        <Button type="button" variant="secondary" className="h-10 rounded-xl px-3.5 text-sm">
          <Eye className="h-4 w-4" />
          Ver
        </Button>
      </Link>

      {!completed ? (
        <Link href={taskEditRoute(task.id, currentQuery)}>
          <Button type="button" variant="secondary" className="h-10 rounded-xl px-3.5 text-sm">
            <Pencil className="h-4 w-4" />
            Editar
          </Button>
        </Link>
      ) : null}

      <Button type="button" variant="secondary" className="h-10 rounded-xl px-3.5 text-sm" onClick={() => deleteTask(task.id)}>
        <Trash2 className="h-4 w-4" />
        Borrar
      </Button>
    </div>
  );

  const renderItem = (task: TaskRow, completed = false) => {
    const isFavorite = favoriteTaskIds.has(task.id);
    const isClosing = closingId === task.id;

    if (viewMode === "list") {
      return (
        <div
          key={task.id}
          className={[
            "grid gap-4 px-4 py-4 transition-all duration-300 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)] xl:items-center",
            completed ? "bg-slate-50/70" : "bg-white",
            isClosing ? "opacity-60" : "opacity-100",
          ].join(" ")}
        >
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-[1.05rem] font-bold leading-tight text-slate-900 md:text-[1.15rem]">{task.title}</h3>
              {isFavorite ? <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">Favorita</span> : null}
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-500">
              <span className="rounded-full bg-slate-100 px-3 py-1.5 font-medium text-slate-600">Deadline: {formatDeadline(task.due_date)}</span>
              <span className={`rounded-full border px-3 py-1.5 font-semibold ${priorityTone(task.priority)}`}>{priorityLabel(task.priority)}</span>
              <span className={`rounded-full border px-3 py-1.5 font-semibold ${statusTone(task.status)}`}>{statusLabel(task.status)}</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 xl:justify-end">{renderActions(task, completed)}</div>
        </div>
      );
    }

    return (
      <div
        key={task.id}
        className={[
          "rounded-[22px] border border-slate-200 bg-white px-4 py-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)] transition-all duration-300",
          completed ? "bg-slate-50/80" : "hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(15,23,42,0.08)]",
          isClosing ? "scale-[0.99] opacity-60" : "opacity-100",
        ].join(" ")}
      >
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="text-[1.15rem] font-bold leading-tight text-slate-900 md:text-[1.3rem]">{task.title}</h3>
            <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-500">
              <span className="rounded-full bg-slate-100 px-3 py-1.5 font-medium text-slate-600">Deadline: {formatDeadline(task.due_date)}</span>
              <span className={`rounded-full border px-3 py-1.5 font-semibold ${priorityTone(task.priority)}`}>{priorityLabel(task.priority)}</span>
              <span className={`rounded-full border px-3 py-1.5 font-semibold ${statusTone(task.status)}`}>{statusLabel(task.status)}</span>
              {isFavorite ? <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 font-semibold text-amber-700">Favorita</span> : null}
            </div>
          </div>
          {renderActions(task, completed)}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <Card className="rounded-[28px] border border-slate-200/90 p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)] md:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Lista de tareas</p>
            <h2 className="mt-2 text-[1.35rem] font-bold tracking-tight text-slate-900">Vista limpia para resolver más rápido</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Alterna entre tarjetas y lista para revisar más rápido, sin perder prioridad, estado ni fecha.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 xl:justify-end">
            <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
              <button
                type="button"
                onClick={() => setViewMode("cards")}
                className={`inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition ${viewMode === "cards" ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"}`}
              >
                <LayoutGrid className="h-4 w-4" />
                Tarjetas
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition ${viewMode === "list" ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"}`}
              >
                <List className="h-4 w-4" />
                Lista
              </button>
            </div>
            <button
              type="button"
              onClick={() => setFavoritesOnly((value) => !value)}
              className={`inline-flex h-10 items-center gap-2 rounded-xl border px-3.5 text-sm font-semibold transition ${favoritesOnly ? "border-amber-200 bg-amber-50 text-amber-700" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}
            >
              <Star className={`h-4 w-4 ${favoritesOnly ? "fill-current" : ""}`} />
              Favoritos del día
            </button>

            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
              <span className="font-medium">Mostrar</span>
              <Select
                aria-label="Cantidad de tareas por página"
                className="h-8 min-w-[84px] border-none bg-transparent px-1 py-0 text-sm font-semibold text-slate-900 focus:border-none"
                value={String(pageSize)}
                onChange={(event) => {
                  setPageSize(Number(event.target.value) as 5 | 10);
                  setCurrentPage(1);
                }}
              >
                <option value="5">5</option>
                <option value="10">10</option>
              </Select>
            </div>
          </div>
        </div>
      </Card>

      {searchPanel ? <div>{searchPanel}</div> : null}

      <div
        className={[
          "transition-all duration-300",
          viewMode === "list" ? "overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.04)]" : "space-y-3",
          pageAnimation === "out-next" && "translate-x-4 opacity-0",
          pageAnimation === "out-prev" && "-translate-x-4 opacity-0",
          pageAnimation === "in-next" && "animate-[slideInFromRight_220ms_ease-out]",
          pageAnimation === "in-prev" && "animate-[slideInFromLeft_220ms_ease-out]",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {currentItems.length ? (
          viewMode === "list" ? currentItems.map((task, index) => (
            <div key={task.id} className={index === 0 ? "" : "border-t border-slate-200"}>
              {renderItem(task, false)}
            </div>
          )) : currentItems.map((task) => renderItem(task, false))
        ) : (
          <Card className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-6 text-sm text-slate-500">
            No hay tareas activas para este filtro.
          </Card>
        )}
      </div>

      <Card className="rounded-[24px] border border-slate-200/90 bg-white/95 px-4 py-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
        <div className="flex flex-wrap items-center justify-end gap-2 md:justify-end">
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-2 py-2">
            <Button
              type="button"
              variant="ghost"
              className="h-9 rounded-xl px-3"
              disabled={currentPage <= 1 || pageAnimation !== "idle"}
              onClick={() => animatePage("prev", currentPage - 1)}
            >
              <ArrowLeft className="h-4 w-4" />
              Atrás
            </Button>
            <span className="min-w-[88px] text-center text-sm font-semibold text-slate-700">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              type="button"
              variant="ghost"
              className="h-9 rounded-xl px-3"
              disabled={currentPage >= totalPages || pageAnimation !== "idle"}
              onClick={() => animatePage("next", currentPage + 1)}
            >
              Siguiente
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <button
            type="button"
            onClick={() => setShowCompleted((value) => !value)}
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            {showCompleted ? "Ocultar concluidas" : `Ver tareas concluidas (${completedItems.length})`}
          </button>
        </div>
      </Card>

      <div
        className={[
          "grid overflow-hidden transition-all duration-300",
          showCompleted ? "mt-6 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        ].join(" ")}
      >
        <div className="min-h-0">
          <Card className="rounded-[28px] border border-slate-200/90 bg-[linear-gradient(180deg,rgba(248,250,252,0.96),rgba(255,255,255,0.98))] p-5 md:p-6">
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Tareas finalizadas</p>
              <h3 className="mt-2 text-lg font-bold text-slate-900">Historial reciente</h3>
            </div>

            <div className={viewMode === "list" ? "overflow-hidden rounded-[22px] border border-slate-200 bg-white" : "space-y-3"}>
              {completedItems.length ? (
                viewMode === "list" ? completedItems.map((task, index) => (
                  <div key={task.id} className={index === 0 ? "" : "border-t border-slate-200"}>
                    {renderItem(task, true)}
                  </div>
                )) : completedItems.map((task) => renderItem(task, true))
              ) : (
                <div className="rounded-[22px] border border-slate-200 bg-white px-4 py-4 text-sm text-slate-500">
                  Aún no hay tareas concluidas para mostrar.
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      <style>{`
        @keyframes slideInFromRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideInFromLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}

export const TaskActionList = memo(TaskActionListComponent);
