"use client";

import { memo, useEffect, useMemo, useState, useTransition, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Eye,
  LayoutGrid,
  List,
  MoreVertical,
  Pencil,
  Workflow,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { TaskKanbanBoard } from "@/components/tasks/task-kanban-board";
import { taskDetailRoute, taskEditRoute } from "@/lib/navigation/routes";
import { getTaskStatusUpdatePayload, todayIsoDate } from "@/lib/tasks/status";
import { cn } from "@/lib/utils/classnames";

type TaskRow = {
  id: string;
  title: string;
  status: string;
  priority?: string | null;
  client_name?: string | null;
  due_date?: string | null;
  project_id?: string | null;
  updated_at?: string | null;
  created_at?: string | null;
};

type PageAnimationState = "idle" | "out-next" | "out-prev" | "in-next" | "in-prev";
type ViewMode = "list" | "board" | "calendar" | "gantt";

const TASK_VIEW_KEY = "flowtask.tasks.view-mode.v58133";

function formatDeadline(value?: string | null) {
  if (!value) return { label: "Sin fecha", helper: "No definida", overdue: false, today: false };
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const label = match ? `${match[3]}/${match[2]}/${match[1]}` : value;
  const today = todayIsoDate();
  return {
    label,
    helper: value < today ? "Vencido" : value === today ? "Vence hoy" : "Programada",
    overdue: value < today,
    today: value === today,
  };
}

function priorityTone(priority?: string | null) {
  if (priority === "alta") return "border-rose-200 bg-rose-50 text-rose-700";
  if (priority === "baja") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  return "border-amber-200 bg-amber-50 text-amber-700";
}

function priorityDot(priority?: string | null) {
  if (priority === "alta") return "bg-rose-500";
  if (priority === "baja") return "bg-emerald-500";
  return "bg-amber-500";
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

function statusDot(status?: string | null) {
  if (status === "concluido") return "bg-emerald-500";
  if (status === "en_espera") return "bg-amber-500";
  return "bg-sky-500";
}

function statusLabel(status?: string | null) {
  if (status === "concluido") return "Concluida";
  if (status === "en_espera") return "En espera";
  return "En progreso";
}

function readStoredViewMode(fallback: ViewMode) {
  if (typeof window === "undefined") return fallback;
  const raw = window.localStorage.getItem(TASK_VIEW_KEY);
  return raw === "list" || raw === "board" || raw === "calendar" || raw === "gantt" ? raw : fallback;
}

function viewFromInitial(initialView?: string): ViewMode {
  if (initialView === "board" || initialView === "calendar" || initialView === "gantt") return initialView;
  return "list";
}

function TaskActionListComponent({
  tasks,
  currentQuery = "",
  initialView = "list",
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
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState<10 | 20>(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageAnimation, setPageAnimation] = useState<PageAnimationState>("idle");
  const [viewMode, setViewMode] = useState<ViewMode>(viewFromInitial(initialView));
  const [, startRefresh] = useTransition();

  useEffect(() => {
    setItems(tasks);
  }, [tasks]);

  useEffect(() => {
    setViewMode(readStoredViewMode(viewFromInitial(initialView)));
  }, [initialView]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(TASK_VIEW_KEY, viewMode);
  }, [viewMode]);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  useEffect(() => {
    setCurrentPage((value) => Math.min(value, totalPages));
  }, [totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [pageSize, viewMode]);

  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [currentPage, items, pageSize]);

  const animatePage = (direction: "next" | "prev", targetPage: number) => {
    setPageAnimation(direction === "next" ? "out-next" : "out-prev");
    window.setTimeout(() => {
      setCurrentPage(targetPage);
      setPageAnimation(direction === "next" ? "in-next" : "in-prev");
      window.setTimeout(() => setPageAnimation("idle"), 220);
    }, 120);
  };

  const markComplete = async (taskId: string) => {
    setBusyId(taskId);
    const previousItems = items;
    const nextItems = items.map((item) => (item.id === taskId ? { ...item, status: "concluido", due_date: todayIsoDate() } : item));
    setItems(nextItems);

    const { error } = await supabase.from("tasks").update(getTaskStatusUpdatePayload("concluido")).eq("id", taskId);
    setBusyId(null);

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
    setBusyId(taskId);

    const { error } = await supabase.from("tasks").delete().eq("id", taskId);
    setBusyId(null);

    if (error) {
      setItems(current);
      window.alert("No se pudo eliminar la tarea.");
      return;
    }

    startRefresh(() => router.refresh());
  };

  const viewButtons: Array<{ value: ViewMode; label: string; icon: typeof List }> = [
    { value: "list", label: "Lista", icon: List },
    { value: "board", label: "Tablero", icon: LayoutGrid },
    { value: "calendar", label: "Calendario", icon: CalendarDays },
    { value: "gantt", label: "Gantt", icon: Workflow },
  ];

  const renderTable = () => (
    <div className="overflow-hidden rounded-[24px] border border-[#E5EAF1] bg-white shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
      <div className="hidden grid-cols-[42px_minmax(260px,1.5fr)_minmax(120px,0.7fr)_minmax(130px,0.7fr)_minmax(130px,0.7fr)_minmax(120px,0.65fr)_minmax(130px,0.7fr)_120px] border-b border-[#E5EAF1] bg-slate-50/70 px-5 py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 xl:grid">
        <div><input aria-label="Seleccionar tareas" type="checkbox" className="h-4 w-4 rounded border-slate-300" /></div>
        <div>Tarea</div>
        <div>Proyecto</div>
        <div>Responsable</div>
        <div>Estado</div>
        <div>Prioridad</div>
        <div>Fecha límite</div>
        <div className="text-right">Acciones</div>
      </div>

      <div
        className={cn(
          "transition-all duration-300",
          pageAnimation === "out-next" && "translate-x-4 opacity-0",
          pageAnimation === "out-prev" && "-translate-x-4 opacity-0",
          pageAnimation === "in-next" && "animate-[slideInFromRight_220ms_ease-out]",
          pageAnimation === "in-prev" && "animate-[slideInFromLeft_220ms_ease-out]",
        )}
      >
        {currentItems.length ? currentItems.map((task) => {
          const deadline = formatDeadline(task.due_date);
          const isBusy = busyId === task.id;
          return (
            <div
              key={task.id}
              className={cn(
                "grid gap-3 border-b border-[#EEF2F7] px-5 py-4 transition last:border-b-0 hover:bg-slate-50/70 xl:grid-cols-[42px_minmax(260px,1.5fr)_minmax(120px,0.7fr)_minmax(130px,0.7fr)_minmax(130px,0.7fr)_minmax(120px,0.65fr)_minmax(130px,0.7fr)_120px] xl:items-center",
                isBusy && "opacity-60",
              )}
            >
              <div className="hidden xl:block">
                <input aria-label={`Seleccionar ${task.title}`} type="checkbox" className="h-4 w-4 rounded border-slate-300" />
              </div>

              <div className="min-w-0">
                <Link href={taskDetailRoute(task.id, currentQuery)} className="block truncate text-sm font-bold text-[#0F172A] transition hover:text-emerald-700">
                  {task.title}
                </Link>
                <p className="mt-1 truncate text-xs font-medium text-[#64748B]">{task.client_name || "Tarea sin cliente asignado"}</p>
              </div>

              <div>
                <span className="inline-flex max-w-full items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  <span className="truncate">{task.client_name || (task.project_id ? "Con proyecto" : "Independiente")}</span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">
                  {(task.client_name || "FT").slice(0, 1).toUpperCase()}
                </span>
                <span className="text-sm font-medium text-slate-600">Equipo</span>
              </div>

              <div>
                <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${statusTone(task.status)}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${statusDot(task.status)}`} />
                  {statusLabel(task.status)}
                </span>
              </div>

              <div>
                <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${priorityTone(task.priority)}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${priorityDot(task.priority)}`} />
                  {priorityLabel(task.priority)}
                </span>
              </div>

              <div>
                <p className={cn("text-sm font-bold", deadline.overdue ? "text-rose-600" : deadline.today ? "text-orange-600" : "text-[#0F172A]")}>{deadline.label}</p>
                <p className={cn("mt-1 text-xs font-semibold", deadline.overdue ? "text-rose-500" : deadline.today ? "text-orange-500" : "text-[#64748B]")}>{deadline.helper}</p>
              </div>

              <div className="flex items-center gap-2 xl:justify-end">
                <Link href={taskDetailRoute(task.id, currentQuery)} className="inline-flex h-9 w-9 items-center justify-center rounded-[12px] border border-[#E5EAF1] bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900" aria-label="Ver tarea">
                  <Eye className="h-4 w-4" />
                </Link>
                <Link href={taskEditRoute(task.id, currentQuery)} className="inline-flex h-9 w-9 items-center justify-center rounded-[12px] border border-[#E5EAF1] bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900" aria-label="Editar tarea">
                  <Pencil className="h-4 w-4" />
                </Link>
                {task.status !== "concluido" ? (
                  <button type="button" onClick={() => markComplete(task.id)} className="inline-flex h-9 w-9 items-center justify-center rounded-[12px] border border-emerald-200 bg-emerald-50 text-emerald-700 transition hover:bg-emerald-100" aria-label="Finalizar tarea">
                    <CheckCircle2 className="h-4 w-4" />
                  </button>
                ) : null}
                <button type="button" onClick={() => deleteTask(task.id)} className="inline-flex h-9 w-9 items-center justify-center rounded-[12px] border border-[#E5EAF1] bg-white text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600" aria-label="Eliminar tarea">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        }) : (
          <div className="px-5 py-10 text-center text-sm font-medium text-slate-500">No hay tareas para esta combinación de filtros.</div>
        )}
      </div>
    </div>
  );

  const renderPlaceholder = (label: string) => (
    <Card className="rounded-[24px] border border-[#E5EAF1] bg-white p-8 text-center shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
      <p className="text-lg font-bold text-[#0F172A]">Vista {label}</p>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#64748B]">Esta vista queda preparada visualmente para una iteración posterior. La vista lista mantiene el flujo operativo principal sin tocar la lógica de datos.</p>
    </Card>
  );

  return (
    <div className="space-y-4">
      <Card className="rounded-[24px] border border-[#E5EAF1] bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)] md:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#0F172A]">Vistas rápidas</h2>
            <p className="mt-1 text-sm font-medium text-[#64748B]">Alterna entre vistas para encontrar lo que necesitas.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {viewButtons.map((item) => {
              const Icon = item.icon;
              const active = viewMode === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setViewMode(item.value)}
                  className={cn(
                    "inline-flex h-11 items-center gap-2 rounded-[14px] border px-4 text-sm font-semibold transition",
                    active ? "border-[#050B18] bg-[#050B18] text-white shadow-[0_12px_26px_rgba(5,11,24,0.16)]" : "border-[#E5EAF1] bg-white text-slate-700 hover:bg-slate-50",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {searchPanel ? <div>{searchPanel}</div> : null}

      {viewMode === "list" ? renderTable() : null}
      {viewMode === "board" ? <TaskKanbanBoard tasks={items} showHeader={false} currentQuery={currentQuery} workspaceKey="tasks-page" /> : null}
      {viewMode === "calendar" ? renderPlaceholder("Calendario") : null}
      {viewMode === "gantt" ? renderPlaceholder("Gantt") : null}

      {viewMode === "list" ? (
        <Card className="rounded-[24px] border border-[#E5EAF1] bg-white px-4 py-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-sm font-medium text-[#64748B]">
              Mostrando {items.length ? (currentPage - 1) * pageSize + 1 : 0} a {Math.min(currentPage * pageSize, items.length)} de {items.length} tareas
            </p>

            <div className="flex flex-wrap items-center gap-2 md:justify-end">
              <Button
                type="button"
                variant="secondary"
                className="h-10 rounded-[12px] px-3"
                disabled={currentPage <= 1 || pageAnimation !== "idle"}
                onClick={() => animatePage("prev", currentPage - 1)}
              >
                <ArrowLeft className="h-4 w-4" />
                Anterior
              </Button>
              <span className="inline-flex h-10 min-w-10 items-center justify-center rounded-[12px] bg-[#050B18] px-3 text-sm font-bold text-white">{currentPage}</span>
              {totalPages > 1 ? <span className="inline-flex h-10 min-w-10 items-center justify-center rounded-[12px] border border-[#E5EAF1] bg-white px-3 text-sm font-bold text-slate-700">{Math.min(currentPage + 1, totalPages)}</span> : null}
              <Button
                type="button"
                variant="secondary"
                className="h-10 rounded-[12px] px-3"
                disabled={currentPage >= totalPages || pageAnimation !== "idle"}
                onClick={() => animatePage("next", currentPage + 1)}
              >
                Siguiente
                <ArrowRight className="h-4 w-4" />
              </Button>
              <div className="ml-0 flex items-center gap-2 rounded-[12px] border border-[#E5EAF1] bg-white px-3 py-1.5 md:ml-3">
                <span className="text-sm font-medium text-slate-500">Mostrar</span>
                <Select
                  aria-label="Cantidad de tareas por página"
                  className="h-8 min-w-[72px] border-none bg-transparent px-1 py-0 text-sm font-semibold text-[#0F172A] focus:border-none"
                  value={String(pageSize)}
                  onChange={(event) => {
                    setPageSize(Number(event.target.value) as 10 | 20);
                    setCurrentPage(1);
                  }}
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                </Select>
              </div>
            </div>
          </div>
        </Card>
      ) : null}

      <style>{`
        @keyframes slideInFromRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInFromLeft {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}

export const TaskActionList = memo(TaskActionListComponent);
