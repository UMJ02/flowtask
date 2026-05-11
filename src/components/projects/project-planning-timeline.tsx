"use client";

import { useMemo, useState } from "react";
import { CalendarDays, ChevronDown, Download, Eye, Link2, Save, Settings2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/classnames";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

type ProjectPlanningTimelineProps = {
  project: any;
  tasks: any[];
  currentQuery?: string;
};

type ZoomMode = "day" | "week" | "month";
type ColorMode = "status" | "priority" | "responsible";
type GroupMode = "none" | "status" | "priority";

function safeDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(`${value.slice(0, 10)}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function diffDays(end: Date, start: Date) {
  return Math.round((end.getTime() - start.getTime()) / MS_PER_DAY);
}

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatDate(value?: string | null) {
  if (!value) return "Sin fecha";
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : value;
}

function getRange(task: any) {
  const end = safeDate(task.due_date) ?? safeDate(task.updated_at) ?? safeDate(task.created_at) ?? new Date();
  const priority = task.priority ?? "media";
  const duration = priority === "alta" ? 5 : priority === "baja" ? 3 : 4;
  return { start: addDays(end, -duration + 1), end, duration };
}

function getBounds(tasks: any[]) {
  if (!tasks.length) {
    const today = new Date();
    return { start: addDays(today, -7), end: addDays(today, 21) };
  }
  const ranges = tasks.map(getRange);
  return {
    start: addDays(new Date(Math.min(...ranges.map((r) => r.start.getTime()))), -2),
    end: addDays(new Date(Math.max(...ranges.map((r) => r.end.getTime()))), 5),
  };
}

function progressFor(task: any) {
  if (task.status === "concluido") return 100;
  if (typeof task.progress === "number") return Math.max(0, Math.min(100, Math.round(task.progress)));
  if (task.status === "en_espera") return 20;
  if (task.priority === "alta") return 70;
  if (task.priority === "baja") return 40;
  return 55;
}

function statusLabel(status?: string | null) {
  if (status === "concluido") return "Concluido";
  if (status === "produccion") return "Producción";
  if (status === "en_espera") return "En espera";
  return "En proceso";
}

function priorityLabel(priority?: string | null) {
  if (priority === "alta") return "Alta";
  if (priority === "baja") return "Baja";
  return "Media";
}

function colorClass(task: any, mode: ColorMode) {
  if (mode === "status") {
    if (task.status === "concluido") return "bg-emerald-500";
    if (task.status === "produccion") return "bg-violet-500";
    if (task.status === "en_espera") return "bg-amber-400";
    return "bg-blue-500";
  }
  if (mode === "responsible") {
    const bucket = String(task.client_name ?? task.title ?? "").length % 4;
    return ["bg-emerald-500", "bg-blue-500", "bg-violet-500", "bg-amber-400"][bucket] ?? "bg-blue-500";
  }
  if (task.priority === "alta") return "bg-rose-400";
  if (task.priority === "baja") return "bg-emerald-400";
  return "bg-amber-400";
}

function barStyle(task: any, start: Date, end: Date) {
  const range = getRange(task);
  const total = Math.max(1, diffDays(end, start) + 1);
  const offset = Math.max(0, diffDays(range.start, start));
  const duration = Math.max(1, diffDays(range.end, range.start) + 1);
  return { marginLeft: `${Math.min(96, (offset / total) * 100)}%`, width: `${Math.max(7, Math.min(100, (duration / total) * 100))}%` };
}

function exportCsv(project: any, tasks: any[]) {
  const header = ["project", "task", "status", "priority", "start", "end", "progress"];
  const rows = tasks.map((task) => {
    const range = getRange(task);
    return [project.title, task.title, task.status, task.priority ?? "media", toIsoDate(range.start), toIsoDate(range.end), progressFor(task)].map((v) => `"${String(v ?? "").replaceAll('"', '""')}"`).join(",");
  });
  const blob = new Blob([[header.join(","), ...rows].join("\n")], { type: "text/csv;charset=utf-8" });
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = `flowtask-proyecto-${project.id}-timeline.csv`;
  link.click();
  URL.revokeObjectURL(href);
}

// timeline-full-width-when-builder-hidden
export function ProjectPlanningTimeline({ project, tasks, currentQuery = "" }: ProjectPlanningTimelineProps) {
  const supabase = useMemo(() => createClient(), []);
  const [zoom, setZoom] = useState<ZoomMode>("week");
  const [colorBy, setColorBy] = useState<ColorMode>("status");
  const [groupBy, setGroupBy] = useState<GroupMode>("none");
  const [showBuilder, setShowBuilder] = useState(false);
  const [showConcluded, setShowConcluded] = useState(false);
  const [offset, setOffset] = useState(0);
  const [busy, setBusy] = useState(false);

  const visibleTasks = useMemo(() => tasks.filter((task) => showConcluded || task.status !== "concluido"), [showConcluded, tasks]);
  const bounds = useMemo(() => getBounds(visibleTasks), [visibleTasks]);
  const range = useMemo(() => {
    const shift = zoom === "day" ? 1 : zoom === "week" ? 7 : 30;
    return { start: addDays(bounds.start, offset * shift), end: addDays(bounds.end, offset * shift) };
  }, [bounds.end, bounds.start, offset, zoom]);
  const totalDays = Math.min(45, Math.max(7, diffDays(range.end, range.start) + 1));
  const days = Array.from({ length: totalDays }, (_, i) => addDays(range.start, i));
  const projectProgress = tasks.length ? Math.round(tasks.reduce((sum, task) => sum + progressFor(task), 0) / tasks.length) : 0;

  const groupedTasks = useMemo(() => {
    if (groupBy === "none") return [{ label: "Plan del proyecto", tasks: visibleTasks }];
    const map = new Map<string, any[]>();
    visibleTasks.forEach((task) => {
      const label = groupBy === "status" ? statusLabel(task.status) : priorityLabel(task.priority);
      map.set(label, [...(map.get(label) ?? []), task]);
    });
    return Array.from(map.entries()).map(([label, list]) => ({ label, tasks: list }));
  }, [groupBy, visibleTasks]);

  const saveView = async () => {
    setBusy(true);
    const config = { zoom, colorBy, groupBy, showConcluded, showBuilder, savedAt: new Date().toISOString() };
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      window.localStorage.setItem(`flowtask.project.${project.id}.planning`, JSON.stringify(config));
      setBusy(false);
      window.alert("Vista guardada localmente. Iniciá sesión para sincronizarla.");
      return;
    }
    const { error } = await supabase.from("task_view_preferences").upsert(
      { user_id: data.user.id, organization_id: project.organization_id ?? null, scope: `project:${project.id}`, name: "Timeline del proyecto", view_mode: "project_timeline", config },
      { onConflict: "user_id,organization_id,scope,name" },
    );
    setBusy(false);
    window.alert(error ? `No se pudo guardar la vista: ${error.message}` : "Vista del proyecto guardada.");
  };

  return (
    <section id="timeline" className="scroll-mt-28 rounded-[24px] border border-[#E7EDF5] bg-white p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#16A36C]">Project Planificación inteligente</p>
          <h2 className="mt-1 text-xl font-semibold tracking-[-0.02em] ft-text-main">Planificación colaborativa del proyecto</h2>
          <p className="mt-1 max-w-3xl text-sm font-medium ft-text-muted">Timeline híbrido con progreso, fechas y vista flexible. Las tareas simples viven en Tareas; la planificación avanzada vive aquí.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(["day", "week", "month"] as const).map((mode) => (
            <button key={mode} type="button" onClick={() => setZoom(mode)} className={cn("h-10 rounded-[14px] border px-4 text-sm font-semibold transition", zoom === mode ? "border-[#050B18] bg-[#050B18] text-white" : "border-[#E7EDF5] bg-white text-slate-700 hover:bg-slate-50")}>{mode === "day" ? "Día" : mode === "week" ? "Semana" : "Mes"}</button>
          ))}
          <button type="button" onClick={saveView} disabled={busy} className="inline-flex h-10 items-center gap-2 rounded-[14px] border border-[#E7EDF5] bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"><Save className="h-4 w-4" />Guardar vista</button>
          <button type="button" onClick={() => exportCsv(project, visibleTasks)} className="inline-flex h-10 items-center gap-2 rounded-[14px] border border-[#E7EDF5] bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"><Download className="h-4 w-4" />Exportar</button>
        </div>
      </div>

      <div className="mt-5 flex justify-center xl:justify-end">
        <button type="button" aria-pressed={showBuilder} onClick={() => setShowBuilder((v) => !v)} className={cn("inline-flex h-10 items-center gap-2 rounded-[14px] px-5 text-sm font-semibold ring-1 transition", showBuilder ? "bg-[#050B18] text-white ring-[#050B18]" : "bg-[#ECFDF5] text-[#087A4B] ring-[#BBF7D0]")}><Settings2 className="h-4 w-4" />Ajustes de vista</button>
      </div>

      <div className={cn("mt-6 grid gap-5", showBuilder ? "xl:grid-cols-[minmax(0,1fr)_320px]" : "xl:grid-cols-1")}>
        <div className="min-w-0">
          <div className="mb-4 flex flex-col gap-3 rounded-[18px] border border-[#E7EDF5] bg-[#FBFCFE] p-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setOffset((v) => v - 1)} className="inline-flex h-9 w-9 items-center justify-center rounded-[12px] border border-[#E7EDF5] bg-white">‹</button>
              <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold ft-text-main ring-1 ring-[#E5EAF1]">{formatDate(toIsoDate(range.start))} — {formatDate(toIsoDate(range.end))}</span>
              <button type="button" onClick={() => setOffset((v) => v + 1)} className="inline-flex h-9 w-9 items-center justify-center rounded-[12px] border border-[#E7EDF5] bg-white">›</button>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold ft-text-muted"><CalendarDays className="h-4 w-4" /> Avance del proyecto: <span className="text-[#16A66F]">{projectProgress}%</span></div>
          </div>

          {visibleTasks.length ? (
            <div className="overflow-x-auto rounded-[20px] border border-[#E7EDF5]">
              <div className="min-w-[980px] grid grid-cols-[320px_1fr] bg-white">
                <div className="border-r border-[#E7EDF5]">
                  <div className="h-10 border-b border-[#E7EDF5] bg-slate-50/80 px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.14em] ft-text-muted">Tarea / Responsable</div>
                  {groupedTasks.map((group) => (
                    <div key={group.label}>
                      <div className="border-b border-[#E7EDF5] bg-[#F8FAFC] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] ft-text-muted">{group.label}</div>
                      {group.tasks.map((task) => (
                        <div key={task.id} className="flex h-[64px] items-center gap-3 border-b border-[#EEF2F7] px-4 last:border-b-0">
                          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">{String(task.client_name ?? task.title ?? "FT").slice(0, 1).toUpperCase()}</span>
                          <div className="min-w-0">
                            <p className="block truncate text-sm font-semibold ft-text-main">{task.title}</p>
                            <p className="truncate text-xs font-semibold ft-text-muted">{statusLabel(task.status)} · {priorityLabel(task.priority)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                <div className="relative">
                  <div className="grid h-10 border-b border-[#E7EDF5] bg-slate-50/80" style={{ gridTemplateColumns: `repeat(${days.length}, minmax(40px, 1fr))` }}>
                    {days.map((day) => <div key={day.toISOString()} className="border-r border-[#EEF2F7] px-1 py-3 text-center text-[11px] font-semibold ft-text-muted last:border-r-0">{day.getDate()}</div>)}
                  </div>
                  {groupedTasks.map((group) => (
                    <div key={group.label}>
                      <div className="h-[33px] border-b border-[#E7EDF5] bg-[#F8FAFC]" />
                      {group.tasks.map((task) => {
                        const pct = progressFor(task);
                        return (
                          <div key={task.id} className="relative h-[64px] border-b border-[#EEF2F7] last:border-b-0">
                            <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${days.length}, minmax(40px, 1fr))` }}>{days.map((day) => <div key={day.toISOString()} className="border-r border-[#F1F5F9] last:border-r-0" />)}</div>
                            <span className="absolute top-1/2 h-5 -translate-y-1/2 overflow-hidden rounded-full bg-slate-100" style={barStyle(task, range.start, range.end)} title={`${task.title} · ${pct}%`}>
                              <span className={cn("block h-full rounded-full", colorClass(task, colorBy))} style={{ width: `${pct}%` }} />
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-[20px] border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-5 py-10 text-center">
              <p className="text-base font-semibold ft-text-main">Este proyecto aún no tiene tareas internas.</p>
              <p className="mt-2 text-sm font-medium ft-text-muted">Crea fases o tareas vinculadas para construir el timeline del proyecto.</p>
            </div>
          )}
        </div>

        {showBuilder ? (
          <aside className="rounded-[20px] border border-[#E7EDF5] bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] ft-text-muted">Ajustes de vista</p>
            <h3 className="mt-2 text-base font-semibold ft-text-main">Modificar vista</h3>
            <div className="mt-5 space-y-4">
              <label className="flex items-center justify-between rounded-[14px] border border-[#E7EDF5] bg-[#F8FAFC] px-4 py-3 text-sm font-bold ft-text-main">Incluir concluidas<input type="checkbox" checked={showConcluded} onChange={(e) => setShowConcluded(e.target.checked)} /></label>
              <label className="block text-xs font-semibold uppercase tracking-[0.14em] ft-text-muted">Colores<select value={colorBy} onChange={(e) => setColorBy(e.target.value as ColorMode)} className="mt-2 h-11 w-full rounded-[14px] border border-[#E7EDF5] bg-white px-3 text-sm font-bold ft-text-main"><option value="status">Por estado</option><option value="priority">Por prioridad</option><option value="responsible">Por responsable</option></select></label>
              <label className="block text-xs font-semibold uppercase tracking-[0.14em] ft-text-muted">Agrupar por<select value={groupBy} onChange={(e) => setGroupBy(e.target.value as GroupMode)} className="mt-2 h-11 w-full rounded-[14px] border border-[#E7EDF5] bg-white px-3 text-sm font-bold ft-text-main"><option value="none">Sin agrupar</option><option value="status">Estado</option><option value="priority">Prioridad</option></select></label>
              <button type="button" onClick={saveView} disabled={busy} className="h-11 w-full rounded-[14px] bg-[#050B18] text-sm font-semibold text-white hover:bg-slate-900 disabled:opacity-60"><Save className="mr-2 inline h-4 w-4" />Guardar vista</button>
            </div>
          </aside>
        ) : null}
      </div>
    </section>
  );
}
