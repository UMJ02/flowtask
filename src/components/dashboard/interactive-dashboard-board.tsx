"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Grip, LayoutPanelLeft, ListTodo, NotebookPen, Plus, StickyNote, TableProperties } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSidebarState } from "@/components/layout/sidebar-state";
import { cn } from "@/lib/utils/classnames";
import type { ProjectSummary } from "@/types/project";
import type { TaskSummary } from "@/types/task";

type PanelId = "task" | "projects" | "calendar";

type PanelState = {
  id: PanelId;
  title: string;
  x: number;
  y: number;
  expanded: boolean;
};

const initialPanels: PanelState[] = [
  { id: "task", title: "Tarea", x: 280, y: 52, expanded: true },
  { id: "projects", title: "Proyectos", x: 280, y: 250, expanded: false },
  { id: "calendar", title: "Calendario", x: 690, y: 52, expanded: true },
];

function formatDay(date: Date) {
  return new Intl.DateTimeFormat("es-CR", { day: "numeric" }).format(date);
}

function toDateKey(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

function buildCalendarDays() {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const firstWeekday = (firstDay.getDay() + 6) % 7;
  const start = new Date(firstDay);
  start.setDate(firstDay.getDate() - firstWeekday);
  return Array.from({ length: 35 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return day;
  });
}

export function InteractiveDashboardBoard({
  tasks,
  projects,
}: {
  tasks: TaskSummary[];
  projects: ProjectSummary[];
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { setCollapsed } = useSidebarState();
  const [panels, setPanels] = useState<PanelState[]>(initialPanels);
  const [activePanel, setActivePanel] = useState<PanelId>("task");
  const [notes, setNotes] = useState("");
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ id: PanelId; offsetX: number; offsetY: number } | null>(null);

  const calendarDays = useMemo(() => buildCalendarDays(), []);
  const calendarMap = useMemo(() => {
    const map = new Map<string, TaskSummary[]>();
    tasks.forEach((task) => {
      const key = toDateKey(task.dueDate);
      if (!key) return;
      const list = map.get(key) ?? [];
      list.push(task);
      map.set(key, list.slice(0, 2));
    });
    return map;
  }, [tasks]);

  useEffect(() => {
    setCollapsed(true);
    return () => setCollapsed(false);
  }, [setCollapsed]);

  useEffect(() => {
    function handlePointerMove(event: PointerEvent) {
      const drag = dragRef.current;
      const canvas = canvasRef.current;
      if (!drag || !canvas) return;
      const rect = canvas.getBoundingClientRect();
      const nextX = Math.max(16, Math.min(rect.width - 280, event.clientX - rect.left - drag.offsetX));
      const nextY = Math.max(16, Math.min(rect.height - 170, event.clientY - rect.top - drag.offsetY));
      setPanels((current) => current.map((panel) => panel.id === drag.id ? { ...panel, x: nextX, y: nextY } : panel));
    }
    function handlePointerUp() {
      dragRef.current = null;
    }
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, []);

  function togglePanel(id: PanelId) {
    setPanels((current) => current.map((panel) => panel.id === id ? { ...panel, expanded: !panel.expanded } : panel));
    setActivePanel(id);
  }

  function startDrag(event: React.PointerEvent<HTMLButtonElement>, id: PanelId) {
    const panelNode = event.currentTarget.closest("[data-panel-id]") as HTMLElement | null;
    const canvas = canvasRef.current;
    if (!panelNode || !canvas) return;
    const panelRect = panelNode.getBoundingClientRect();
    dragRef.current = {
      id,
      offsetX: event.clientX - panelRect.left,
      offsetY: event.clientY - panelRect.top,
    };
    setActivePanel(id);
  }

  return (
    <div className="space-y-4">
      <Card className="border-slate-200 bg-white px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Dashboard</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-950">Tu vista visual</h2>
            <p className="mt-1 text-sm text-slate-500">Muévete entre el tablero clásico y una pizarra interactiva, sin perder tu estilo actual.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/app/dashboard">
              <Button variant="secondary">Vista clásica</Button>
            </Link>
            <Link href="/app/projects">
              <Button variant="ghost">Ir a proyectos</Button>
            </Link>
          </div>
        </div>
      </Card>

      <div className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen((value) => !value)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-emerald-600 transition hover:border-emerald-200 hover:bg-emerald-50"
              aria-label="Abrir panel lateral"
            >
              <LayoutPanelLeft className="h-5 w-5" />
            </button>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Pizarra interactiva</p>
              <h1 className="mt-1 text-[1.9rem] font-semibold tracking-tight text-slate-950">Entorno gráfico</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <StickyNote className="h-4 w-4 text-emerald-600" />
            Crea, mueve y acomoda a tu forma.
          </div>
        </div>

        <div className="grid gap-0 xl:grid-cols-[220px_minmax(0,1fr)]">
          <aside className={cn("border-r border-slate-200 bg-slate-50/80 px-4 py-5 transition-all duration-200", sidebarOpen ? "block" : "hidden xl:block xl:w-[72px] xl:px-2") }>
            <div className={cn("space-y-3", !sidebarOpen && "xl:space-y-2")}>
              {[
                { id: "task" as PanelId, label: "Tarea", icon: ListTodo },
                { id: "projects" as PanelId, label: "Proyectos", icon: TableProperties },
                { id: "calendar" as PanelId, label: "Calendario", icon: CalendarDays },
              ].map((item) => {
                const Icon = item.icon;
                const selected = activePanel === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActivePanel(item.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition",
                      selected ? "border-emerald-200 bg-emerald-50 text-slate-950" : "border-slate-200 bg-white text-slate-700 hover:border-emerald-200 hover:bg-emerald-50/60",
                      !sidebarOpen && "xl:justify-center xl:px-0"
                    )}
                  >
                    <Icon className="h-4 w-4 text-emerald-600" />
                    {sidebarOpen ? <span className="text-sm font-medium">{item.label}</span> : null}
                  </button>
                );
              })}
            </div>
            {sidebarOpen ? (
              <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-white px-3 py-4 text-sm text-slate-500">
                Toca un panel para enfocarlo o arrastra la tarjeta dentro del tablero.
              </div>
            ) : null}
          </aside>

          <div className="bg-white p-5">
            <div ref={canvasRef} className="relative min-h-[720px] rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#fbfcfd_100%)] p-5">
              {panels.map((panel) => (
                <div
                  key={panel.id}
                  data-panel-id={panel.id}
                  className={cn(
                    "absolute w-[340px] rounded-[24px] border border-emerald-300 bg-white shadow-[0_16px_32px_rgba(15,23,42,0.06)]",
                    activePanel === panel.id && "ring-2 ring-emerald-200"
                  )}
                  style={{ left: panel.x, top: panel.y }}
                >
                  <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Panel</p>
                      <h3 className="mt-1 truncate text-xl font-semibold text-slate-950">{panel.title}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onPointerDown={(event) => startDrag(event, panel.id)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-500 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                        aria-label={`Mover ${panel.title}`}
                      >
                        <Grip className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => togglePanel(panel.id)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-[0_10px_24px_rgba(16,185,129,0.24)] transition hover:bg-emerald-400"
                        aria-label={`Expandir ${panel.title}`}
                      >
                        <Plus className={cn("h-4 w-4 transition-transform", panel.expanded && "rotate-45")} />
                      </button>
                    </div>
                  </div>

                  {panel.expanded ? (
                    <div className="px-5 py-4">
                      {panel.id === "task" ? (
                        <div className="space-y-3">
                          {['Título de la tarea', 'Qué sigue', 'Persona responsable', 'Fecha clave'].map((label) => (
                            <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">{label}</div>
                          ))}
                        </div>
                      ) : null}

                      {panel.id === "projects" ? (
                        <div className="space-y-3">
                          {(projects.slice(0, 4).length ? projects.slice(0, 4) : [{ id: 'empty-project', title: 'Todavía no hay proyectos', status: 'activo' as const }]).map((project) => (
                            <div key={project.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                              <p className="text-sm font-semibold text-slate-900">{project.title}</p>
                              <p className="mt-1 text-sm text-slate-500">{project.clientName?.trim() || 'Sin cliente'}</p>
                            </div>
                          ))}
                        </div>
                      ) : null}

                      {panel.id === "calendar" ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm text-slate-500">
                            <button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200"><ChevronLeft className="h-4 w-4" /></button>
                            <p className="font-medium text-slate-900">Calendario de tareas</p>
                            <button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200"><ChevronRight className="h-4 w-4" /></button>
                          </div>
                          <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                            {['L', 'K', 'M', 'J', 'V', 'S', 'D'].map((day) => <span key={day}>{day}</span>)}
                          </div>
                          <div className="grid grid-cols-7 gap-2">
                            {calendarDays.map((day) => {
                              const key = day.toISOString().slice(0, 10);
                              const items = calendarMap.get(key) ?? [];
                              const isCurrentMonth = day.getMonth() === new Date().getMonth();
                              return (
                                <div key={key} className={cn("min-h-[68px] rounded-xl border p-2 text-left", isCurrentMonth ? "border-slate-200 bg-white" : "border-slate-100 bg-slate-50 text-slate-400")}>
                                  <p className="text-xs font-semibold">{formatDay(day)}</p>
                                  {items[0] ? <p className="mt-2 line-clamp-2 rounded-lg bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-800">{items[0].title}</p> : null}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <div className="px-5 py-4 text-sm text-slate-500">Ábrelo para ver y editar este bloque dentro del tablero.</div>
                  )}
                </div>
              ))}

              <div className="absolute bottom-5 left-5 right-5">
                <div className="grid gap-4 rounded-[24px] border border-slate-200 bg-white/96 p-4 shadow-[0_12px_28px_rgba(15,23,42,0.06)] lg:grid-cols-[1.2fr_0.8fr]">
                  <div>
                    <div className="flex items-center gap-2 text-slate-900">
                      <NotebookPen className="h-4 w-4 text-emerald-600" />
                      <p className="font-semibold">Notas</p>
                    </div>
                    <textarea
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                      placeholder="Escribe una nota o recordatorio"
                      className="mt-3 h-28 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-300 focus:bg-white"
                    />
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                    <p className="text-sm font-semibold text-slate-900">Recordatorios del día</p>
                    <div className="mt-3 space-y-3 text-sm text-slate-600">
                      {(tasks.slice(0, 3).length ? tasks.slice(0, 3) : [{ id: 'fallback-reminder', title: 'Todavía no hay recordatorios para hoy', dueDate: null, status: 'en_proceso' as const }]).map((task, index) => (
                        <div key={task.id} className="flex items-start justify-between gap-3 border-b border-slate-200 pb-3 last:border-b-0 last:pb-0">
                          <span className="shrink-0 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{task.dueDate ? new Intl.DateTimeFormat('es-CR', { hour: 'numeric', minute: '2-digit' }).format(new Date(task.dueDate)) : index === 0 ? 'Ahora' : 'Luego'}</span>
                          <p className="min-w-0 flex-1 text-sm text-slate-700">{task.title}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
