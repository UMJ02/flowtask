'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Menu, Plus, StickyNote, X, FolderKanban, ClipboardList, Users, BrainCircuit, BarChart3, LayoutGrid, Bell } from 'lucide-react';
import { appNavLinks } from '@/components/layout/nav-links';
import { NotificationBell } from '@/components/notifications/notification-bell';
import { UserMenu } from '@/components/layout/user-menu';
import { cn } from '@/lib/utils/classnames';

export type DashboardTaskItem = {
  id: string;
  title: string;
  due_date?: string | null;
  status?: string | null;
};

export type DashboardProjectItem = {
  id: string;
  title: string;
  status?: string | null;
};

type BoardPanelKey = 'task' | 'projects' | 'calendar';

type PanelState = {
  key: BoardPanelKey;
  title: string;
  x: number;
  y: number;
  w: number;
  expanded: boolean;
};

const defaultPanels: Record<BoardPanelKey, PanelState> = {
  task: { key: 'task', title: 'Tarea', x: 340, y: 84, w: 360, expanded: true },
  projects: { key: 'projects', title: 'Proyectos', x: 760, y: 92, w: 320, expanded: false },
  calendar: { key: 'calendar', title: 'Calendario', x: 540, y: 330, w: 540, expanded: true },
};

function formatShortDate(value?: string | null) {
  if (!value) return 'Sin fecha';
  try {
    return new Intl.DateTimeFormat('es-CR', { day: '2-digit', month: 'short' }).format(new Date(value));
  } catch {
    return 'Sin fecha';
  }
}

function buildMonthGrid(tasks: DashboardTaskItem[]) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1);
  const startWeekDay = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const labels = ['L', 'K', 'M', 'J', 'V', 'S', 'D'];
  const taskMap = new Map<number, DashboardTaskItem[]>();

  tasks.forEach((task) => {
    if (!task.due_date) return;
    const date = new Date(task.due_date);
    if (date.getFullYear() !== year || date.getMonth() !== month) return;
    const day = date.getDate();
    const current = taskMap.get(day) ?? [];
    current.push(task);
    taskMap.set(day, current);
  });

  const cells = Array.from({ length: 35 }, (_, index) => {
    const dayNumber = index - startWeekDay + 1;
    if (dayNumber < 1 || dayNumber > daysInMonth) return null;
    return { dayNumber, tasks: taskMap.get(dayNumber) ?? [] };
  });

  return { labels, cells, monthLabel: new Intl.DateTimeFormat('es-CR', { month: 'long', year: 'numeric' }).format(today) };
}

function NotesBoard() {
  const [note, setNote] = useState('Escribe una nota o recordatorio');
  const [timeline] = useState([
    { time: '7:30 pm', label: 'Llamar a los proveedores de impresos' },
  ]);

  return (
    <div className="grid gap-0 rounded-[28px] border border-slate-200 bg-white/90 md:grid-cols-[1.1fr_0.9fr]">
      <div className="p-6">
        <p className="text-sm font-semibold text-slate-700">Notas</p>
        <div className="mt-3 border-t border-slate-200 pt-4">
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            className="min-h-[88px] w-full resize-none border-0 bg-transparent p-0 text-xl leading-relaxed text-slate-900 outline-none placeholder:text-slate-400"
          />
        </div>
      </div>
      <div className="border-t border-slate-200 p-6 md:border-l md:border-t-0">
        <p className="text-sm font-semibold text-slate-700">Recordatorios del día</p>
        <div className="mt-4 space-y-3">
          {timeline.map((item) => (
            <div key={`${item.time}-${item.label}`} className="flex items-center gap-4 border-b border-slate-100 pb-3 text-sm text-slate-700">
              <span className="min-w-[68px] font-medium text-slate-500">{item.time}</span>
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BoardWidget({
  panel,
  onMove,
  onToggle,
  children,
}: {
  panel: PanelState;
  onMove: (key: BoardPanelKey, dx: number, dy: number) => void;
  onToggle: (key: BoardPanelKey) => void;
  children: React.ReactNode;
}) {
  const [dragging, setDragging] = useState(false);
  const [start, setStart] = useState<{ x: number; y: number } | null>(null);

  return (
    <section
      className={cn(
        'absolute rounded-[30px] border-2 border-emerald-500 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.06)] transition-shadow',
        dragging && 'shadow-[0_28px_80px_rgba(16,185,129,0.16)]',
      )}
      style={{ left: panel.x, top: panel.y, width: panel.w }}
    >
      <div
        className="flex cursor-move items-center justify-between gap-3 px-6 py-5"
        onMouseDown={(event) => {
          setDragging(true);
          setStart({ x: event.clientX, y: event.clientY });
        }}
        onMouseMove={(event) => {
          if (!dragging || !start) return;
          onMove(panel.key, event.clientX - start.x, event.clientY - start.y);
          setStart({ x: event.clientX, y: event.clientY });
        }}
        onMouseUp={() => {
          setDragging(false);
          setStart(null);
        }}
        onMouseLeave={() => {
          if (!dragging) return;
          setDragging(false);
          setStart(null);
        }}
      >
        <h3 className="text-[1.65rem] font-medium tracking-tight text-slate-900">{panel.title}</h3>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onToggle(panel.key);
          }}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm transition hover:bg-emerald-400"
          aria-label={`Expandir ${panel.title}`}
        >
          <Plus className={cn('h-5 w-5 transition-transform', panel.expanded && 'rotate-45')} />
        </button>
      </div>
      <div className="px-6 pb-6">{children}</div>
      <button type="button" className="absolute bottom-4 right-4 inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800">
        Borrar del tablero <X className="h-4 w-4" />
      </button>
    </section>
  );
}

function BoardSidebar({ open, onClose, onReset }: { open: boolean; onClose: () => void; onReset: () => void }) {
  const quickLinks = appNavLinks.slice(0, 6);
  return (
    <>
      {open ? <button type="button" className="fixed inset-0 z-40 bg-slate-950/10" onClick={onClose} /> : null}
      <aside className={cn('fixed left-6 top-24 z-50 w-[280px] rounded-[30px] border border-slate-200 bg-white p-4 shadow-[0_24px_60px_rgba(15,23,42,0.08)] transition-all', open ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0 pointer-events-none')}>
        <div className="flex items-center justify-between gap-3 px-2 pb-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">Entorno gráfico</p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900">Tablero interactivo</h2>
          </div>
          <button type="button" onClick={onClose} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="space-y-2">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href} className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-emerald-600">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{link.label}</p>
                  <p className="text-xs text-slate-500">{link.hint}</p>
                </div>
              </Link>
            );
          })}
        </nav>
        <div className="mt-4 rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-600">
          Mueve los paneles sobre la pizarra, abre el que necesites y deja notas rápidas sin salir del tablero.
        </div>
        <button type="button" onClick={onReset} className="mt-4 inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:border-emerald-200 hover:bg-emerald-50">
          Restablecer paneles
        </button>
      </aside>
    </>
  );
}

export function InteractiveDashboard({
  userName,
  userEmail,
  tasks,
  projects,
}: {
  userName?: string | null;
  userEmail: string;
  tasks: DashboardTaskItem[];
  projects: DashboardProjectItem[];
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [panels, setPanels] = useState<Record<BoardPanelKey, PanelState>>(defaultPanels);
  const calendar = useMemo(() => buildMonthGrid(tasks), [tasks]);
  const activeTasks = tasks.filter((item) => item.status !== 'concluido').slice(0, 4);
  const activeProjects = projects.filter((item) => item.status !== 'concluido').slice(0, 4);

  return (
    <div className="min-h-[calc(100vh-2rem)] rounded-[40px] border border-slate-200 bg-[#fcfffe] p-6 shadow-[0_24px_60px_rgba(15,23,42,0.05)] md:p-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-600">FlowTask</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Pizarra interactiva</h1>
          <p className="mt-2 text-sm text-slate-500">Un entorno gráfico para mover paneles, revisar tu calendario y dejar recordatorios rápidos.</p>
        </div>
        <div className="flex items-center gap-3">
          <NotificationBell compact />
          <UserMenu fullName={userName} email={userEmail} />
          <button type="button" onClick={() => setSidebarOpen(true)} className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-emerald-600 shadow-sm transition hover:bg-emerald-50" aria-label="Abrir menú del tablero">
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      <BoardSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} onReset={() => setPanels(defaultPanels)} />

      <div className="relative mt-8 min-h-[820px] rounded-[36px] border-4 border-emerald-500 bg-white [background-image:radial-gradient(circle_at_1px_1px,rgba(148,163,184,0.14)_1px,transparent_0)] [background-size:24px_24px] p-6">
        <div className="absolute left-10 top-16 flex flex-col gap-4">
          {[
            { key: 'task' as const, icon: ClipboardList, label: 'Tarea' },
            { key: 'projects' as const, icon: FolderKanban, label: 'Proyectos' },
            { key: 'calendar' as const, icon: CalendarDays, label: 'Calendario' },
          ].map((item) => {
            const Icon = item.icon;
            const active = panels[item.key].expanded;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setPanels((current) => ({ ...current, [item.key]: { ...current[item.key], expanded: !current[item.key].expanded } }))}
                className={cn('inline-flex w-[116px] items-center justify-center gap-2 rounded-[22px] border px-4 py-5 text-lg font-medium transition', active ? 'border-emerald-500 bg-white text-slate-900 shadow-sm' : 'border-slate-200 bg-white/70 text-slate-400')}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="absolute left-[180px] top-[236px] hidden w-[160px] border-t-2 border-dashed border-emerald-300 md:block" />

        <BoardWidget
          panel={panels.task}
          onMove={(key, dx, dy) => setPanels((current) => ({ ...current, [key]: { ...current[key], x: Math.max(220, current[key].x + dx), y: Math.max(80, current[key].y + dy) } }))}
          onToggle={(key) => setPanels((current) => ({ ...current, [key]: { ...current[key], expanded: !current[key].expanded } }))}
        >
          {panels.task.expanded ? (
            <div className="space-y-4">
              <input className="h-14 w-full rounded-full border border-emerald-100 bg-emerald-50/40 px-5 text-base outline-none placeholder:text-slate-400 focus:border-emerald-300" placeholder="Escribe la tarea" />
              <input className="h-14 w-full rounded-full border border-slate-200 px-5 text-base outline-none placeholder:text-slate-400 focus:border-emerald-300" placeholder="Responsable o cliente" />
              <input className="h-14 w-full rounded-full border border-slate-200 px-5 text-base outline-none placeholder:text-slate-400 focus:border-emerald-300" placeholder="Fecha o nota rápida" />
              <button type="button" className="inline-flex h-12 items-center justify-center rounded-full bg-emerald-500 px-5 text-sm font-semibold text-white transition hover:bg-emerald-400">Crear tarea</button>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Abre este panel para crear una tarea rápida sin salir del tablero.</p>
          )}
        </BoardWidget>

        <BoardWidget
          panel={panels.projects}
          onMove={(key, dx, dy) => setPanels((current) => ({ ...current, [key]: { ...current[key], x: Math.max(220, current[key].x + dx), y: Math.max(80, current[key].y + dy) } }))}
          onToggle={(key) => setPanels((current) => ({ ...current, [key]: { ...current[key], expanded: !current[key].expanded } }))}
        >
          {panels.projects.expanded ? (
            <div className="space-y-3">
              {activeProjects.length ? activeProjects.map((project) => (
                <div key={project.id} className="rounded-[22px] border border-slate-200 px-4 py-3">
                  <p className="text-base font-semibold text-slate-900">{project.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{project.status || 'Activo'}</p>
                </div>
              )) : <p className="text-sm text-slate-500">Todavía no hay proyectos activos.</p>}
            </div>
          ) : (
            <p className="text-sm text-slate-500">Muestra los proyectos activos del momento en un solo bloque.</p>
          )}
        </BoardWidget>

        <BoardWidget
          panel={panels.calendar}
          onMove={(key, dx, dy) => setPanels((current) => ({ ...current, [key]: { ...current[key], x: Math.max(220, current[key].x + dx), y: Math.max(80, current[key].y + dy) } }))}
          onToggle={(key) => setPanels((current) => ({ ...current, [key]: { ...current[key], expanded: !current[key].expanded } }))}
        >
          {panels.calendar.expanded ? (
            <div>
              <div className="mb-4 flex items-center justify-between gap-3">
                <p className="text-sm font-medium uppercase tracking-[0.16em] text-slate-500">{calendar.monthLabel}</p>
                <div className="flex items-center gap-2 text-slate-400">
                  <ChevronLeft className="h-4 w-4" />
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>
              <div className="grid grid-cols-7 gap-2 text-center text-sm font-medium text-slate-600">
                {calendar.labels.map((label) => <div key={label}>{label}</div>)}
              </div>
              <div className="mt-3 grid grid-cols-7 gap-2">
                {calendar.cells.map((cell, index) => (
                  <div key={index} className="min-h-[74px] rounded-xl border border-slate-200 bg-white p-2 text-left">
                    {cell ? (
                      <>
                        <p className="text-xs font-semibold text-slate-500">{cell.dayNumber}</p>
                        {cell.tasks[0] ? (
                          <div className="mt-1 rounded-lg bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-800">
                            <p className="truncate">{cell.tasks[0].title}</p>
                            <p className="mt-0.5 text-[10px] text-emerald-600">{cell.tasks[0].status || 'Pendiente'}</p>
                          </div>
                        ) : null}
                      </>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Abre el calendario para ver tareas por fecha en una vista visual.</p>
          )}
        </BoardWidget>

        <div className="absolute bottom-8 left-8 right-8">
          <NotesBoard />
        </div>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Resumen rápido</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[22px] border border-slate-200 px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-slate-600">Hoy</span>
                <span className="text-2xl font-semibold tabular-nums text-slate-900">{tasks.filter((item) => item.due_date && new Date(item.due_date).toDateString() === new Date().toDateString()).length}</span>
              </div>
            </div>
            <div className="rounded-[22px] border border-slate-200 px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-slate-600">Atrasadas</span>
                <span className="text-2xl font-semibold tabular-nums text-slate-900">{tasks.filter((item) => item.due_date && new Date(item.due_date) < new Date() && item.status !== 'concluido').length}</span>
              </div>
            </div>
            <div className="rounded-[22px] border border-slate-200 px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-slate-600">Activos</span>
                <span className="text-2xl font-semibold tabular-nums text-slate-900">{activeProjects.length}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-[28px] border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Sugerencia del tablero</p>
          <p className="mt-3 text-lg font-semibold text-slate-900">Empieza por lo importante</p>
          <p className="mt-2 text-sm leading-7 text-slate-500">Arrastra cada panel a la zona donde te sea más cómodo trabajar. Abre la tarea rápida para crear pendientes, usa el calendario para revisar fechas y deja tus notas en la parte inferior.</p>
        </div>
      </div>
    </div>
  );
}
