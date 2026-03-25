'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { CalendarDays, ChevronLeft, ChevronRight, FolderKanban, Grip, LayoutGrid, Menu, Plus, StickyNote, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/classnames';

type PanelKey = 'task' | 'projects' | 'calendar';
type CalendarMode = 'week' | 'month';

const PANEL_META: Record<PanelKey, { label: string; icon: React.ComponentType<{ className?: string }>; description: string }> = {
  task: { label: 'Tarea', icon: LayoutGrid, description: 'Abre un bloque para crear o revisar tareas.' },
  projects: { label: 'Proyectos', icon: FolderKanban, description: 'Mantén a mano el estado de los proyectos activos.' },
  calendar: { label: 'Calendario', icon: CalendarDays, description: 'Consulta tareas por fecha en semana o mes.' },
};

function startOfWeek(date: Date) {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function formatShortDay(date: Date) {
  return new Intl.DateTimeFormat('es-CR', { weekday: 'short' }).format(date).replace('.', '');
}

function formatMonthLabel(date: Date) {
  return new Intl.DateTimeFormat('es-CR', { month: 'long', year: 'numeric' }).format(date);
}

function buildWeekDays(anchor: Date) {
  const start = startOfWeek(anchor);
  return Array.from({ length: 14 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return day;
  });
}

function buildMonthDays(anchor: Date) {
  const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const last = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0);
  const start = startOfWeek(first);
  const days: Date[] = [];
  const cursor = new Date(start);
  while (days.length < 35 || cursor <= last) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days.slice(0, 35);
}

function CalendarPanel({ mode, anchorDate, onModeChange, onStep }: { mode: CalendarMode; anchorDate: Date; onModeChange: (mode: CalendarMode) => void; onStep: (dir: -1 | 1) => void; }) {
  const days = mode === 'week' ? buildWeekDays(anchorDate) : buildMonthDays(anchorDate);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">Calendario</p>
          <p className="text-xs text-slate-500">Vista {mode === 'week' ? 'quincenal' : 'mensual'} para revisar fechas sin salir del tablero.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
            {(['week', 'month'] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => onModeChange(item)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-xs font-semibold transition',
                  mode === item ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                )}
              >
                {item === 'week' ? '2 semanas' : 'Mes'}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => onStep(-1)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => onStep(1)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-3">
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="text-sm font-semibold capitalize text-slate-900">{formatMonthLabel(anchorDate)}</p>
          <p className="text-xs text-slate-500">Tus tareas aparecen por fecha.</p>
        </div>

        <div className={cn('grid gap-2', mode === 'week' ? 'grid-cols-7' : 'grid-cols-7')}>
          {days.map((day, index) => {
            const inMonth = day.getMonth() === anchorDate.getMonth();
            const hasTask = index === (mode === 'week' ? 3 : 9);
            return (
              <div
                key={day.toISOString()}
                className={cn(
                  'rounded-lg border p-2',
                  mode === 'week' ? 'min-h-[84px]' : 'min-h-[76px]',
                  inMonth ? 'border-slate-200 bg-slate-50/70' : 'border-slate-100 bg-slate-50/30 text-slate-400'
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{formatShortDay(day)}</span>
                  <span className="text-xs font-semibold text-slate-700">{day.getDate()}</span>
                </div>
                {hasTask ? (
                  <div className="mt-2 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1.5 text-[11px] leading-4 text-emerald-900">
                    <p className="font-semibold">Revisión de avance</p>
                    <p className="truncate">Hoy · 2 pendientes</p>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function InteractiveDashboardBoard() {
  const [asideOpen, setAsideOpen] = useState(true);
  const [activePanels, setActivePanels] = useState<PanelKey[]>(['task', 'projects', 'calendar']);
  const [expanded, setExpanded] = useState<Record<PanelKey, boolean>>({ task: true, projects: false, calendar: true });
  const [calendarMode, setCalendarMode] = useState<CalendarMode>('week');
  const [anchorDate, setAnchorDate] = useState(new Date());
  const [notes, setNotes] = useState('');

  const reminders = useMemo(() => [], [] as string[]);

  function removePanel(key: PanelKey) {
    setActivePanels((current) => current.filter((item) => item !== key));
  }

  function restorePanel(key: PanelKey) {
    setActivePanels((current) => (current.includes(key) ? current : [...current, key]));
  }

  function toggleExpanded(key: PanelKey) {
    setExpanded((current) => ({ ...current, [key]: !current[key] }));
  }

  function stepCalendar(dir: -1 | 1) {
    setAnchorDate((current) => {
      const next = new Date(current);
      if (calendarMode === 'week') next.setDate(current.getDate() + dir * 14);
      else next.setMonth(current.getMonth() + dir);
      return next;
    });
  }

  return (
    <div className="space-y-4">
      <Card className="border-slate-200 bg-white px-5 py-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">Dashboard visual</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">Pizarra blanca opcional</h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-500">Organiza paneles, revisa fechas y deja recordatorios en un entorno gráfico más visual.</p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setAsideOpen((v) => !v)} className="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              <Menu className="h-4 w-4" /> {asideOpen ? 'Ocultar paneles' : 'Mostrar paneles'}
            </button>
            <Link href="/app/dashboard" className="inline-flex h-11 items-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Volver al dashboard
            </Link>
          </div>
        </div>
      </Card>

      <div className={cn('grid gap-4', asideOpen ? 'xl:grid-cols-[220px_minmax(0,1fr)]' : 'xl:grid-cols-[minmax(0,1fr)]')}>
        {asideOpen ? (
          <Card className="border-slate-200 bg-white p-4">
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Paneles</p>
                <p className="mt-1 text-sm text-slate-500">Activa o devuelve módulos al tablero.</p>
              </div>
              {(['task', 'projects', 'calendar'] as PanelKey[]).map((key) => {
                const meta = PANEL_META[key];
                const Icon = meta.icon;
                const active = activePanels.includes(key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => (active ? removePanel(key) : restorePanel(key))}
                    className={cn(
                      'flex w-full items-start gap-3 rounded-xl border px-3 py-3 text-left transition',
                      active ? 'border-emerald-200 bg-emerald-50/70' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    )}
                  >
                    <span className={cn('inline-flex h-10 w-10 items-center justify-center rounded-lg', active ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-700')}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-slate-900">{meta.label}</span>
                      <span className="mt-1 block text-xs leading-5 text-slate-500">{active ? 'Activo en pizarra' : meta.description}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>
        ) : null}

        <div className="space-y-4">
          <Card className="border-slate-200 bg-white p-4 md:p-5">
            <div className="grid gap-4 xl:grid-cols-2">
              {activePanels.includes('task') ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Panel</p>
                      <h3 className="mt-1 text-2xl font-bold text-slate-950">Tarea</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => removePanel('task')} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"><X className="h-4 w-4" /></button>
                      <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-emerald-200 bg-white text-emerald-600 hover:bg-emerald-50"><Grip className="h-4 w-4" /></button>
                      <button type="button" onClick={() => toggleExpanded('task')} className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white hover:bg-emerald-400"><Plus className={cn('h-4 w-4 transition-transform', expanded.task ? 'rotate-45' : '')} /></button>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-500">Ábrelo para ver y editar este bloque dentro del tablero.</p>
                  {expanded.task ? (
                    <div className="mt-4 grid gap-3">
                      <div className="h-12 rounded-full border border-emerald-200 bg-white" />
                      <div className="h-12 rounded-full border border-emerald-200 bg-white" />
                      <div className="h-12 rounded-full border border-emerald-200 bg-white" />
                      <div className="flex justify-end">
                        <Button className="h-10">Crear tarea</Button>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {activePanels.includes('projects') ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Panel</p>
                      <h3 className="mt-1 text-2xl font-bold text-slate-950">Proyectos</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => removePanel('projects')} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"><X className="h-4 w-4" /></button>
                      <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"><Grip className="h-4 w-4" /></button>
                      <button type="button" onClick={() => toggleExpanded('projects')} className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white hover:bg-emerald-400"><Plus className={cn('h-4 w-4 transition-transform', expanded.projects ? 'rotate-45' : '')} /></button>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-500">Mantén visibles los proyectos que quieres mover primero.</p>
                  {expanded.projects ? (
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {['Lanzamiento sitio web', 'Campaña Q2', 'Ajustes del catálogo', 'Revisión interna'].map((title) => (
                        <div key={title} className="rounded-lg border border-slate-200 bg-white px-4 py-3">
                          <p className="text-sm font-semibold text-slate-900">{title}</p>
                          <p className="mt-1 text-xs text-slate-500">Activo · seguimiento pendiente</p>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>

            {activePanels.includes('calendar') ? (
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Panel</p>
                      <h3 className="mt-1 text-2xl font-bold text-slate-950">Calendario</h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => removePanel('calendar')} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"><X className="h-4 w-4" /></button>
                    <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"><Grip className="h-4 w-4" /></button>
                  </div>
                </div>
                <CalendarPanel mode={calendarMode} anchorDate={anchorDate} onModeChange={setCalendarMode} onStep={stepCalendar} />
              </div>
            ) : null}
          </Card>

          <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
            <Card className="border-slate-200 bg-white p-4 md:p-5">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <StickyNote className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-lg font-semibold text-slate-900">Notas</p>
                  <p className="text-sm text-slate-500">Escribe una nota o recordatorio rápido.</p>
                </div>
              </div>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Escribe una nota o recordatorio"
                className="mt-4 min-h-[140px] w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-300 focus:bg-white"
              />
            </Card>

            <Card className="border-slate-200 bg-white p-4 md:p-5">
              <div>
                <p className="text-lg font-semibold text-slate-900">Recordatorios del día</p>
                <p className="mt-1 text-sm text-slate-500">Lo próximo que conviene revisar hoy.</p>
              </div>
              <div className="mt-4 space-y-3">
                {reminders.length ? reminders.map((item) => (
                  <div key={item} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700">{item}</div>
                )) : (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-4 text-sm text-slate-500">Todavía no hay recordatorios para hoy.</div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
