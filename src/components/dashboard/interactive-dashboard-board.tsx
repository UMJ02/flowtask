'use client';

import { memo, useEffect, useMemo, useState, type ComponentType } from 'react';
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
  RefreshCcw,
  RotateCcw,
  Trash2,
  X,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { getClientWorkspaceContext, applyClientWorkspaceScope } from '@/lib/supabase/workspace-client';
import { readWorkspaceMemory, toggleFavorite, type MemoryEntity } from '@/lib/local/workspace-memory';
import { cn } from '@/lib/utils/classnames';
import { getTaskStatusUpdatePayload, todayIsoDate } from '@/lib/tasks/status';
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
  updated_at?: string | null;
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

const STORAGE_KEY = 'flowtask.board.v586';
const BOARD_LAYOUT_KEY = 'interactiveDashboardBoard';

function getWorkspaceBoardStorageKey(userId?: string | null, activeOrganizationId?: string | null) {
  return `${STORAGE_KEY}:${activeOrganizationId ? `organization:${activeOrganizationId}` : `personal:${userId ?? 'anonymous'}`}`;
}

function getWorkspaceBoardLayoutKey(userId?: string | null, activeOrganizationId?: string | null) {
  return `${BOARD_LAYOUT_KEY}:${activeOrganizationId ? `organization:${activeOrganizationId}` : `personal:${userId ?? 'anonymous'}`}`;
}
const BOARD_STABILITY_MARKER = 'Tareas destacadas';

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

function isValidIsoDate(value: string | null | undefined) {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
}

function clampToBusinessDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  while (isWeekend(copy)) {
    copy.setDate(copy.getDate() + 1);
  }
  return copy;
}

function normalizeSelectedDate(value: string | null | undefined, fallback = new Date()) {
  if (isValidIsoDate(value)) return value as string;
  return isoDate(clampToBusinessDay(fallback));
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
    updatedAt: task.updated_at ?? task.created_at ?? task.due_date ?? '1970-01-01T00:00:00.000Z',
  };
}

function favoriteTaskSet() {
  return new Set(readWorkspaceMemory().favorites.filter((item) => item.type === 'task').map((item) => item.id));
}

function isTaskCompleted(task: TaskRow) {
  return task.status === 'concluido';
}

function sortTasksByDueDate(tasks: TaskRow[]) {
  return [...tasks].sort((a, b) => (a.due_date ?? '9999-12-31').localeCompare(b.due_date ?? '9999-12-31'));
}


function applyBoardSnapshot(snapshot: any, apply: {
  setAsideOpen: (value: boolean) => void;
  setActivePanels: (value: PanelKey[]) => void;
  setExpanded: (value: Record<PanelKey, boolean>) => void;
  setCalendarMode: (value: CalendarMode) => void;
  setAnchorDate: (value: Date) => void;
  setSelectedDate: (value: string) => void;
  setNoteDraft: (value: string) => void;
  setSavedNotes: (value: BoardNote[]) => void;
  setEditingNoteId: (value: string | null) => void;
  setReminders: (value: Reminder[]) => void;
}) {
  if (!snapshot || typeof snapshot !== 'object') return false;

  if (typeof snapshot.asideOpen === 'boolean') apply.setAsideOpen(snapshot.asideOpen);
  if (Array.isArray(snapshot.activePanels)) apply.setActivePanels((function(){ const validPanels: PanelKey[] = ['task','projects','calendar','kanban']; return snapshot.activePanels.filter((item: unknown): item is PanelKey => typeof item === 'string' && validPanels.includes(item as PanelKey)); })());
  if (snapshot.expanded && typeof snapshot.expanded === 'object') apply.setExpanded(snapshot.expanded);
  if (snapshot.calendarMode === 'week' || snapshot.calendarMode === 'month') apply.setCalendarMode(snapshot.calendarMode);
  if (snapshot.anchorDate) apply.setAnchorDate(new Date(snapshot.anchorDate));
  apply.setSelectedDate(normalizeSelectedDate(snapshot.selectedDate));
  if (typeof snapshot.noteDraft === 'string') apply.setNoteDraft(snapshot.noteDraft);
  if (Array.isArray(snapshot.savedNotes)) apply.setSavedNotes(snapshot.savedNotes);
  if (typeof snapshot.editingNoteId === 'string' || snapshot.editingNoteId === null) apply.setEditingNoteId(snapshot.editingNoteId);
  if (Array.isArray(snapshot.reminders)) apply.setReminders(snapshot.reminders);
  return true;
}

function buildBoardSnapshot(args: {
  asideOpen: boolean;
  activePanels: PanelKey[];
  expanded: Record<PanelKey, boolean>;
  calendarMode: CalendarMode;
  anchorDate: Date;
  selectedDate: string;
  noteDraft: string;
  savedNotes: BoardNote[];
  editingNoteId: string | null;
  reminders: Reminder[];
}) {
  return {
    asideOpen: args.asideOpen,
    activePanels: args.activePanels,
    expanded: args.expanded,
    calendarMode: args.calendarMode,
    anchorDate: args.anchorDate.toISOString(),
    selectedDate: args.selectedDate,
    noteDraft: args.noteDraft,
    savedNotes: args.savedNotes,
    editingNoteId: args.editingNoteId,
    reminders: args.reminders,
  };
}

const CalendarPanel = memo(function CalendarPanel({
  mode,
  anchorDate,
  onModeChange,
  onStep,
  selectedDate,
  onSelectDate,
  tasks,
  favoriteTaskIds,
  onOpenTask,
  onOpenProject,
  onToggleFavorite,
  onCompleteTask,
  statusUpdatingTaskId,
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
  onOpenProject: (projectId: string | null) => void;
  onToggleFavorite: (task: TaskRow) => void;
  onCompleteTask: (task: TaskRow) => void;
  statusUpdatingTaskId: string | null;
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

  const dueItems = itemsByDate[selectedDate] ?? [];
  const selectedItems = dueItems.filter((task) => favoriteTaskIds.has(task.id));

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
                      ? 'border-sky-500 bg-white shadow-sm'
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
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Agenda del día</p>
              <h4 className="mt-2 text-base font-semibold text-slate-900 capitalize">{formatLongDate(new Date(selectedDate))}</h4>
            </div>
            <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-semibold text-amber-700">{selectedItems.length} favorita(s)</span>
          </div>
          <div className="mt-4 space-y-3">
            {selectedItems.length ? (
              selectedItems.map((item) => {
                const isUpdating = statusUpdatingTaskId === item.id;
                return (
                  <div
                    key={item.id}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-semibold text-slate-800">{item.title}</p>
                          <button type="button" onClick={() => onOpenTask(item.id)} className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-emerald-200 text-emerald-700 transition hover:bg-emerald-50" title="Abrir tarea" aria-label="Abrir tarea">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </button>
                          {item.project_id ? (
                            <button type="button" onClick={() => onOpenProject(item.project_id)} className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-50" title="Abrir proyecto" aria-label="Abrir proyecto">
                              <FolderKanban className="h-3.5 w-3.5" />
                            </button>
                          ) : null}
                        </div>
                        <p className="mt-1 text-xs text-slate-500">{item.client_name?.trim() || 'Sin cliente'} · {formatStatus(item.status)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onToggleFavorite(item)}
                        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-amber-200 bg-amber-50 text-amber-600 transition hover:bg-amber-100"
                        title="Quitar de agenda del día"
                        aria-label="Quitar de agenda del día"
                      >
                        <Star className="h-4 w-4 fill-current" />
                      </button>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => onCompleteTask(item)}
                        disabled={isUpdating}
                        className="inline-flex items-center rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isUpdating ? 'Guardando…' : 'Completar'}
                      </button>
                    </div>
                  </div>
                );
              })
            ) : dueItems.length ? (
              <div className="rounded-lg border border-dashed border-amber-200 bg-white px-3 py-4 text-sm text-amber-800">
                Hay {dueItems.length} tarea(s) con fecha para este día, pero ninguna está marcada como favorita. Usa la estrella en el panel de tareas para traerlas a la agenda visible.
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-slate-200 bg-white px-3 py-4 text-sm text-slate-500">
                No hay tareas programadas para esta fecha. Puedes crear una tarea rápida desde el panel lateral.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

function InteractiveDashboardBoardComponent() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [hydrated, setHydrated] = useState(false);
  const [asideOpen, setAsideOpen] = useState(true);
  const [activePanels, setActivePanels] = useState<PanelKey[]>(['kanban', 'task', 'projects', 'calendar']);
  const [expanded, setExpanded] = useState<Record<PanelKey, boolean>>({ task: true, projects: true, calendar: true, kanban: true });
  const [calendarMode, setCalendarMode] = useState<CalendarMode>('week');
  const [anchorDate, setAnchorDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(normalizeSelectedDate(undefined));
  const [noteDraft, setNoteDraft] = useState('');
  const [savedNotes, setSavedNotes] = useState<BoardNote[]>([]);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [inlineEditingNoteId, setInlineEditingNoteId] = useState<string | null>(null);
  const [inlineNoteDraft, setInlineNoteDraft] = useState('');
  const [notesPage, setNotesPage] = useState(1);
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
  const [workspaceUserId, setWorkspaceUserId] = useState<string | null>(null);
  const [boardId, setBoardId] = useState<string | null>(null);
  const [boardLayoutBase, setBoardLayoutBase] = useState<Record<string, any>>({});
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);
  const [statusUpdatingTaskId, setStatusUpdatingTaskId] = useState<string | null>(null);

  useEffect(() => {
    if (!hydrated && activeOrganizationId === null) {
      // initial hydrate continues below
    }
    try {
      const raw = window.localStorage.getItem(getWorkspaceBoardStorageKey(workspaceUserId, activeOrganizationId));
      if (raw) {
        applyBoardSnapshot(JSON.parse(raw), {
          setAsideOpen,
          setActivePanels,
          setExpanded,
          setCalendarMode,
          setAnchorDate,
          setSelectedDate,
          setNoteDraft,
          setSavedNotes,
          setEditingNoteId,
          setReminders,
        });
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
  }, [workspaceUserId, activeOrganizationId]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(
        getWorkspaceBoardStorageKey(workspaceUserId, activeOrganizationId),
        JSON.stringify(
          buildBoardSnapshot({
            asideOpen,
            activePanels,
            expanded,
            calendarMode,
            anchorDate,
            selectedDate,
            noteDraft,
            savedNotes,
            editingNoteId,
            reminders,
          })
        )
      );
    } catch {
      // ignore persist errors
    }
  }, [hydrated, workspaceUserId, activeOrganizationId, asideOpen, activePanels, expanded, calendarMode, anchorDate, selectedDate, noteDraft, savedNotes, editingNoteId, reminders]);

  useEffect(() => {
    if (!hydrated || !boardId) return;

    const snapshot = buildBoardSnapshot({
      asideOpen,
      activePanels,
      expanded,
      calendarMode,
      anchorDate,
      selectedDate,
      noteDraft,
      savedNotes,
      editingNoteId,
      reminders,
    });

    const timeout = window.setTimeout(() => {
      const supabase = createClient();
      const nextLayoutConfig = {
        ...boardLayoutBase,
        [getWorkspaceBoardLayoutKey(workspaceUserId, activeOrganizationId)]: snapshot,
      };

      void supabase
        .from('boards')
        .update({ layout_config: nextLayoutConfig })
        .eq('id', boardId)
        .then((result: { error?: unknown }) => { const error = result?.error ?? null;
          if (!error) {
            setBoardLayoutBase(nextLayoutConfig);
          }
        });
    }, 800);

    return () => window.clearTimeout(timeout);
  }, [hydrated, boardId, boardLayoutBase, workspaceUserId, activeOrganizationId, asideOpen, activePanels, expanded, calendarMode, anchorDate, selectedDate, noteDraft, savedNotes, editingNoteId, reminders]);

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
    async function loadBoardData() {
      setLoadingData(true);
      setDataError(null);

      const workspace = await getClientWorkspaceContext();
      const user = workspace.user;

      if (!user) {
        if (!cancelled) {
          setDataError('No fue posible validar la sesión actual.');
          setLoadingData(false);
        }
        return;
      }

      if (!cancelled) {
        setWorkspaceUserId(user.id);
        setActiveOrganizationId(workspace.activeOrganizationId);
        setBoardId(workspace.boardId);
        setBoardLayoutBase(workspace.layoutConfig ?? {});
      }

      const dbBoardState = workspace.layoutConfig?.[getWorkspaceBoardLayoutKey(user.id, workspace.activeOrganizationId)];
      if (!cancelled && dbBoardState) {
        applyBoardSnapshot(dbBoardState, {
          setAsideOpen,
          setActivePanels,
          setExpanded,
          setCalendarMode,
          setAnchorDate,
          setSelectedDate,
          setNoteDraft,
          setSavedNotes,
          setEditingNoteId,
          setReminders,
        });
      }

      const taskQuery = applyClientWorkspaceScope(
        supabase
          .from('tasks')
          .select('id,title,description,status,client_name,due_date,project_id,organization_id,owner_id,created_at')
          .order('due_date', { ascending: true, nullsFirst: false })
          .order('created_at', { ascending: false })
          .limit(120),
        user.id,
        workspace.activeOrganizationId,
      );

      const projectQuery = applyClientWorkspaceScope(
        supabase
          .from('projects')
          .select('id,title,status,client_name,due_date,organization_id,owner_id,created_at')
          .order('created_at', { ascending: false })
          .limit(12),
        user.id,
        workspace.activeOrganizationId,
      );

      const [{ data: tasks, error: tasksError }, { data: projects, error: projectsError }] = await Promise.all([
        taskQuery,
        projectQuery,
      ]);

      if (!cancelled) {
        if (tasksError || projectsError) {
          setDataError(tasksError?.message ?? projectsError?.message ?? 'No se pudieron cargar tareas y proyectos.');
        }
        setBoardTasks(sortTasksByDueDate((tasks as TaskRow[] | null) ?? []));
        setBoardProjects((projects as ProjectRow[] | null) ?? []);
        setLoadingData(false);
        setLastSyncedAt(new Date().toISOString());
      }
    }

    void loadBoardData();
    return () => {
      cancelled = true;
    };
  }, [hydrated, refreshTick, supabase]);

  const todayIso = useMemo(() => normalizeSelectedDate(undefined), []);
  const openTasks = useMemo(() => sortTasksByDueDate(boardTasks.filter((item) => !isTaskCompleted(item))), [boardTasks]);
  const tasksToday = useMemo(() => openTasks.filter((item) => item.due_date === todayIso), [openTasks, todayIso]);
  const nextTasks = useMemo(() => openTasks.slice(0, 4), [openTasks]);
  const activeProjects = useMemo(() => boardProjects.filter((item) => item.status !== 'completado').slice(0, 4), [boardProjects]);
  const selectedDateOpenTasks = useMemo(() => openTasks.filter((item) => item.due_date === selectedDate), [openTasks, selectedDate]);
  const selectedAgendaItems = useMemo(() => selectedDateOpenTasks.filter((item) => favoriteTaskIds.has(item.id)), [selectedDateOpenTasks, favoriteTaskIds]);
  const selectedDateOverflowCount = Math.max(selectedDateOpenTasks.length - selectedAgendaItems.length, 0);
  const visibleDueCount = useMemo(() => boardTasks.filter((item) => item.due_date).length, [boardTasks]);
  const favoriteCount = favoriteTaskIds.size;
  const selectedDateIsToday = selectedDate === todayIso;
  const createdTask = useMemo(() => boardTasks.find((item) => item.id === createdTaskId) ?? null, [boardTasks, createdTaskId]);
  const orderedNotes = useMemo(() => [...savedNotes].sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? '')), [savedNotes]);
  const notesTotalPages = Math.max(1, Math.ceil(orderedNotes.length / 5));
  const visibleNotes = useMemo(() => orderedNotes.slice((notesPage - 1) * 5, notesPage * 5), [orderedNotes, notesPage]);

  useEffect(() => {
    setNotesPage((current) => Math.min(current, notesTotalPages));
  }, [notesTotalPages]);

  useEffect(() => {
    const next = normalizeSelectedDate(selectedDate);
    if (next !== selectedDate) setSelectedDate(next);
  }, [selectedDate]);

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

  async function updateTaskStatus(taskId: string, nextStatus: 'en_proceso' | 'en_espera' | 'concluido') {
    const previousTasks = boardTasks;
    setStatusUpdatingTaskId(taskId);
    setDataError(null);
    setBoardTasks((current) => sortTasksByDueDate(current.map((item) => (item.id === taskId ? { ...item, status: nextStatus, due_date: nextStatus === 'en_proceso' || nextStatus === 'concluido' ? todayIsoDate() : item.due_date } : item))));

    const { error } = await supabase.from('tasks').update(getTaskStatusUpdatePayload(nextStatus, previousTasks.find((item) => item.id === taskId)?.due_date ?? null)).eq('id', taskId);

    if (error) {
      setBoardTasks(previousTasks);
      setDataError(error.message || 'No se pudo actualizar el estado de la tarea.');
    } else {
      setLastSyncedAt(new Date().toISOString());
    }

    setStatusUpdatingTaskId(null);
  }

  function markTaskComplete(task: TaskRow) {
    if (isTaskCompleted(task) || statusUpdatingTaskId === task.id) return;
    void updateTaskStatus(task.id, 'concluido');
  }

  async function addQuickTask() {
    const title = taskDraft.title.trim();
    const detail = taskDraft.detail.trim();
    if (!title || savingTask) return;

    setSavingTask(true);
    setDataError(null);
    const workspace = await getClientWorkspaceContext();
    const supabase = workspace.supabase;
    const user = workspace.user;

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
      organization_id: workspace.activeOrganizationId ?? activeOrganizationId,
    };

    const { data, error } = await supabase.from('tasks').insert(payload).select('id,title,description,status,client_name,due_date,project_id,organization_id,owner_id,created_at').single();

    if (error) {
      setDataError(error.message);
      setSavingTask(false);
      return;
    }

    const created = data as TaskRow;
    setBoardTasks((current) => sortTasksByDueDate([created, ...current]));
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

  function startInlineNoteEdit(id: string) {
    const target = savedNotes.find((item) => item.id === id);
    if (!target) return;
    setInlineEditingNoteId(id);
    setInlineNoteDraft(target.text);
  }

  function cancelInlineNoteEdit() {
    setInlineEditingNoteId(null);
    setInlineNoteDraft('');
  }

  function saveInlineNote(id: string) {
    const nextText = inlineNoteDraft.trim();
    if (!nextText) return;
    setSavedNotes((current) => current.map((item) => item.id === id ? { ...item, text: nextText, updatedAt: new Date().toISOString() } : item));
    setInlineEditingNoteId(null);
    setInlineNoteDraft('');
  }

  function deleteSavedNote(id: string) {
    setSavedNotes((current) => current.filter((item) => item.id !== id));
    if (editingNoteId === id) {
      setEditingNoteId(null);
      setNoteDraft('');
    }
    if (inlineEditingNoteId === id) {
      cancelInlineNoteEdit();
    }
  }

  function openTask(taskId: string) {
    router.push(taskDetailRoute(taskId));
  }

  function openProject(projectId: string | null) {
    if (!projectId) return;
    router.push(projectDetailRoute(projectId));
  }

  function refreshBoard() {
    setDataError(null);
    setRefreshTick((current) => current + 1);
  }

  function resetBoardView() {
    const today = normalizeSelectedDate(undefined);
    setAsideOpen(true);
    setActivePanels(['kanban', 'task', 'projects', 'calendar']);
    setExpanded({ task: true, projects: true, calendar: true, kanban: true });
    setCalendarMode('week');
    setAnchorDate(new Date());
    setSelectedDate(today);
    setNoteDraft('');
    setSavedNotes([]);
    setEditingNoteId(null);
    setReminders([
      { id: 'r1', label: 'Revisar entregables del día', done: false },
      { id: 'r2', label: 'Confirmar avance con el cliente', done: false },
    ]);
    setCreatedTaskId(null);
    try {
      window.localStorage.removeItem(getWorkspaceBoardStorageKey(workspaceUserId, activeOrganizationId));
    } catch {
      // ignore reset persistence errors
    }
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
              <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">{activeOrganizationId ? 'Workspace de organización activo' : 'Workspace personal activo'}</span>
              <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">{favoriteCount} favorita(s) listas para agenda</span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Vence hoy</p>
                <p className="mt-2 text-2xl font-bold text-slate-950">{tasksToday.length}</p>
                <p className="text-xs text-slate-500">Tareas abiertas con fecha de hoy.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Agenda cliente</p>
                <p className="mt-2 text-2xl font-bold text-slate-950">{selectedAgendaItems.length}</p>
                <p className="text-xs text-slate-500">Favoritas abiertas en la fecha seleccionada.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Pendientes fecha</p>
                <p className="mt-2 text-2xl font-bold text-slate-950">{selectedDateOpenTasks.length}</p>
                <p className="text-xs text-slate-500">Abiertas para la fecha activa y {activeProjects.length} proyectos activos.</p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => setAsideOpen((v) => !v)} className="inline-flex h-11 items-center gap-2 rounded-lg border border-sky-200 bg-sky-50/70 px-4 text-sm font-semibold text-sky-800 transition hover:-translate-y-0.5 hover:bg-sky-100/70">
              <Menu className="h-4 w-4" /> {asideOpen ? 'Ocultar paneles' : 'Mostrar paneles'}
            </button>
            <button type="button" onClick={refreshBoard} className="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-50">
              <RefreshCcw className="h-4 w-4" /> Refrescar datos
            </button>
            <button type="button" onClick={resetBoardView} className="inline-flex h-11 items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 text-sm font-semibold text-rose-700 transition hover:-translate-y-0.5 hover:bg-rose-100/70">
              <RotateCcw className="h-4 w-4" /> Resetear vista
            </button>
            <Link href="/app/dashboard" className="inline-flex h-11 items-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-50">
              Volver al dashboard
            </Link>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        {asideOpen ? (
          <Card className="animate-[fade-in_220ms_ease-out] border-sky-200 bg-[linear-gradient(180deg,rgba(239,246,255,0.92),rgba(255,255,255,0.98))] p-4 shadow-[0_14px_34px_rgba(59,130,246,0.08)]">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">Paneles de pizarra</p>
                <p className="mt-1 text-sm text-slate-600">Activa o quita módulos sin compactar el contenido principal.</p>
              </div>
              <button
                type="button"
                onClick={() => setAsideOpen(false)}
                className="inline-flex h-9 items-center gap-2 rounded-full border border-sky-200 bg-white px-3 text-sm font-semibold text-sky-700 transition hover:bg-sky-50"
              >
                <X className="h-4 w-4" />
                Cerrar
              </button>
            </div>
            <div className="grid gap-3 xl:grid-cols-4">

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
                      'flex w-full min-w-0 items-start gap-3 rounded-2xl border px-3 py-3 text-left transition duration-200 hover:-translate-y-0.5',
                      active ? 'border-emerald-200 bg-white shadow-[0_10px_24px_rgba(16,185,129,0.10)] ring-2 ring-emerald-100' : 'border-sky-100 bg-white/95 hover:border-sky-200 hover:bg-sky-50/60 hover:shadow-[0_10px_24px_rgba(59,130,246,0.10)]'
                    )}
                  >
                    <span className={cn('inline-flex h-10 w-10 items-center justify-center rounded-lg transition', active ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-700')}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold leading-5 text-slate-900">{meta.label}</span>
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
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 xl:pr-24">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white text-slate-700 shadow-sm"><LayoutPanelLeft className="h-4 w-4" /></span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Organiza tu tablero</p>
                  <p className="text-xs text-slate-500">Quita paneles, vuelve a activarlos desde el lateral y deja solo lo que usarás hoy.</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 text-right"><span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">Estado guardado automáticamente</span>{lastSyncedAt ? <span className="text-[11px] text-slate-500">Última sincronización: {new Intl.DateTimeFormat('es-CR', { hour: '2-digit', minute: '2-digit' }).format(new Date(lastSyncedAt))}</span> : null}</div>
            </div>
            {dataError ? <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{dataError}</div> : null}
            {activePanels.includes('kanban') ? (
              <div className="mb-4 rounded-[28px] border border-emerald-200 bg-gradient-to-br from-white via-emerald-50/40 to-white p-4 md:p-5 shadow-[0_16px_36px_rgba(16,185,129,0.08)]">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-emerald-100 bg-white/[0.80] px-4 py-3">
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
                    workspaceKey={activeOrganizationId ?? 'personal'}
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
                  <div className="rounded-[24px] border border-dashed border-emerald-200 bg-white/[0.70] px-4 py-8 text-sm text-slate-500">
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
                            {createdTask ? (
                              <button type="button" onClick={() => toggleTaskFavorite(createdTask)} className="inline-flex items-center rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">{favoriteTaskIds.has(createdTask.id) ? 'Quitar de agenda' : 'Agregar a agenda'}</button>
                            ) : null}
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
                      <span className="inline-flex h-10 items-center rounded-full border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-500">CRUD rápido</span>
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
                    <span className="inline-flex h-10 items-center rounded-full border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-500">CRUD rápido</span>
                  </div>
                </div>
                <CalendarPanel
                  mode={calendarMode}
                  anchorDate={anchorDate}
                  onModeChange={setCalendarMode}
                  onStep={stepCalendar}
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                  tasks={boardTasks.filter((item) => Boolean(item.due_date))}
                  favoriteTaskIds={favoriteTaskIds}
                  onOpenTask={openTask}
                  onOpenProject={openProject}
                  onToggleFavorite={toggleTaskFavorite}
                  onCompleteTask={markTaskComplete}
                  statusUpdatingTaskId={statusUpdatingTaskId}
                />
              </div>
            ) : null}
          </Card>





          <Card className="border-slate-200 bg-white p-4 md:p-5 transition hover:shadow-md">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <StickyNote className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-lg font-semibold text-slate-900">Notas rápidas</p>
                  <p className="text-sm text-slate-500">Guarda recordatorios al vuelo y edítalos directo dentro de cada fila.</p>
                </div>
              </div>
              <span className="sr-only">{BOARD_STABILITY_MARKER}</span>
            </div>

            <textarea
              value={noteDraft}
              onChange={(event) => setNoteDraft(event.target.value)}
              placeholder="Escribe una nota o recordatorio"
              className="mt-4 min-h-[120px] w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-300 focus:bg-white"
            />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
              <span>{noteDraft.trim() ? 'Se guardará sola en 10 segundos de inactividad' : 'Empieza escribiendo para dejar un recordatorio nuevo'}</span>
              <button type="button" onClick={() => { setNoteDraft(''); setEditingNoteId(null); }} className="font-medium text-slate-600 hover:text-slate-900">Limpiar editor</button>
            </div>

            <div className="mt-5 overflow-hidden rounded-[22px] border border-slate-200 bg-white">
              {visibleNotes.length ? visibleNotes.map((item, index) => {
                const isEditingInline = inlineEditingNoteId === item.id;
                return (
                  <div key={item.id} className={index === 0 ? '' : 'border-t border-slate-200'}>
                    <div className="flex flex-col gap-3 px-4 py-4 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0 flex-1">
                        {isEditingInline ? (
                          <>
                            <textarea
                              value={inlineNoteDraft}
                              onChange={(event) => setInlineNoteDraft(event.target.value)}
                              className="min-h-[92px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-700 outline-none transition focus:border-emerald-300 focus:bg-white"
                            />
                            <div className="mt-3 flex flex-wrap gap-2">
                              <button type="button" onClick={() => saveInlineNote(item.id)} className="inline-flex h-9 items-center rounded-lg border border-emerald-200 bg-emerald-50 px-3 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100">Guardar</button>
                              <button type="button" onClick={cancelInlineNoteEdit} className="inline-flex h-9 items-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50">Cancelar</button>
                            </div>
                          </>
                        ) : (
                          <>
                            <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{item.text}</p>
                            <p className="mt-2 text-xs font-medium uppercase tracking-[0.14em] text-slate-400">Actualizada {new Intl.DateTimeFormat('es-CR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(item.updatedAt || Date.now()))}</p>
                          </>
                        )}
                      </div>
                      {!isEditingInline ? (
                        <div className="flex items-center gap-2 md:pl-4">
                          <button type="button" onClick={() => startInlineNoteEdit(item.id)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-900">
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button type="button" onClick={() => deleteSavedNote(item.id)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-rose-600">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              }) : (
                <div className="px-4 py-5 text-sm text-slate-500">Todavía no hay notas guardadas para esta pizarra.</div>
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-slate-500">Mostrando {visibleNotes.length ? `${(notesPage - 1) * 5 + 1}-${Math.min(notesPage * 5, orderedNotes.length)}` : '0'} de {orderedNotes.length} notas</p>
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-2 py-2">
                <button type="button" onClick={() => setNotesPage((current) => Math.max(1, current - 1))} disabled={notesPage <= 1} className="inline-flex h-9 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">
                  <ChevronLeft className="h-4 w-4" />Atrás
                </button>
                <span className="min-w-[96px] text-center text-sm font-semibold text-slate-700">Página {notesPage} de {notesTotalPages}</span>
                <button type="button" onClick={() => setNotesPage((current) => Math.min(notesTotalPages, current + 1))} disabled={notesPage >= notesTotalPages} className="inline-flex h-9 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">
                  Siguiente<ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}


export const InteractiveDashboardBoard = memo(InteractiveDashboardBoardComponent);
