'use client';

import { useEffect, useMemo, useState, type ComponentType } from 'react';
import Link from 'next/link';
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  FolderKanban,
  Grip,
  LayoutGrid,
  LayoutPanelLeft,
  Menu,
  Pencil,
  Plus,
  StickyNote,
  Trash2,
  X,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/classnames';

type PanelKey = 'task' | 'projects' | 'calendar';
type CalendarMode = 'week' | 'month';

type QuickTask = {
  id: string;
  title: string;
  detail: string;
};

type Reminder = {
  id: string;
  label: string;
  done: boolean;
};

type BoardNote = {
  id: string;
  text: string;
  updatedAt: string;
};

const STORAGE_KEY = 'flowtask.board.v632';

const PANEL_META: Record<PanelKey, { label: string; icon: ComponentType<{ className?: string }>; description: string }> = {
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

function formatLongDate(date: Date) {
  return new Intl.DateTimeFormat('es-CR', { weekday: 'long', day: 'numeric', month: 'long' }).format(date);
}

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function isWeekend(date: Date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function buildWeekDays(anchor: Date) {
  const start = startOfWeek(anchor);
  const days: Date[] = [];
  const cursor = new Date(start);
  while (days.length < 10) {
    if (!isWeekend(cursor)) days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

function buildMonthDays(anchor: Date) {
  const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const last = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0);
  const start = startOfWeek(first);
  const days: Date[] = [];
  const cursor = new Date(start);
  while (cursor <= last || days.length % 5 !== 0 || days.length < 20) {
    if (!isWeekend(cursor)) days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

function sampleCalendarItems() {
  const today = new Date();
  const plus = (n: number) => {
    const d = new Date(today);
    d.setDate(today.getDate() + n);
    return isoDate(d);
  };
  return {
    [plus(0)]: ['Revisión de avance · 10:00'],
    [plus(1)]: ['Llamada con cliente · 14:00'],
    [plus(3)]: ['Cierre de entregables · 09:30'],
    [plus(7)]: ['Seguimiento semanal · 11:00'],
  } as Record<string, string[]>;
}

function CalendarPanel({
  mode,
  anchorDate,
  onModeChange,
  onStep,
  selectedDate,
  onSelectDate,
}: {
  mode: CalendarMode;
  anchorDate: Date;
  onModeChange: (mode: CalendarMode) => void;
  onStep: (dir: -1 | 1) => void;
  selectedDate: string;
  onSelectDate: (value: string) => void;
}) {
  const days = mode === 'week' ? buildWeekDays(anchorDate) : buildMonthDays(anchorDate);
  const itemsByDate = useMemo(() => sampleCalendarItems(), []);
  const selectedItems = itemsByDate[selectedDate] ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">Calendario</p>
          <p className="text-xs text-slate-500">Consulta 2 semanas laborales o una lectura mensual solo con días hábiles.</p>
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
          <button type="button" onClick={() => onStep(-1)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-50">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => onStep(1)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-50">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_260px]">
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-sm font-semibold capitalize text-slate-900">{formatMonthLabel(anchorDate)}</p>
            <p className="text-xs text-slate-500">Pulsa un día hábil para ver su agenda.</p>
          </div>

          <div className="grid grid-cols-5 gap-3">
            {days.map((day, index) => {
              const inMonth = day.getMonth() === anchorDate.getMonth();
              const key = isoDate(day);
              const hasTask = Boolean(itemsByDate[key]?.length) || index === (mode === 'week' ? 3 : 9);
              const isSelected = key === selectedDate;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onSelectDate(key)}
                  className={cn(
                    'rounded-lg border p-2 text-left transition',
                    mode === 'week' ? 'min-h-[88px]' : 'min-h-[84px]',
                    isSelected
                      ? 'border-emerald-300 bg-emerald-50 ring-1 ring-emerald-200'
                      : inMonth
                        ? 'border-slate-200 bg-slate-50/70 hover:border-slate-300 hover:bg-white'
                        : 'border-slate-100 bg-slate-50/30 text-slate-400 hover:border-slate-200'
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{formatShortDay(day).slice(0,3)}</span>
                    <span className="text-xs font-semibold leading-none text-slate-700">{day.getDate()}</span>
                  </div>
                  {hasTask ? (
                    <div className="mt-2 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[11px] font-medium leading-5 text-emerald-900">
                      <span className="line-clamp-3 block">{itemsByDate[key]?.[0] ?? '1 tarea'}</span>
                    </div>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Agenda del día</p>
          <h4 className="mt-2 text-base font-semibold text-slate-900 capitalize">{formatLongDate(new Date(selectedDate))}</h4>
          <div className="mt-4 space-y-3">
            {selectedItems.length ? (
              selectedItems.map((item) => (
                <div key={item} className="rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 shadow-sm">
                  {item}
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-slate-200 bg-white px-3 py-4 text-sm text-slate-500">
                No hay tareas programadas para esta fecha.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function InteractiveDashboardBoard() {
  const [hydrated, setHydrated] = useState(false);
  const [asideOpen, setAsideOpen] = useState(true);
  const [activePanels, setActivePanels] = useState<PanelKey[]>(['task', 'projects', 'calendar']);
  const [expanded, setExpanded] = useState<Record<PanelKey, boolean>>({ task: true, projects: false, calendar: true });
  const [calendarMode, setCalendarMode] = useState<CalendarMode>('week');
  const [anchorDate, setAnchorDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(isoDate(new Date()));
  const [noteDraft, setNoteDraft] = useState('');
  const [savedNotes, setSavedNotes] = useState<BoardNote[]>([]);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [taskDraft, setTaskDraft] = useState({ title: '', detail: '' });
  const [quickTasks, setQuickTasks] = useState<QuickTask[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [newReminder, setNewReminder] = useState('');

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed.asideOpen === 'boolean') setAsideOpen(parsed.asideOpen);
        if (Array.isArray(parsed.activePanels)) setActivePanels(parsed.activePanels);
        if (parsed.expanded) setExpanded(parsed.expanded);
        if (parsed.calendarMode === 'week' || parsed.calendarMode === 'month') setCalendarMode(parsed.calendarMode);
        if (parsed.anchorDate) setAnchorDate(new Date(parsed.anchorDate));
        if (parsed.selectedDate) setSelectedDate(parsed.selectedDate);
        if (typeof parsed.noteDraft === 'string') setNoteDraft(parsed.noteDraft);
        if (Array.isArray(parsed.savedNotes)) setSavedNotes(parsed.savedNotes);
        if (typeof parsed.editingNoteId === 'string' || parsed.editingNoteId === null) setEditingNoteId(parsed.editingNoteId);
        if (Array.isArray(parsed.quickTasks)) setQuickTasks(parsed.quickTasks);
        if (Array.isArray(parsed.reminders)) setReminders(parsed.reminders);
      } else {
        setReminders([
          { id: 'r1', label: 'Revisar entregables del día', done: false },
          { id: 'r2', label: 'Confirmar avance con el cliente', done: false },
        ]);
      }
    } catch {
      // ignore restore errors
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          asideOpen,
          activePanels,
          expanded,
          calendarMode,
          anchorDate: anchorDate.toISOString(),
          selectedDate,
          noteDraft,
          savedNotes,
          editingNoteId,
          quickTasks,
          reminders,
        })
      );
    } catch {
      // ignore persist errors
    }
  }, [hydrated, asideOpen, activePanels, expanded, calendarMode, anchorDate, selectedDate, noteDraft, savedNotes, editingNoteId, quickTasks, reminders]);

  const activeCount = activePanels.length;

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

  function addQuickTask() {
    const title = taskDraft.title.trim();
    if (!title) return;
    setQuickTasks((current) => [
      { id: crypto.randomUUID(), title, detail: taskDraft.detail.trim() || 'Sin detalle adicional' },
      ...current,
    ].slice(0, 4));
    setTaskDraft({ title: '', detail: '' });
  }

  function addReminder() {
    const label = newReminder.trim();
    if (!label) return;
    setReminders((current) => [{ id: crypto.randomUUID(), label, done: false }, ...current]);
    setNewReminder('');
  }

  function toggleReminder(id: string) {
    setReminders((current) => current.map((item) => (item.id === id ? { ...item, done: !item.done } : item)));
  }

  function removeReminder(id: string) {
    setReminders((current) => current.filter((item) => item.id !== id));
  }

  function editReminder(id: string) {
    const target = reminders.find((item) => item.id === id);
    if (!target) return;
    setNewReminder(target.label);
    setReminders((current) => current.filter((item) => item.id !== id));
  }

  function editSavedNote(id: string) {
    const target = savedNotes.find((item) => item.id === id);
    if (!target) return;
    setNoteDraft(target.text);
    setEditingNoteId(id);
    setSavedNotes((current) => current.filter((item) => item.id !== id));
  }

  function deleteSavedNote(id: string) {
    setSavedNotes((current) => current.filter((item) => item.id !== id));
    if (editingNoteId === id) {
      setEditingNoteId(null);
      setNoteDraft('');
    }
  }

  return (
    <div className="space-y-4">
      <Card className="border-slate-200 bg-white px-5 py-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">Modo pizarra</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">Tablero visual premium</h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-500">Mueve paneles, revisa fechas, guarda notas y deja listo lo importante en un espacio más visual.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">{activeCount} paneles activos</span>
              <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">Interacciones guardadas</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setAsideOpen((v) => !v)} className="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-50">
              <Menu className="h-4 w-4" /> {asideOpen ? 'Ocultar paneles' : 'Mostrar paneles'}
            </button>
            <Link href="/app/dashboard" className="inline-flex h-11 items-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-50">
              Volver al dashboard
            </Link>
          </div>
        </div>
      </Card>

      <div className={cn('grid gap-4', asideOpen ? 'xl:grid-cols-[220px_minmax(0,1fr)]' : 'xl:grid-cols-[minmax(0,1fr)]')}>
        {asideOpen ? (
          <Card className="border-slate-200 bg-white p-4 shadow-sm">
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Paneles</p>
                <p className="mt-1 text-sm text-slate-500">Activa, quita o vuelve a colocar módulos en la pizarra.</p>
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
                      active ? 'border-emerald-200 bg-emerald-50/70 shadow-sm' : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50'
                    )}
                  >
                    <span className={cn('inline-flex h-10 w-10 items-center justify-center rounded-lg transition', active ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-700')}>
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
          <Card className="border-slate-200 bg-white p-4 md:p-5 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white text-slate-700 shadow-sm"><LayoutPanelLeft className="h-4 w-4" /></span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Organiza tu tablero</p>
                  <p className="text-xs text-slate-500">Quita paneles, vuelve a activarlos desde el lateral y deja solo lo que usarás hoy.</p>
                </div>
              </div>
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">Estado guardado automáticamente</span>
            </div>
            <div className="grid gap-4 xl:grid-cols-2">
              {activePanels.includes('task') ? (
                <div className="rounded-xl border border-emerald-200 bg-white p-4 shadow-sm transition hover:shadow-md">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Panel</p>
                      <h3 className="mt-1 text-2xl font-bold text-slate-950">Tarea</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => removePanel('task')} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:-translate-y-0.5 hover:bg-slate-50"><X className="h-4 w-4" /></button>
                      <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-emerald-200 bg-white text-emerald-600 transition hover:-translate-y-0.5 hover:bg-emerald-50"><Grip className="h-4 w-4" /></button>
                      <button type="button" onClick={() => toggleExpanded('task')} className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white transition hover:-translate-y-0.5 hover:bg-emerald-400"><Plus className={cn('h-4 w-4 transition-transform', expanded.task ? 'rotate-45' : '')} /></button>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-500">Crea una tarea rápida y déjala lista como acción de hoy.</p>
                  {expanded.task ? (
                    <div className="mt-4 space-y-3">
                      <input
                        value={taskDraft.title}
                        onChange={(event) => setTaskDraft((current) => ({ ...current, title: event.target.value }))}
                        placeholder="Nombre de la tarea"
                        className="h-12 w-full rounded-full border border-emerald-200 bg-white px-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-300"
                      />
                      <input
                        value={taskDraft.detail}
                        onChange={(event) => setTaskDraft((current) => ({ ...current, detail: event.target.value }))}
                        placeholder="Detalle rápido"
                        className="h-12 w-full rounded-full border border-emerald-200 bg-white px-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-300"
                      />
                      <div className="flex justify-end">
                        <Button className="h-10" onClick={addQuickTask}>Crear tarea</Button>
                      </div>
                      {quickTasks.length ? (
                        <div className="grid gap-2">
                          {quickTasks.map((task) => (
                            <div key={task.id} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
                              <p className="text-sm font-semibold text-slate-900">{task.title}</p>
                              <p className="mt-1 text-xs text-slate-500">{task.detail}</p>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              ) : null}

              {activePanels.includes('projects') ? (
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Panel</p>
                      <h3 className="mt-1 text-2xl font-bold text-slate-950">Proyectos</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => removePanel('projects')} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:-translate-y-0.5 hover:bg-slate-50"><X className="h-4 w-4" /></button>
                      <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:-translate-y-0.5 hover:bg-slate-50"><Grip className="h-4 w-4" /></button>
                      <button type="button" onClick={() => toggleExpanded('projects')} className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white transition hover:-translate-y-0.5 hover:bg-emerald-400"><Plus className={cn('h-4 w-4 transition-transform', expanded.projects ? 'rotate-45' : '')} /></button>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-500">Ten a mano los frentes que quieres mover primero.</p>
                  {expanded.projects ? (
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {[
                        { title: 'Lanzamiento sitio web', state: 'En curso' },
                        { title: 'Campaña Q2', state: 'Pendiente de revisión' },
                        { title: 'Ajustes del catálogo', state: 'Necesita aprobación' },
                        { title: 'Revisión interna', state: 'Bloqueado' },
                      ].map((project) => (
                        <div key={project.title} className="rounded-lg border border-slate-200 bg-white px-4 py-3 transition hover:-translate-y-0.5 hover:shadow-sm">
                          <p className="text-sm font-semibold text-slate-900">{project.title}</p>
                          <p className="mt-1 text-xs text-slate-500">{project.state}</p>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>

            {activePanels.includes('calendar') ? (
              <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Panel</p>
                    <h3 className="mt-1 text-2xl font-bold text-slate-950">Calendario</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => removePanel('calendar')} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:-translate-y-0.5 hover:bg-slate-50"><X className="h-4 w-4" /></button>
                    <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:-translate-y-0.5 hover:bg-slate-50"><Grip className="h-4 w-4" /></button>
                  </div>
                </div>
                <CalendarPanel mode={calendarMode} anchorDate={anchorDate} onModeChange={setCalendarMode} onStep={stepCalendar} selectedDate={selectedDate} onSelectDate={setSelectedDate} />
              </div>
            ) : null}
          </Card>

          <div className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
            <Card className="border-slate-200 bg-white p-4 md:p-5 transition hover:shadow-md">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <StickyNote className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-lg font-semibold text-slate-900">Notas rápidas</p>
                  <p className="text-sm text-slate-500">Escribe una nota. Si dejas de escribir por 10 segundos, se guarda sola.</p>
                </div>
              </div>
              <textarea
                value={noteDraft}
                onChange={(event) => setNoteDraft(event.target.value)}
                placeholder="Escribe una nota o recordatorio"
                className="mt-4 min-h-[160px] w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-300 focus:bg-white"
              />
              <div className="mt-3 flex items-center justify-between gap-3 text-xs text-slate-500">
                <span>{noteDraft.trim() ? 'Se guardará sola en 10 segundos de inactividad' : 'Empieza escribiendo para dejar un recordatorio'}</span>
                <button type="button" onClick={() => { setNoteDraft(''); setEditingNoteId(null); }} className="font-medium text-slate-600 hover:text-slate-900">Limpiar editor</button>
              </div>
              <div className="mt-4 space-y-3">
                {savedNotes.length ? savedNotes.map((item, index) => (
                  <div key={item.id} className="group rounded-xl border border-slate-200 bg-slate-50/70 p-4 transition hover:border-slate-300 hover:bg-white">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm leading-6 text-slate-700 whitespace-pre-wrap">{item.text}</p>
                      <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                        <button type="button" onClick={() => editSavedNote(item.id)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-900">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button type="button" onClick={() => deleteSavedNote(item.id)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-rose-600">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    {index < savedNotes.length - 1 ? <div className="mt-3 border-t border-slate-200/80" /> : null}
                  </div>
                )) : null}
              </div>
            </Card>

            <Card className="border-slate-200 bg-white p-4 md:p-5 transition hover:shadow-md">
              <div>
                <p className="text-lg font-semibold text-slate-900">Lo que sigue hoy</p>
                <p className="mt-1 text-sm text-slate-500">Marca lo resuelto o agrega un aviso rápido para no perder el foco.</p>
              </div>
              <div className="mt-4 flex gap-2">
                <input
                  value={newReminder}
                  onChange={(event) => setNewReminder(event.target.value)}
                  placeholder="Agregar aviso"
                  className="h-10 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-300"
                />
                <button type="button" onClick={addReminder} className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500 text-white transition hover:-translate-y-0.5 hover:bg-emerald-400">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-4 space-y-3">
                {reminders.length ? reminders.map((item) => (
                  <div key={item.id} className={cn('flex items-start gap-3 rounded-lg border px-3 py-3 transition', item.done ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-white')}>
                    <button type="button" onClick={() => toggleReminder(item.id)} className={cn('mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border', item.done ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 bg-white text-transparent')}>
                      <Check className="h-3 w-3" />
                    </button>
                    <button type="button" onClick={() => editReminder(item.id)} className="flex-1 text-left text-sm">
                      <span className={cn(item.done && 'line-through opacity-80')}>{item.label}</span>
                    </button>
                    <button type="button" onClick={() => removeReminder(item.id)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-slate-400 transition hover:border-slate-200 hover:bg-white hover:text-rose-600">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )) : (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-5 text-sm text-slate-500">Todavía no tienes avisos pendientes para hoy.</div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
