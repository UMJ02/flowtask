'use client';

import { useEffect, useMemo, useState, type ComponentType } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FolderKanban,
  Grip,
  LayoutGrid,
  LayoutPanelLeft,
  Menu,
  Pencil,
  Plus,
  Star,
  StickyNote,
  Trash2,
  X,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { readWorkspaceMemory, toggleFavorite, type MemoryEntity } from '@/lib/local/workspace-memory';
import { cn } from '@/lib/utils/classnames';
import { TaskKanbanBoard } from '@/components/tasks/task-kanban-board';
import { taskDetailRoute, taskEditRoute, projectDetailRoute } from '@/lib/navigation/routes';

type PanelKey = 'task' | 'projects' | 'calendar' | 'kanban';
type CalendarMode = 'week' | 'month';

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

type TaskRow = {
  id: string;
  title: string;
  description: string | null;
  status: string | null;
  client_name: string | null;
  due_date: string | null;
  project_id: string | null;
  organization_id: string | null;
  owner_id: string | null;
  created_at?: string | null;
};

type ProjectRow = {
  id: string;
  title: string;
  status: string | null;
  client_name: string | null;
  due_date: string | null;
  organization_id: string | null;
  owner_id: string | null;
  created_at?: string | null;
};

const STORAGE_KEY = 'flowtask.board.v622';

const PANEL_META: Record<PanelKey, { label: string; icon: ComponentType<{ className?: string }>; description: string }> = {
  task: { label: 'Tarea', icon: LayoutGrid, description: 'Agregar a pizarra' },
  projects: { label: 'Proyectos', icon: FolderKanban, description: 'Agregar a pizarra' },
  calendar: { label: 'Calendario', icon: CalendarDays, description: 'Agregar a pizarra' },
  kanban: { label: 'Flujo', icon: CheckCircle2, description: 'Agregar a pizarra' },
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

function formatStatus(status: string | null | undefined) {
  switch (status) {
    case 'en_proceso':
      return 'En proceso';
    case 'en_espera':
      return 'En espera';
    case 'concluido':
      return 'Concluida';
    case 'activo':
      return 'Activo';
    case 'en_pausa':
      return 'En pausa';
    case 'completado':
      return 'Completado';
    case 'vencido':
      return 'Vencido';
    default:
      return 'Sin estado';
  }
}

function taskMeta(task: TaskRow) {
  const bits = [task.title];
  if (task.client_name?.trim()) bits.push(task.client_name.trim());
  return bits.join(' · ');
}

function taskEntity(task: TaskRow): MemoryEntity {
  return {
    id: task.id,
    type: 'task',
    title: task.title,
    subtitle: task.client_name?.trim() || formatStatus(task.status),
    href: taskDetailRoute(task.id),
    updatedAt: task.created_at || new Date().toISOString(),
  };
}

function favoriteTaskSet() {
  return new Set(readWorkspaceMemory().favorites.filter((item) => item.type === 'task').map((item) => item.id));
}

function CalendarPanel({
  mode,
  anchorDate,
  onModeChange,
  onStep,
  selectedDate,
  onSelectDate,
  tasks,
  favoriteTaskIds,
  onOpenTask,
}: {
  mode: CalendarMode;
  anchorDate: Date;
  onModeChange: (mode: CalendarMode) => void;
  onStep: (dir: -1 | 1) => void;
  selectedDate: string;
  onSelectDate: (value: string) => void;
  tasks: TaskRow[];
  favoriteTaskIds: Set<string>;
  onOpenTask: (taskId: string) => void;
}) {
  const days = mode === 'week' ? buildWeekDays(anchorDate) : buildMonthDays(anchorDate);

  const itemsByDate = useMemo(() => {
    const map: Record<string, TaskRow[]> = {};
    for (const task of tasks) {
      if (!task.due_date) continue;
      map[task.due_date] = [...(map[task.due_date] ?? []), task];
    }
    return map;
  }, [tasks]);

  const selectedItems = (itemsByDate[selectedDate] ?? []).filter((task) => favoriteTaskIds.has(task.id));

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

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-sm font-semibold capitalize text-slate-900">{formatMonthLabel(anchorDate)}</p>
            <p className="text-xs text-slate-500">Pulsa un día hábil para ver su agenda.</p>
          </div>

          <div className="grid grid-cols-5 gap-3">
            {days.map((day) => {
              const inMonth = day.getMonth() === anchorDate.getMonth();
              const key = isoDate(day);
              const dayTasks = itemsByDate[key] ?? [];
              const favoriteTasks = dayTasks.filter((task) => favoriteTaskIds.has(task.id));
              const isSelected = key === selectedDate;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onSelectDate(key)}
                  className={cn(
                    'flex min-w-0 flex-col justify-start rounded-lg border p-3 text-left transition',
                    mode === 'week' ? 'min-h-[88px]' : 'min-h-[84px]',
                    isSelected
                      ? 'border-sky-400 bg-white ring-1 ring-sky-100'
                      : inMonth
                        ? 'border-slate-200 bg-slate-50/70 hover:border-slate-300 hover:bg-white'
                        : 'border-slate-100 bg-slate-50/30 text-slate-400 hover:border-slate-200'
                  )}
                >
                  <div className="flex items-baseline gap-2 text-left">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{formatShortDay(day).slice(0, 3)}</span>
                    <span className="text-xs font-semibold leading-none text-slate-700">{day.getDate()}</span>
                  </div>
                  {dayTasks.length ? (
                    <div className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[11px] font-medium leading-5 text-emerald-900">
                      <span className="line-clamp-2 block">{taskMeta((favoriteTasks[0] ?? dayTasks[0]))}</span>
                      {favoriteTasks.length > 1 ? <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-700">+{favoriteTasks.length - 1} favorita(s)</span> : dayTasks.length > 1 ? <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-700">+{dayTasks.length - 1} más</span> : null}
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
                <div
                  key={item.id}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                      <p className="mt-1 text-xs text-slate-500">{item.client_name?.trim() || 'Sin cliente'} · {formatStatus(item.status)}</p>
                    </div>
                    <button type="button" onClick={() => onOpenTask(item.id)} className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-emerald-200 text-emerald-700 transition hover:bg-emerald-50" title="Abrir tarea" aria-label="Abrir tarea">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-slate-200 bg-white px-3 py-4 text-sm text-slate-500">
                No hay tareas favoritas programadas para esta fecha.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function InteractiveDashboardBoard() {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [asideOpen, setAsideOpen] = useState(true);
  const [activePanels, setActivePanels] = useState<PanelKey[]>(['kanban', 'task', 'projects', 'calendar']);
  const [expanded, setExpanded] = useState<Record<PanelKey, boolean>>({ task: true, projects: true, calendar: true, kanban: true });
  const [calendarMode, setCalendarMode] = useState<CalendarMode>('week');
  const [anchorDate, setAnchorDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(isoDate(new Date()));
  const [noteDraft, setNoteDraft] = useState('');
  const [savedNotes, setSavedNotes] = useState<BoardNote[]>([]);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [taskDraft, setTaskDraft] = useState({ title: '', detail: '' });
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [newReminder, setNewReminder] = useState('');
  const [boardTasks, setBoardTasks] = useState<TaskRow[]>([]);
  const [boardProjects, setBoardProjects] = useState<ProjectRow[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);
  const [savingTask, setSavingTask] = useState(false);
  const [activeOrganizationId, setActiveOrganizationId] = useState<string | null>(null);
  const [createdTaskId, setCreatedTaskId] = useState<string | null>(null);
  const [favoriteTaskIds, setFavoriteTaskIds] = useState<Set<string>>(new Set());

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

    try {
      setFavoriteTaskIds(favoriteTaskSet());
      const syncFavorites = () => setFavoriteTaskIds(favoriteTaskSet());
      window.addEventListener('flowtask-memory-updated', syncFavorites as EventListener);
      setHydrated(true);
      return () => window.removeEventListener('flowtask-memory-updated', syncFavorites as EventListener);
    } catch {
      setHydrated(true);
    }
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
          reminders,
        })
      );
    } catch {
      // ignore persist errors
    }
  }, [hydrated, asideOpen, activePanels, expanded, calendarMode, anchorDate, selectedDate, noteDraft, savedNotes, editingNoteId, reminders]);

  useEffect(() => {
    if (!hydrated || !noteDraft.trim()) return;

    const timeout = window.setTimeout(() => {
      const nextNote = {
        id: editingNoteId ?? crypto.randomUUID(),
        text: noteDraft.trim(),
        updatedAt: new Date().toISOString(),
      };

      setSavedNotes((current) => {
        const withoutCurrent = current.filter((item) => item.id !== nextNote.id && item.text.trim() !== nextNote.text.trim());
        return [nextNote, ...withoutCurrent].slice(0, 12);
      });
      setEditingNoteId(null);
    }, 10000);

    return () => window.clearTimeout(timeout);
  }, [hydrated, noteDraft, editingNoteId]);

  useEffect(() => {
    if (!hydrated) return;

    let cancelled = false;
    const supabase = createClient();

    async function loadBoardData() {
      setLoadingData(true);
      setDataError(null);

      const { data: authData, error: authError } = await supabase.auth.getUser();
      const user = authData.user;

      if (authError || !user) {
        if (!cancelled) {
          setDataError('No fue posible validar la sesión actual.');
          setLoadingData(false);
        }
        return;
      }

      if (!cancelled) setActiveOrganizationId(null);

      const taskQuery = supabase
        .from('tasks')
        .select('id,title,description,status,client_name,due_date,project_id,organization_id,owner_id,created_at')
        .eq('owner_id', user.id)
        .order('due_date', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false })
        .limit(120);

      const projectQuery = supabase
        .from('projects')
        .select('id,title,status,client_name,due_date,organization_id,owner_id,created_at')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })
        .limit(12);

      const [{ data: tasks, error: tasksError }, { data: projects, error: projectsError }] = await Promise.all([
        taskQuery,
        projectQuery,
      ]);

      if (!cancelled) {
        if (tasksError || projectsError) {
          setDataError(tasksError?.message ?? projectsError?.message ?? 'No se pudieron cargar tareas y proyectos.');
        }
        setBoardTasks(((tasks as TaskRow[] | null) ?? []).sort((a, b) => (a.due_date ?? '9999-12-31').localeCompare(b.due_date ?? '9999-12-31')));
        setBoardProjects((projects as ProjectRow[] | null) ?? []);
        setLoadingData(false);
      }
    }

    void loadBoardData();
    return () => {
      cancelled = true;
    };
  }, [hydrated]);

  const openTasks = useMemo(() => boardTasks.filter((item) => item.status !== 'concluido'), [boardTasks]);
  const tasksToday = useMemo(() => openTasks.filter((item) => item.due_date === isoDate(new Date())), [openTasks]);
  const nextTasks = useMemo(() => openTasks.slice(0, 4), [openTasks]);
  const activeProjects = useMemo(() => boardProjects.filter((item) => item.status !== 'completado').slice(0, 4), [boardProjects]);

  if (!hydrated) {
    return (
      <div className="space-y-4">
        <Card className="border-slate-200 bg-white px-5 py-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">Modo pizarra</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">Tablero visual premium</h2>
              <p className="mt-1 max-w-2xl text-sm text-slate-500">Cargando la pizarra con tu configuración y paneles…</p>
            </div>
          </div>
        </Card>
        <div className="grid gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
          <Card className="border-slate-200 bg-white p-5 shadow-sm"><div className="h-[420px] rounded-3xl bg-slate-50" /></Card>
          <Card className="border-slate-200 bg-white p-5 shadow-sm"><div className="h-[420px] rounded-3xl bg-slate-50" /></Card>
        </div>
      </div>
    );
  }

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


  function toggleTaskFavorite(task: TaskRow) {
    toggleFavorite(taskEntity(task));
    setFavoriteTaskIds(favoriteTaskSet());
  }

  async function addQuickTask() {
    const title = taskDraft.title.trim();
    const detail = taskDraft.detail.trim();
    if (!title || savingTask) return;

    setSavingTask(true);
    setDataError(null);
    const supabase = createClient();
    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;

    if (!user) {
      setDataError('Sesión no válida para crear la tarea.');
      setSavingTask(false);
      return;
    }

    const payload = {
      title,
      description: detail || null,
      status: 'en_proceso',
      due_date: selectedDate,
      client_name: null,
      owner_id: user.id,
      organization_id: activeOrganizationId,
    };

    const { data, error } = await supabase.from('tasks').insert(payload).select('id,title,description,status,client_name,due_date,project_id,organization_id,owner_id,created_at').single();

    if (error) {
      setDataError(error.message);
      setSavingTask(false);
      return;
    }

    const created = data as TaskRow;
    setBoardTasks((current) => [created, ...current].sort((a, b) => (a.due_date ?? '9999-12-31').localeCompare(b.due_date ?? '9999-12-31')));
    setTaskDraft({ title: '', detail: '' });
    setCreatedTaskId(created.id);
    setSelectedDate(created.due_date ?? isoDate(new Date()));
    setSavingTask(false);
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

  function openTask(taskId: string) {
    router.push(taskDetailRoute(taskId));
  }

  return (
    <div className="space-y-4">
      <Card className="border-slate-200 bg-white px-5 py-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">Modo pizarra</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">Tablero visual premium</h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-500">Calendario, tareas rápidas y proyectos activos leyendo desde la base real del workspace.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">{activeCount} paneles activos</span>
              <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">Supabase conectado</span>
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

              </div>
              {(['task', 'projects', 'calendar', 'kanban'] as PanelKey[]).map((key) => {
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
            {dataError ? <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{dataError}</div> : null}
            {activePanels.includes('kanban') ? (
              <div className="mb-4 rounded-[28px] border border-emerald-200 bg-gradient-to-br from-white via-emerald-50/40 to-white p-4 md:p-5 shadow-[0_16px_36px_rgba(16,185,129,0.08)]">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-emerald-100 bg-white/80 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"><CheckCircle2 className="h-5 w-5" /></span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Flujo</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => toggleExpanded('kanban')} className="inline-flex h-11 items-center gap-2 rounded-full bg-emerald-500 px-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-emerald-400">
                      <Plus className={cn('h-4 w-4 transition-transform', expanded.kanban ? 'rotate-45' : '')} />
                      {expanded.kanban ? 'Ocultar flujo' : 'Desplegar flujo'}
                    </button>
                    <button type="button" onClick={() => removePanel('kanban')} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:-translate-y-0.5 hover:bg-slate-50"><X className="h-4 w-4" /></button>
                  </div>
                </div>
                {expanded.kanban ? (
                  <TaskKanbanBoard
                    tasks={boardTasks.map((task) => ({
                      id: task.id,
                      title: task.title,
                      status: task.status ?? 'en_espera',
                      client_name: task.client_name,
                      due_date: task.due_date,
                    }))}
                    showHeader={false}
                  />
                ) : (
                  <div className="rounded-[24px] border border-dashed border-emerald-200 bg-white/70 px-4 py-8 text-sm text-slate-500">
                    Usa <span className="font-semibold text-slate-700">Desplegar flujo</span> para volver a abrir las columnas.
                  </div>
                )}
              </div>
            ) : null}

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
                  <p className="mt-3 text-sm leading-6 text-slate-500">Crea una tarea real en la BD y luego ábrela para completar el resto del CRUD.</p>
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
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-xs text-slate-500">Se agenda para <span className="font-semibold text-slate-700 capitalize">{formatLongDate(new Date(selectedDate))}</span>.</p>
                        <div className="flex gap-2">
                          <Button className="h-10" onClick={addQuickTask} disabled={savingTask || !taskDraft.title.trim()}>{savingTask ? 'Creando…' : 'Crear tarea'}</Button>
                          <Link href="/app/tasks/new" className="inline-flex h-10 items-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Ir a tareas</Link>
                        </div>
                      </div>
                      {createdTaskId ? (
                        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm text-emerald-900">
                          <p className="font-semibold">La tarea se creó correctamente.</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <button type="button" onClick={() => openTask(createdTaskId)} className="inline-flex items-center rounded-lg bg-white px-3 py-2 text-xs font-semibold text-emerald-700 shadow-sm">Abrir detalle</button>
                            <Link href={taskEditRoute(createdTaskId)} className="inline-flex items-center rounded-lg border border-emerald-200 bg-emerald-100/60 px-3 py-2 text-xs font-semibold text-emerald-700">Completar en tareas</Link>
                          </div>
                        </div>
                      ) : null}
                      <div className="grid gap-2">
                        {(nextTasks.length ? nextTasks : openTasks.slice(0, 4)).map((task) => {
                          const favorite = favoriteTaskIds.has(task.id);
                          return (
                            <div key={task.id} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-left transition hover:-translate-y-0.5 hover:bg-white hover:shadow-sm">
                            <div className="flex items-start justify-between gap-3">
                              <button type="button" onClick={() => openTask(task.id)} className="min-w-0 flex-1 text-left">
                                <p className="text-sm font-semibold text-slate-900">{task.title}</p>
                                <p className="mt-1 text-xs text-slate-500">{task.client_name?.trim() || 'Sin cliente'} · {task.due_date || 'Sin fecha'} · {formatStatus(task.status)}</p>
                              </button>
                              <button
                                type="button"
                                onClick={() => toggleTaskFavorite(task)}
                                title={favorite ? 'Quitar de agenda del día' : 'Mostrar en agenda del día'}
                                aria-label={favorite ? 'Quitar de agenda del día' : 'Mostrar en agenda del día'}
                                className={cn('inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition', favorite ? 'border-amber-200 bg-amber-50 text-amber-600' : 'border-slate-200 bg-white text-slate-500 hover:text-amber-600')}
                              >
                                <Star className={cn('h-4 w-4', favorite && 'fill-current')} />
                              </button>
                            </div>
                            </div>
                          );
                        })}
                        {!loadingData && !openTasks.length ? <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-500">No hay tareas cargadas todavía.</div> : null}
                      </div>
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
                      <Link href="/app/projects/new" className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white transition hover:-translate-y-0.5 hover:bg-emerald-400"><Plus className="h-4 w-4" /></Link>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-500">Ten a mano los frentes que quieres mover primero.</p>
                  {expanded.projects ? (
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {activeProjects.map((project) => (
                        <Link key={project.id} href={projectDetailRoute(project.id)} className="rounded-lg border border-slate-200 bg-white px-4 py-3 transition hover:-translate-y-0.5 hover:shadow-sm">
                          <p className="text-sm font-semibold text-slate-900">{project.title}</p>
                          <p className="mt-1 text-xs text-slate-500">{project.client_name?.trim() || 'Sin cliente'} · {formatStatus(project.status)}</p>
                          <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.14em] text-emerald-700">{project.due_date || 'Sin fecha'}</p>
                        </Link>
                      ))}
                      {!loadingData && !activeProjects.length ? (
                        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500 sm:col-span-2">
                          Aún no hay proyectos activos para mostrar. <Link href="/app/projects" className="font-semibold text-emerald-700">Ir a proyectos</Link>
                        </div>
                      ) : null}
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
                <CalendarPanel mode={calendarMode} anchorDate={anchorDate} onModeChange={setCalendarMode} onStep={stepCalendar} selectedDate={selectedDate} onSelectDate={setSelectedDate} tasks={boardTasks.filter((item) => Boolean(item.due_date))} favoriteTaskIds={favoriteTaskIds} onOpenTask={openTask} />
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
                      <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{item.text}</p>
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
              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Agenda de hoy</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{tasksToday.length}</p>
                <p className="text-sm text-slate-500">tareas abiertas con fecha para hoy</p>
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
