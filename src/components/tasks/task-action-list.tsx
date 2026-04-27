"use client";

import { memo, useEffect, useMemo, useState, useTransition, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CalendarCheck2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Download,
  Eye,
  Flag,
  LayoutGrid,
  Layers3,
  List,
  MoreVertical,
  Pencil,
  Save,
  Settings2,
  SlidersHorizontal,
  Trash2,
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
type ViewMode = "list" | "board" | "calendar" | "timeline" | "gantt";
type GanttColorMode = "priority" | "status" | "client";

const TASK_VIEW_KEY = "flowtask.tasks.view-mode.v58143";
const GANTT_CONFIG_KEY = "flowtask.tasks.gantt-config.v58143";
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function safeDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(`${value.slice(0, 10)}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function diffDays(end: Date, start: Date) {
  return Math.round((end.getTime() - start.getTime()) / MS_PER_DAY);
}

function formatHumanDate(value?: string | null) {
  if (!value) return "Sin fecha";
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.slice(0, 10));
  return match ? `${match[3]}/${match[2]}/${match[1]}` : value;
}

function formatDeadline(value?: string | null) {
  if (!value) return { label: "Sin fecha", helper: "No definida", overdue: false, today: false };
  const normalized = value.slice(0, 10);
  const today = todayIsoDate();
  return {
    label: formatHumanDate(normalized),
    helper: normalized < today ? "Vencido" : normalized === today ? "Vence hoy" : "Programada",
    overdue: normalized < today,
    today: normalized === today,
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

function barColor(task: TaskRow, mode: GanttColorMode = "priority") {
  if (mode === "status") {
    if (task.status === "concluido") return "bg-emerald-500";
    if (task.status === "en_espera") return "bg-violet-400";
    return "bg-blue-500";
  }
  if (mode === "client") {
    const bucket = (task.client_name ?? task.title).length % 4;
    return ["bg-emerald-500", "bg-blue-500", "bg-violet-400", "bg-amber-400"][bucket] ?? "bg-emerald-500";
  }
  if (task.status === "concluido") return "bg-emerald-500";
  if (task.priority === "alta") return "bg-rose-400";
  if (task.priority === "baja") return "bg-emerald-400";
  return "bg-amber-400";
}

function getProgress(task: TaskRow) {
  if (task.status === "concluido") return 100;
  if (task.status === "en_espera") return 20;
  if (task.priority === "alta") return 70;
  if (task.priority === "baja") return 40;
  return 55;
}

function getTaskRange(task: TaskRow) {
  const deadline = safeDate(task.due_date) ?? safeDate(task.updated_at) ?? safeDate(task.created_at) ?? new Date();
  const duration = task.priority === "alta" ? 5 : task.priority === "baja" ? 3 : 4;
  const start = addDays(deadline, -duration + 1);
  return { start, end: deadline, duration };
}

function getTimelineBounds(tasks: TaskRow[]) {
  if (!tasks.length) {
    const today = new Date();
    return { start: addDays(today, -3), end: addDays(today, 10) };
  }
  const ranges = tasks.map(getTaskRange);
  const minTime = Math.min(...ranges.map((range) => range.start.getTime()));
  const maxTime = Math.max(...ranges.map((range) => range.end.getTime()));
  return { start: addDays(new Date(minTime), -1), end: addDays(new Date(maxTime), 3) };
}

function getBarStyle(task: TaskRow, rangeStart: Date, rangeEnd: Date) {
  const { start, end } = getTaskRange(task);
  const totalDays = Math.max(1, diffDays(rangeEnd, rangeStart) + 1);
  const offset = Math.max(0, diffDays(start, rangeStart));
  const duration = Math.max(1, diffDays(end, start) + 1);
  return {
    marginLeft: `${Math.min(92, (offset / totalDays) * 100)}%`,
    width: `${Math.max(6, Math.min(100, (duration / totalDays) * 100))}%`,
  };
}

function readStoredViewMode(fallback: ViewMode) {
  if (typeof window === "undefined") return fallback;
  const raw = window.localStorage.getItem(TASK_VIEW_KEY);
  return raw === "list" || raw === "board" || raw === "calendar" || raw === "timeline" || raw === "gantt" ? raw : fallback;
}

function viewFromInitial(initialView?: string): ViewMode {
  if (initialView === "board" || initialView === "calendar" || initialView === "timeline" || initialView === "gantt") return initialView;
  return "list";
}

function buildViewQuery(currentQuery: string, view: ViewMode) {
  const params = new URLSearchParams(currentQuery);
  params.set("view", view);
  return params.toString();
}

function startDownload(filename: string, content: string, type = "text/csv;charset=utf-8") {
  const blob = new Blob([content], { type });
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(href);
}


function csvEscape(value: unknown) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function tasksToCsv(tasks: TaskRow[]) {
  const header = ["id", "title", "status", "priority", "client", "project_id", "due_date", "updated_at"];
  const rows = tasks.map((task) => [task.id, task.title, task.status, task.priority ?? "", task.client_name ?? "", task.project_id ?? "", task.due_date ?? "", task.updated_at ?? ""].map(csvEscape).join(","));
  return [header.join(","), ...rows].join("\n");
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
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [pageSize, setPageSize] = useState<10 | 20>(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageAnimation, setPageAnimation] = useState<PageAnimationState>("idle");
  const [viewMode, setViewMode] = useState<ViewMode>(viewFromInitial(initialView));
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [showGanttSettings, setShowGanttSettings] = useState(true);
  const [showProgress, setShowProgress] = useState(true);
  const [showDates, setShowDates] = useState(true);
  const [showPriority, setShowPriority] = useState(true);
  const [compactGantt, setCompactGantt] = useState(true);
  const [ganttColorMode, setGanttColorMode] = useState<GanttColorMode>("priority");
  const [, startRefresh] = useTransition();

  useEffect(() => {
    setItems(tasks);
    setSelectedIds((ids) => ids.filter((id) => tasks.some((task) => task.id === id)));
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

  const timelineItems = useMemo(() => items.slice(0, 18), [items]);
  const timelineBounds = useMemo(() => getTimelineBounds(timelineItems), [timelineItems]);
  const timelineDays = useMemo(() => {
    const days = Math.min(21, Math.max(7, diffDays(timelineBounds.end, timelineBounds.start) + 1));
    return Array.from({ length: days }, (_, index) => addDays(timelineBounds.start, index));
  }, [timelineBounds.end, timelineBounds.start]);
  const calendarDays = useMemo(() => buildCalendarDays(items), [items]);

  const allCurrentSelected = currentItems.length > 0 && currentItems.every((item) => selectedIds.includes(item.id));
  const timelineActive = viewMode === "timeline" || viewMode === "gantt";

  const changeView = (nextView: ViewMode) => {
    setViewMode(nextView);
    setTimelineOpen(false);
    const query = buildViewQuery(currentQuery, nextView);
    router.replace(`/app/tasks?${query}`);
  };

  const toggleSelected = (taskId: string) => {
    setSelectedIds((ids) => (ids.includes(taskId) ? ids.filter((id) => id !== taskId) : [...ids, taskId]));
  };

  const toggleCurrentPage = () => {
    setSelectedIds((ids) => {
      const currentIds = currentItems.map((item) => item.id);
      if (currentIds.every((id) => ids.includes(id))) return ids.filter((id) => !currentIds.includes(id));
      return Array.from(new Set([...ids, ...currentIds]));
    });
  };

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

  const bulkCompleteSelected = async () => {
    if (!selectedIds.length) return;
    setBusyId("bulk");
    const previousItems = items;
    const payload = getTaskStatusUpdatePayload("concluido");
    setItems((list) => list.map((item) => (selectedIds.includes(item.id) ? { ...item, status: "concluido", due_date: todayIsoDate() } : item)));
    const { error } = await supabase.from("tasks").update(payload).in("id", selectedIds);
    setBusyId(null);
    if (error) {
      setItems(previousItems);
      window.alert("No se pudieron finalizar las tareas seleccionadas.");
      return;
    }
    setSelectedIds([]);
    startRefresh(() => router.refresh());
  };

  const bulkDeleteSelected = async () => {
    if (!selectedIds.length) return;
    const ok = window.confirm(`¿Deseas eliminar ${selectedIds.length} tarea(s)? Esta acción no se puede deshacer.`);
    if (!ok) return;
    const previousItems = items;
    setItems((list) => list.filter((item) => !selectedIds.includes(item.id)));
    setBusyId("bulk");
    const { error } = await supabase.from("tasks").delete().in("id", selectedIds);
    setBusyId(null);
    if (error) {
      setItems(previousItems);
      window.alert("No se pudieron eliminar las tareas seleccionadas.");
      return;
    }
    setSelectedIds([]);
    startRefresh(() => router.refresh());
  };

  const saveGanttView = async () => {
    const config = { showProgress, showDates, showPriority, compactGantt, ganttColorMode, savedAt: new Date().toISOString() };
    window.localStorage.setItem(GANTT_CONFIG_KEY, JSON.stringify(config));
    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;
    if (!user) {
      window.alert("Vista guardada localmente. Iniciá sesión para sincronizarla.");
      return;
    }
    const { error } = await supabase.from("task_view_preferences").upsert(
      { user_id: user.id, organization_id: null, scope: "tasks", name: "Vista personal", view_mode: viewMode, config },
      { onConflict: "user_id,organization_id,scope,name" },
    );
    window.alert(error ? `Vista guardada localmente, pero no se pudo sincronizar: ${error.message}` : "Vista guardada y sincronizada con tu cuenta.");
  };

  const createNewSavedView = async () => {
    const name = window.prompt("Nombre de la nueva vista", viewMode === "gantt" ? "Gantt ejecutivo" : "Timeline operativo");
    if (!name?.trim()) return;
    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;
    if (!user) { window.alert("Iniciá sesión para crear vistas sincronizadas."); return; }
    const config = { showProgress, showDates, showPriority, compactGantt, ganttColorMode, savedAt: new Date().toISOString() };
    const { error } = await supabase.from("task_view_preferences").upsert(
      { user_id: user.id, organization_id: null, scope: "tasks", name: name.trim(), view_mode: viewMode, config },
      { onConflict: "user_id,organization_id,scope,name" },
    );
    window.alert(error ? `No se pudo guardar la vista: ${error.message}` : "Nueva vista guardada.");
  };

  const exportTasks = () => {
    startDownload(`flowtask-tareas-${viewMode}.csv`, tasksToCsv(items));
  };

  const renderTable = () => (
    <div className="overflow-hidden rounded-[24px] border border-[#E5EAF1] bg-white shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
      <div className="hidden grid-cols-[42px_minmax(260px,1.5fr)_minmax(120px,0.7fr)_minmax(130px,0.7fr)_minmax(130px,0.7fr)_minmax(120px,0.65fr)_minmax(130px,0.7fr)_120px] border-b border-[#E5EAF1] bg-slate-50/70 px-5 py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 xl:grid">
        <div><input aria-label="Seleccionar tareas de esta página" type="checkbox" checked={allCurrentSelected} onChange={toggleCurrentPage} className="h-4 w-4 rounded border-slate-300" /></div>
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
                <input aria-label={`Seleccionar ${task.title}`} type="checkbox" checked={selectedIds.includes(task.id)} onChange={() => toggleSelected(task.id)} className="h-4 w-4 rounded border-slate-300" />
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
                  <Trash2 className="h-4 w-4" />
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

  const renderSmartTimeline = () => (
    <Card className="overflow-hidden rounded-[24px] border border-[#E5EAF1] bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
      <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#16C784]">Smart Timeline</p>
          <h3 className="mt-1 text-xl font-black text-[#0F172A]">Vista híbrida Calendario + Gantt</h3>
          <p className="mt-1 text-sm font-medium text-[#64748B]">Planifica campañas, producción y duración visual usando las tareas actuales.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {["Día", "Semana", "Mes", "Mis tareas", "Equipo"].map((label, index) => (
            <button key={label} type="button" className={cn("h-10 rounded-[14px] border px-4 text-sm font-bold transition", index === 1 ? "border-[#050B18] bg-[#050B18] text-white" : "border-[#E5EAF1] bg-white text-slate-700 hover:bg-slate-50")}>{label}</button>
          ))}
          <button type="button" className="inline-flex h-10 items-center gap-2 rounded-[14px] border border-[#E5EAF1] bg-white px-4 text-sm font-bold text-slate-700 hover:bg-slate-50"><SlidersHorizontal className="h-4 w-4" />Filtros</button>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-3 rounded-[18px] border border-[#E5EAF1] bg-slate-50/70 p-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-[12px] border border-[#E5EAF1] bg-white"><ArrowLeft className="h-4 w-4" /></button>
          <span className="rounded-full bg-white px-4 py-2 text-sm font-black text-[#0F172A] ring-1 ring-[#E5EAF1]">{formatHumanDate(toIsoDate(timelineBounds.start))} — {formatHumanDate(toIsoDate(timelineBounds.end))}</span>
          <button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-[12px] border border-[#E5EAF1] bg-white"><ArrowRight className="h-4 w-4" /></button>
        </div>
        <p className="text-xs font-bold text-[#64748B]">Click en una barra abre el detalle. Usa guardar vista para sincronizar configuración y exportar CSV.</p>
      </div>

      <div className="overflow-x-auto rounded-[18px] border border-[#E5EAF1]">
        <div className="min-w-[960px] grid grid-cols-[300px_1fr]">
          <div className="border-r border-[#E5EAF1] bg-white">
            <div className="h-12 border-b border-[#E5EAF1] px-4 py-4 text-[11px] font-black uppercase tracking-[0.14em] text-[#64748B]">Tarea / responsable</div>
            {timelineItems.map((task) => (
              <div key={task.id} className="flex h-[58px] items-center gap-3 border-b border-[#EEF2F7] px-4 last:border-b-0">
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-black text-slate-700">{(task.client_name || task.title).slice(0, 1).toUpperCase()}</span>
                <div className="min-w-0">
                  <Link href={taskDetailRoute(task.id, currentQuery)} className="block truncate text-sm font-black text-[#0F172A] hover:text-emerald-700">{task.title}</Link>
                  <p className="truncate text-xs font-semibold text-[#64748B]">{task.client_name || "Equipo FlowTask"}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="relative bg-white">
            <div className="grid h-12 border-b border-[#E5EAF1]" style={{ gridTemplateColumns: `repeat(${timelineDays.length}, minmax(42px, 1fr))` }}>
              {timelineDays.map((day) => (
                <div key={day.toISOString()} className="border-r border-[#EEF2F7] px-2 py-3 text-center text-[11px] font-black uppercase text-[#64748B] last:border-r-0">{day.getDate()}</div>
              ))}
            </div>
            {timelineItems.map((task) => (
              <div key={task.id} className="relative h-[58px] border-b border-[#EEF2F7] last:border-b-0">
                <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${timelineDays.length}, minmax(42px, 1fr))` }}>
                  {timelineDays.map((day) => <div key={day.toISOString()} className="border-r border-[#F1F5F9] last:border-r-0" />)}
                </div>
                <Link
                  href={taskDetailRoute(task.id, currentQuery)}
                  title={`${task.title} · ${formatHumanDate(toIsoDate(getTaskRange(task).start))} - ${formatHumanDate(toIsoDate(getTaskRange(task).end))}`}
                  className={cn("absolute top-1/2 h-4 -translate-y-1/2 rounded-full shadow-[0_8px_18px_rgba(15,23,42,0.12)] transition hover:scale-[1.02]", barColor(task))}
                  style={getBarStyle(task, timelineBounds.start, timelineBounds.end)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-3 text-xs font-bold text-[#64748B]">
        <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-rose-400" />Alta prioridad</span>
        <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-amber-400" />Media</span>
        <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />Baja</span>
        <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />Completada</span>
      </div>
    </Card>
  );

  const renderCalendarPro = () => {
    const total = items.length;
    const done = items.filter((task) => task.status === "concluido").length;
    const urgent = items.filter((task) => task.priority === "alta").length;
    const today = todayIsoDate();
    const dueToday = items.filter((task) => task.due_date?.slice(0, 10) === today).length;
    const percent = total ? Math.round((done / total) * 100) : 0;

    return (
      <Card className="rounded-[24px] border border-[#E5EAF1] bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
        <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#16C784]">Operations Calendar Pro</p>
            <h3 className="mt-1 text-xl font-black text-[#0F172A]">Calendario premium de ejecución diaria</h3>
            <p className="mt-1 text-sm font-medium text-[#64748B]">Deadlines, agenda operativa y carga de trabajo por día.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {["Hoy", "Día", "Semana", "Mes"].map((label, index) => (
              <button key={label} type="button" className={cn("h-10 rounded-[14px] border px-4 text-sm font-bold transition", index === 3 ? "border-[#16C784] bg-[#16C784] text-white" : "border-[#E5EAF1] bg-white text-slate-700 hover:bg-slate-50")}>{label}</button>
            ))}
            <button type="button" onClick={() => changeView("timeline")} className="h-10 rounded-[14px] border border-[#E5EAF1] bg-white px-4 text-sm font-bold text-slate-700 hover:bg-slate-50">Timeline</button>
            <button type="button" className="inline-flex h-10 items-center gap-2 rounded-[14px] border border-[#E5EAF1] bg-white px-4 text-sm font-bold text-slate-700 hover:bg-slate-50"><Settings2 className="h-4 w-4" />Config</button>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
          <div className="overflow-hidden rounded-[20px] border border-[#E5EAF1]">
            <div className="grid grid-cols-7 border-b border-[#E5EAF1] bg-[#F8FAFC] text-center text-[11px] font-black uppercase tracking-[0.12em] text-[#64748B]">
              {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day) => <div key={day} className="px-2 py-3">{day}</div>)}
            </div>
            <div className="grid grid-cols-7">
              {calendarDays.map((day) => (
                <div key={day.iso} className={cn("min-h-[145px] border-r border-b border-[#E5EAF1] bg-white p-3 last:border-r-0", day.isToday && "bg-emerald-50/40")}>
                  <div className={cn("mb-3 inline-flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-xs font-black", day.isToday ? "bg-[#16C784] text-white" : "text-[#0F172A]")}>{day.label}</div>
                  <div className="space-y-2">
                    {day.tasks.slice(0, 4).map((task) => (
                      <Link key={task.id} href={taskDetailRoute(task.id, currentQuery)} className={cn("block w-full truncate rounded-full border px-3 py-2 text-left text-xs font-bold shadow-[0_4px_12px_rgba(15,23,42,0.03)] transition hover:-translate-y-0.5 hover:border-[#16C784]/40", priorityTone(task.priority))}>{task.title}</Link>
                    ))}
                    {day.tasks.length > 4 ? <button type="button" className="text-xs font-bold text-[#64748B]">+{day.tasks.length - 4} más</button> : null}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-[20px] border border-[#E5EAF1] bg-white p-5">
              <h4 className="text-sm font-black text-[#0F172A]">Resumen semanal</h4>
              <div className="mt-4 space-y-3">
                <CalendarMetric icon={<Layers3 className="h-4 w-4" />} label="Total tareas" value={total} tone="violet" />
                <CalendarMetric icon={<Flag className="h-4 w-4" />} label="Urgentes" value={urgent} tone="rose" />
                <CalendarMetric icon={<CalendarCheck2 className="h-4 w-4" />} label="Vencen hoy" value={dueToday} tone="amber" />
                <CalendarMetric icon={<CheckCircle2 className="h-4 w-4" />} label="Completadas" value={done} tone="emerald" />
              </div>
            </div>
            <div className="rounded-[20px] border border-[#E5EAF1] bg-white p-5 text-center">
              <div className="mx-auto grid h-32 w-32 place-items-center rounded-full border-[12px] border-emerald-100 text-2xl font-black text-[#0F172A]" style={{ background: `conic-gradient(#16C784 ${percent * 3.6}deg, #ECFDF5 0deg)` }}>
                <span className="grid h-24 w-24 place-items-center rounded-full bg-white">{percent}%</span>
              </div>
              <p className="mt-3 text-sm font-bold text-[#64748B]">Completado</p>
            </div>
          </aside>
        </div>
        <div className="mt-4 rounded-[16px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-900">Consejo: arrastra y suelta tareas para reprogramar en otra fase cuando conectemos el adapter de fechas.</div>
      </Card>
    );
  };

  const renderGanttBuilder = () => (
    <Card className="rounded-[24px] border border-[#E5EAF1] bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
      <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#16C784]">Custom Gantt Builder</p>
          <h3 className="mt-1 text-xl font-black text-[#0F172A]">Gantt personalizable y potente</h3>
          <p className="mt-1 text-sm font-medium text-[#64748B]">Control avanzado de planificación, progreso y vistas guardadas.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={saveGanttView} className="inline-flex h-10 items-center gap-2 rounded-[14px] border border-[#E5EAF1] bg-white px-4 text-sm font-bold text-slate-700 hover:bg-slate-50"><Save className="h-4 w-4" />Guardar vista</button>
          <button type="button" onClick={createNewSavedView} className="h-10 rounded-[14px] border border-[#E5EAF1] bg-white px-4 text-sm font-bold text-slate-700 hover:bg-slate-50">Nueva vista</button>
          <button type="button" onClick={exportTasks} className="inline-flex h-10 items-center gap-2 rounded-[14px] border border-[#E5EAF1] bg-white px-4 text-sm font-bold text-slate-700 hover:bg-slate-50"><Download className="h-4 w-4" />Exportar</button>
          <button type="button" onClick={() => setShowGanttSettings((value) => !value)} className="inline-flex h-10 items-center gap-2 rounded-[14px] bg-[#050B18] px-4 text-sm font-bold text-white"><Settings2 className="h-4 w-4" />Personalizar</button>
        </div>
      </div>

      <div className={cn("grid gap-5", showGanttSettings ? "xl:grid-cols-[minmax(0,1fr)_300px]" : "xl:grid-cols-1")}>
        <div className="overflow-hidden rounded-[20px] border border-[#E5EAF1] bg-white">
          <div className="grid grid-cols-[minmax(240px,1.2fr)_110px_110px_90px_90px_minmax(260px,1.4fr)] border-b border-[#E5EAF1] bg-[#F8FAFC] px-4 py-3 text-[11px] font-black uppercase tracking-[0.12em] text-[#64748B]">
            <div>Tarea</div><div>Inicio</div><div>Fin</div><div>Duración</div><div>Progreso</div><div>Timeline</div>
          </div>
          {timelineItems.map((task) => {
            const range = getTaskRange(task);
            return (
              <div key={task.id} className={cn("grid grid-cols-[minmax(240px,1.2fr)_110px_110px_90px_90px_minmax(260px,1.4fr)] items-center border-b border-[#EEF2F7] px-4 last:border-b-0 hover:bg-[#F8FAFC]", compactGantt ? "py-3" : "py-5")}>
                <div className="min-w-0">
                  <Link href={taskDetailRoute(task.id, currentQuery)} className="block truncate text-sm font-black text-[#0F172A] hover:text-emerald-700">{task.title}</Link>
                  <p className="truncate text-xs font-semibold text-[#64748B]">{task.client_name || "Sin cliente"}</p>
                </div>
                <div className="text-xs font-bold text-[#64748B]">{showDates ? formatHumanDate(toIsoDate(range.start)) : "—"}</div>
                <div className="text-xs font-bold text-[#64748B]">{showDates ? formatHumanDate(toIsoDate(range.end)) : "—"}</div>
                <div className="text-xs font-bold text-[#64748B]">{range.duration} días</div>
                <div className="text-xs font-black text-[#0F172A]">{showProgress ? `${getProgress(task)}%` : "—"}</div>
                <div className="h-8 rounded-2xl bg-slate-100 p-1">
                  <div className={cn("h-6 rounded-xl", barColor(task, ganttColorMode))} style={getBarStyle(task, timelineBounds.start, timelineBounds.end)} />
                </div>
              </div>
            );
          })}
        </div>

        {showGanttSettings ? (
          <aside className="rounded-[20px] border border-[#E5EAF1] bg-white p-5">
            <h4 className="text-sm font-black uppercase tracking-[0.14em] text-[#0F172A]">Personalizar vista</h4>
            <div className="mt-5 space-y-4">
              <SettingsCheckbox label="Mostrar % progreso" checked={showProgress} onChange={setShowProgress} />
              <SettingsCheckbox label="Mostrar fechas" checked={showDates} onChange={setShowDates} />
              <SettingsCheckbox label="Mostrar prioridad" checked={showPriority} onChange={setShowPriority} />
              <SettingsCheckbox label="Modo compacto" checked={compactGantt} onChange={setCompactGantt} />
              <label className="block space-y-2">
                <span className="text-xs font-black uppercase tracking-[0.12em] text-[#64748B]">Colores</span>
                <Select value={ganttColorMode} onChange={(event) => setGanttColorMode(event.target.value as GanttColorMode)} className="h-11 w-full rounded-[14px] border-[#E5EAF1] text-sm font-bold">
                  <option value="priority">Por prioridad</option>
                  <option value="status">Por estado</option>
                  <option value="client">Por cliente</option>
                </Select>
              </label>
              <label className="block space-y-2">
                <span className="text-xs font-black uppercase tracking-[0.12em] text-[#64748B]">Agrupar por</span>
                <Select className="h-11 w-full rounded-[14px] border-[#E5EAF1] text-sm font-bold" defaultValue="project">
                  <option value="none">Ninguno</option>
                  <option value="project">Proyecto</option>
                  <option value="client">Cliente</option>
                  <option value="department">Departamento</option>
                </Select>
              </label>
              <button type="button" onClick={saveGanttView} className="mt-2 h-11 w-full rounded-[14px] bg-[#050B18] text-sm font-black text-white hover:bg-slate-900">Guardar vista</button>
            </div>
          </aside>
        ) : null}
      </div>
    </Card>
  );

  return (
    <div className="space-y-4">
      <Card className="relative z-40 overflow-visible rounded-[24px] border border-[#E5EAF1] bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)] md:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#0F172A]">Vistas rápidas</h2>
            <p className="mt-1 text-sm font-medium text-[#64748B]">Alterna entre Lista, Tablero, Calendario y Timeline avanzado.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <ViewButton active={viewMode === "list"} icon={<List className="h-4 w-4" />} label="Lista" onClick={() => changeView("list")} />
            <ViewButton active={viewMode === "board"} icon={<LayoutGrid className="h-4 w-4" />} label="Tablero" onClick={() => changeView("board")} />
            <ViewButton active={viewMode === "calendar"} icon={<CalendarDays className="h-4 w-4" />} label="Calendario" onClick={() => changeView("calendar")} />
            <div className="relative z-50">
              <button
                type="button"
                onClick={() => setTimelineOpen((value) => !value)}
                className={cn(
                  "inline-flex h-11 items-center gap-2 rounded-[14px] border px-4 text-sm font-semibold transition",
                  timelineActive ? "border-[#050B18] bg-[#050B18] text-white shadow-[0_12px_26px_rgba(5,11,24,0.16)]" : "border-[#E5EAF1] bg-white text-slate-700 hover:bg-slate-50",
                )}
              >
                <Workflow className="h-4 w-4" />
                Timeline
                <ChevronDown className={cn("h-4 w-4 transition", timelineOpen && "rotate-180")} />
              </button>
              {timelineOpen ? (
                <div className="absolute right-0 z-[120] mt-2 w-56 rounded-[18px] border border-[#E5EAF1] bg-white p-2 shadow-[0_20px_50px_rgba(15,23,42,0.14)]">
                  <button type="button" onClick={() => changeView("timeline")} className="flex w-full items-center gap-3 rounded-[14px] px-3 py-3 text-left text-sm font-bold text-[#0F172A] hover:bg-[#F8FAFC]"><Layers3 className="h-4 w-4 text-[#16C784]" />Smart Timeline</button>
                  <button type="button" onClick={() => changeView("gantt")} className="flex w-full items-center gap-3 rounded-[14px] px-3 py-3 text-left text-sm font-bold text-[#0F172A] hover:bg-[#F8FAFC]"><Workflow className="h-4 w-4 text-[#16C784]" />Gantt Builder</button>
                  <button type="button" onClick={saveGanttView} className="flex w-full items-center gap-3 rounded-[14px] px-3 py-3 text-left text-sm font-bold text-[#0F172A] hover:bg-[#F8FAFC]"><Save className="h-4 w-4 text-slate-500" />Guardar vista</button>
                  <button type="button" onClick={exportTasks} className="flex w-full items-center gap-3 rounded-[14px] px-3 py-3 text-left text-sm font-bold text-[#0F172A] hover:bg-[#F8FAFC]"><Download className="h-4 w-4 text-slate-500" />Exportar</button>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {timelineActive ? (
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#E5EAF1] pt-4">
            <span className="text-xs font-black uppercase tracking-[0.14em] text-[#64748B]">Timeline activo</span>
            <button type="button" onClick={() => changeView("timeline")} className={cn("h-10 rounded-[14px] px-4 text-sm font-bold", viewMode === "timeline" ? "bg-[#16C784] text-white" : "border border-[#E5EAF1] bg-white text-slate-700")}>Smart Timeline</button>
            <button type="button" onClick={() => changeView("gantt")} className={cn("h-10 rounded-[14px] px-4 text-sm font-bold", viewMode === "gantt" ? "bg-[#16C784] text-white" : "border border-[#E5EAF1] bg-white text-slate-700")}>Gantt Builder</button>
            <button type="button" onClick={saveGanttView} className="inline-flex h-10 items-center gap-2 rounded-[14px] border border-[#E5EAF1] bg-white px-4 text-sm font-bold text-slate-700"><Save className="h-4 w-4" />Guardar vista</button>
            <button type="button" onClick={exportTasks} className="inline-flex h-10 items-center gap-2 rounded-[14px] border border-[#E5EAF1] bg-white px-4 text-sm font-bold text-slate-700"><Download className="h-4 w-4" />Exportar</button>
          </div>
        ) : null}
      </Card>

      {searchPanel ? <div className="relative z-10">{searchPanel}</div> : null}

      {selectedIds.length ? (
        <Card className="rounded-[20px] border border-emerald-100 bg-emerald-50/80 px-4 py-3 shadow-none">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-sm font-bold text-emerald-900">{selectedIds.length} tarea(s) seleccionada(s)</p>
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={bulkCompleteSelected} loading={busyId === "bulk"} className="h-10 rounded-[12px] bg-[#16C784] px-4 text-white hover:bg-[#12b777]">
                <CheckCircle2 className="h-4 w-4" />
                Finalizar
              </Button>
              <Button type="button" variant="secondary" onClick={bulkDeleteSelected} disabled={busyId === "bulk"} className="h-10 rounded-[12px] px-4">
                <Trash2 className="h-4 w-4" />
                Eliminar
              </Button>
              <Button type="button" variant="ghost" onClick={() => setSelectedIds([])} className="h-10 rounded-[12px] px-4">Limpiar selección</Button>
            </div>
          </div>
        </Card>
      ) : null}

      <div className="animate-[viewFadeIn_180ms_ease-out]">
        {viewMode === "list" ? renderTable() : null}
        {viewMode === "board" ? <TaskKanbanBoard tasks={items} showHeader={false} currentQuery={currentQuery} workspaceKey="tasks-page" /> : null}
        {viewMode === "calendar" ? renderCalendarPro() : null}
        {viewMode === "timeline" ? renderSmartTimeline() : null}
        {viewMode === "gantt" ? renderGanttBuilder() : null}
      </div>

      {viewMode === "list" ? (
        <Card className="rounded-[24px] border border-[#E5EAF1] bg-white px-4 py-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-sm font-medium text-[#64748B]">
              Mostrando {items.length ? (currentPage - 1) * pageSize + 1 : 0} a {Math.min(currentPage * pageSize, items.length)} de {items.length} tareas
            </p>

            <div className="flex flex-wrap items-center gap-2 md:justify-end">
              <Button type="button" variant="secondary" className="h-10 rounded-[12px] px-3" disabled={currentPage <= 1 || pageAnimation !== "idle"} onClick={() => animatePage("prev", currentPage - 1)}>
                <ArrowLeft className="h-4 w-4" />Anterior
              </Button>
              <span className="inline-flex h-10 min-w-10 items-center justify-center rounded-[12px] bg-[#050B18] px-3 text-sm font-bold text-white">{currentPage}</span>
              {totalPages > 1 ? <span className="inline-flex h-10 min-w-10 items-center justify-center rounded-[12px] border border-[#E5EAF1] bg-white px-3 text-sm font-bold text-slate-700">{Math.min(currentPage + 1, totalPages)}</span> : null}
              <Button type="button" variant="secondary" className="h-10 rounded-[12px] px-3" disabled={currentPage >= totalPages || pageAnimation !== "idle"} onClick={() => animatePage("next", currentPage + 1)}>
                Siguiente<ArrowRight className="h-4 w-4" />
              </Button>
              <div className="ml-0 flex items-center gap-2 rounded-[12px] border border-[#E5EAF1] bg-white px-3 py-1.5 md:ml-3">
                <span className="text-sm font-medium text-slate-500">Mostrar</span>
                <Select aria-label="Cantidad de tareas por página" className="h-8 min-w-[72px] border-none bg-transparent px-1 py-0 text-sm font-semibold text-[#0F172A] focus:border-none" value={String(pageSize)} onChange={(event) => { setPageSize(Number(event.target.value) as 10 | 20); setCurrentPage(1); }}>
                  <option value="10">10</option>
                  <option value="20">20</option>
                </Select>
              </div>
            </div>
          </div>
        </Card>
      ) : null}

      <style>{`
        @keyframes slideInFromRight { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slideInFromLeft { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes viewFadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

function ViewButton({ active, icon, label, onClick }: { active: boolean; icon: ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-11 items-center gap-2 rounded-[14px] border px-4 text-sm font-semibold transition",
        active ? "border-[#050B18] bg-[#050B18] text-white shadow-[0_12px_26px_rgba(5,11,24,0.16)]" : "border-[#E5EAF1] bg-white text-slate-700 hover:bg-slate-50",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function SettingsCheckbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-[14px] border border-[#E5EAF1] bg-[#F8FAFC] px-3 py-3 text-sm font-bold text-[#0F172A]">
      {label}
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4 rounded border-[#CBD5E1] text-[#16C784]" />
    </label>
  );
}

function CalendarMetric({ icon, label, value, tone }: { icon: ReactNode; label: string; value: number; tone: "violet" | "rose" | "amber" | "emerald" }) {
  const tones = {
    violet: "bg-violet-50 text-violet-700",
    rose: "bg-rose-50 text-rose-700",
    amber: "bg-amber-50 text-amber-700",
    emerald: "bg-emerald-50 text-emerald-700",
  } as const;
  return (
    <div className="flex items-center justify-between gap-3 rounded-[16px] border border-[#E5EAF1] bg-white p-3">
      <span className={cn("inline-flex h-9 w-9 items-center justify-center rounded-[12px]", tones[tone])}>{icon}</span>
      <span className="mr-auto text-sm font-bold text-[#64748B]">{label}</span>
      <span className="text-lg font-black text-[#0F172A]">{value}</span>
    </div>
  );
}

function buildCalendarDays(tasks: TaskRow[]) {
  const today = safeDate(todayIsoDate()) ?? new Date();
  const first = new Date(today.getFullYear(), today.getMonth(), 1, 12);
  const weekday = first.getDay() === 0 ? 6 : first.getDay() - 1;
  const start = addDays(first, -weekday);
  return Array.from({ length: 35 }, (_, index) => {
    const date = addDays(start, index);
    const iso = toIsoDate(date);
    return {
      iso,
      label: String(date.getDate()),
      isToday: iso === todayIsoDate(),
      tasks: tasks.filter((task) => task.due_date?.slice(0, 10) === iso),
    };
  });
}

export const TaskActionList = memo(TaskActionListComponent);
