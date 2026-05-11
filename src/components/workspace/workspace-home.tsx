'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import {
  BellRing,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Search,
  X,
  ClipboardList,
  FolderKanban,
  LayoutGrid,
  Loader2,
  MessageSquareText,
  Plus,
  RefreshCcw,
  SlidersHorizontal,
  Sparkles,
  Star,
  Timer,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { TaskKanbanBoard, type TaskItem } from '@/components/tasks/task-kanban-board';
import { applyClientWorkspaceScope, getClientWorkspaceContext } from '@/lib/supabase/workspace-client';
import { cn } from '@/lib/utils/classnames';
import { projectListRoute, taskNewRoute } from '@/lib/navigation/routes';

const NOTE_STORAGE_KEY = 'flowtask.workspace.quick-notes.v58.13.1';
const WORKSPACE_VISIBLE_COLUMNS_KEY = 'flowtask.workspace.visible-status-columns.v58.22.3';
const WORKSPACE_STATUS_COLUMNS = [
  { value: 'en_proceso', label: 'En progreso' },
  { value: 'produccion', label: 'Producción' },
  { value: 'en_espera', label: 'En espera' },
  { value: 'concluido', label: 'Hecho' },
] as const;
const DEFAULT_WORKSPACE_VISIBLE_COLUMNS = WORKSPACE_STATUS_COLUMNS.map((column) => column.value);
type WorkspaceStatusColumnValue = (typeof WORKSPACE_STATUS_COLUMNS)[number]['value'];

const todayIso = () => new Date().toISOString().slice(0, 10);

type WorkspaceTask = TaskItem & {
  description?: string | null;
  project_id?: string | null;
  organization_id?: string | null;
  owner_id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type WorkspaceProject = {
  id: string;
  title: string;
  status: string | null;
  client_name: string | null;
  due_date: string | null;
};

type QuickNote = {
  id: string;
  text: string;
  updatedAt: string;
};

function readNotes(workspaceKey: string) {
  if (typeof window === 'undefined') return [] as QuickNote[];
  try {
    const raw = window.localStorage.getItem(`${NOTE_STORAGE_KEY}:${workspaceKey}`);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((item): item is QuickNote => Boolean(item?.id && item?.text)) : [];
  } catch {
    return [] as QuickNote[];
  }
}

function writeNotes(workspaceKey: string, notes: QuickNote[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(`${NOTE_STORAGE_KEY}:${workspaceKey}`, JSON.stringify(notes.slice(0, 8)));
  } catch {}
}

function readVisibleWorkspaceColumns(workspaceKey: string) {
  if (typeof window === 'undefined') return DEFAULT_WORKSPACE_VISIBLE_COLUMNS;
  try {
    const raw = window.localStorage.getItem(`${WORKSPACE_VISIBLE_COLUMNS_KEY}:${workspaceKey}`);
    const parsed = raw ? JSON.parse(raw) : null;
    if (!Array.isArray(parsed)) return DEFAULT_WORKSPACE_VISIBLE_COLUMNS;
    const allowed = new Set(DEFAULT_WORKSPACE_VISIBLE_COLUMNS);
    const next = parsed.filter((value): value is WorkspaceStatusColumnValue => typeof value === 'string' && allowed.has(value as WorkspaceStatusColumnValue));
    return next.length ? next : DEFAULT_WORKSPACE_VISIBLE_COLUMNS;
  } catch {
    return DEFAULT_WORKSPACE_VISIBLE_COLUMNS;
  }
}

function writeVisibleWorkspaceColumns(workspaceKey: string, columns: WorkspaceStatusColumnValue[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(`${WORKSPACE_VISIBLE_COLUMNS_KEY}:${workspaceKey}`, JSON.stringify(columns));
  } catch {}
}

function WorkspaceKpiCard({
  label,
  value,
  helper,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  helper: string;
  icon: typeof Timer;
  tone: 'rose' | 'amber' | 'violet' | 'sky';
}) {
  const toneClasses = {
    rose: 'bg-rose-50 text-rose-500 ring-rose-100',
    amber: 'bg-amber-50 text-amber-500 ring-amber-100',
    violet: 'bg-violet-50 text-violet-500 ring-violet-100',
    sky: 'bg-sky-50 text-sky-500 ring-sky-100',
  }[tone];

  return (
    <Card className="rounded-2xl ft-border bg-white p-5 ring-0 md:p-5">
      <div className="flex items-center gap-4">
        <span className={cn('inline-flex h-10 w-14 shrink-0 items-center justify-center rounded-full ring-1', toneClasses)}>
          <Icon className="h-6 w-6" />
        </span>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-slate-500">{label}</p>
          <p className="mt-0.5 text-[28px] font-bold leading-none tracking-[-0.04em] ft-text-main">{value}</p>
          <p className="mt-2 truncate text-xs font-medium text-slate-400">{helper}</p>
        </div>
      </div>
    </Card>
  );
}

function WorkspaceQuickWidget({
  title,
  helper,
  href,
  icon: Icon,
  tone,
}: {
  title: string;
  helper: string;
  href: string;
  icon: typeof ClipboardList;
  tone: 'green' | 'blue' | 'violet' | 'amber';
}) {
  const toneClasses = {
    green: 'border-emerald-200 bg-emerald-50/70 text-emerald-600',
    blue: 'border-sky-200 bg-sky-50/70 text-sky-600',
    violet: 'border-violet-200 bg-violet-50/70 text-violet-600',
    amber: 'border-amber-200 bg-amber-50/70 text-amber-600',
  }[tone];

  return (
    <Link
      href={href as any}
      className={cn(
        'group flex min-h-[112px] items-center justify-between rounded-2xl border px-5 py-5 transition hover:translate-y-0 hover:',
        toneClasses,
      )}
    >
      <div className="flex min-w-0 items-center gap-4">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/80 ring-1 ring-white/80">
          <Icon className="h-6 w-6" />
        </span>
        <div className="min-w-0">
          <p className="text-base font-bold text-slate-950">{title}</p>
          <p className="mt-1 truncate text-xs font-medium text-slate-500">{helper}</p>
        </div>
      </div>
      <span className="inline-flex h-10 w-14 shrink-0 items-center justify-center rounded-full bg-white/70 ring-1 ring-white/80 transition group-hover:bg-[#050B18] group-hover:text-white">
        {tone === 'green' ? <Plus className="h-6 w-6" /> : <Icon className="h-6 w-6" />}
      </span>
    </Link>
  );
}

export function WorkspaceHome() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tasks, setTasks] = useState<WorkspaceTask[]>([]);
  const [projects, setProjects] = useState<WorkspaceProject[]>([]);
  const [workspaceKey, setWorkspaceKey] = useState('personal');
  const [workspaceLabel, setWorkspaceLabel] = useState('workspace personal');
  const [noteDraft, setNoteDraft] = useState('');
  const [notes, setNotes] = useState<QuickNote[]>([]);
  const [refreshTick, setRefreshTick] = useState(0);
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoMessage, setDemoMessage] = useState<string | null>(null);
  const [demoError, setDemoError] = useState<string | null>(null);
  const [flowFiltersOpen, setFlowFiltersOpen] = useState(false);
  const [flowSearch, setFlowSearch] = useState('');
  const [flowStatusFilter, setFlowStatusFilter] = useState<'all' | 'en_proceso' | 'produccion' | 'en_espera' | 'concluido'>('all');
  const [flowPriorityFilter, setFlowPriorityFilter] = useState<'all' | 'alta' | 'media' | 'baja'>('all');
  const [flowGroupBy, setFlowGroupBy] = useState<'status' | 'priority' | 'client'>('status');
  const [columnsMenuOpen, setColumnsMenuOpen] = useState(false);
  const [visibleStatusColumns, setVisibleStatusColumns] = useState<WorkspaceStatusColumnValue[]>(DEFAULT_WORKSPACE_VISIBLE_COLUMNS);
  const deferredFlowSearch = useDeferredValue(flowSearch);

  useEffect(() => {
    router.prefetch('/app/tasks');
    router.prefetch(taskNewRoute());
    router.prefetch(projectListRoute());
  }, [router]);

  useEffect(() => {
    setVisibleStatusColumns(readVisibleWorkspaceColumns(workspaceKey));
  }, [workspaceKey]);

  useEffect(() => {
    writeVisibleWorkspaceColumns(workspaceKey, visibleStatusColumns);
  }, [visibleStatusColumns, workspaceKey]);

  useEffect(() => {
    if (!columnsMenuOpen) return;
    const closeOnPointerDown = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest('[data-workspace-columns-menu]')) return;
      setColumnsMenuOpen(false);
    };
    window.addEventListener('pointerdown', closeOnPointerDown);
    return () => window.removeEventListener('pointerdown', closeOnPointerDown);
  }, [columnsMenuOpen]);

  useEffect(() => {
    let cancelled = false;

    async function loadWorkspace() {
      setLoading(true);
      setError(null);

      const context = await getClientWorkspaceContext();
      if (!context.user) {
        if (!cancelled) {
          setError('No fue posible validar la sesión actual.');
          setLoading(false);
        }
        return;
      }

      const nextWorkspaceKey = context.workspaceKey;
      if (!cancelled) {
        setWorkspaceKey(nextWorkspaceKey);
        setWorkspaceLabel(context.activeOrganizationId ? 'workspace de organización' : 'workspace personal');
        setNotes(readNotes(nextWorkspaceKey));
      }

      const scopedTasks = applyClientWorkspaceScope(
        context.supabase
          .from('tasks')
          .select('id,title,status,priority,client_name,due_date,project_id,organization_id,owner_id,created_at,updated_at,deleted_at')
          .order('due_date', { ascending: true, nullsFirst: false })
          .order('updated_at', { ascending: false })
          .is('deleted_at', null)
          .limit(500),
        context.user.id,
        context.activeOrganizationId,
      );

      const scopedProjects = applyClientWorkspaceScope(
        context.supabase
          .from('projects')
          .select('id,title,status,client_name,due_date')
          .order('updated_at', { ascending: false })
          .limit(20),
        context.user.id,
        context.activeOrganizationId,
      );

      const [{ data: taskRows, error: taskError }, { data: projectRows, error: projectError }] = await Promise.all([
        scopedTasks,
        scopedProjects,
      ]);

      if (!cancelled) {
        if (taskError || projectError) {
          setError(taskError?.message ?? projectError?.message ?? 'No fue posible cargar el workspace.');
        }
        setTasks(((taskRows ?? []) as WorkspaceTask[]).map((task) => ({ ...task, status: task.status ?? 'en_espera' })));
        setProjects((projectRows ?? []) as WorkspaceProject[]);
        setLoading(false);
      }
    }

    void loadWorkspace();
    return () => {
      cancelled = true;
    };
  }, [refreshTick]);

  const today = todayIso();
  const openTasks = useMemo(() => tasks.filter((task) => task.status !== 'concluido'), [tasks]);
  const overdueTasks = useMemo(() => openTasks.filter((task) => task.due_date && task.due_date < today), [openTasks, today]);
  const dueToday = useMemo(() => openTasks.filter((task) => task.due_date === today), [openTasks, today]);
  const waiting = useMemo(() => openTasks.filter((task) => task.status === 'en_espera'), [openTasks]);
  const activeProjects = useMemo(() => projects.filter((project) => project.status !== 'completado'), [projects]);
  const importantCount = useMemo(() => tasks.filter((task) => task.priority === 'alta').length, [tasks]);
  const handleTaskPriorityChange = (taskId: string, priority: string) => {
    setTasks((current) => current.map((task) => (task.id === taskId ? { ...task, priority } : task)));
  };


  const radarTitle = overdueTasks.length
    ? `Hay ${overdueTasks.length} tarea${overdueTasks.length === 1 ? '' : 's'} vencida${overdueTasks.length === 1 ? '' : 's'} empujando el día`
    : dueToday.length
      ? `Hay ${dueToday.length} tarea${dueToday.length === 1 ? '' : 's'} para mover hoy`
      : 'Tu workspace está estable para avanzar con foco';

  const radarCopy = overdueTasks.length
    ? 'Lo vencido está contaminando tu foco.'
    : dueToday.length
      ? 'Ordená prioridades y cerrá los entregables visibles de hoy.'
      : 'Sin urgencias críticas. Aprovechá para planear, documentar y avanzar proyectos activos.';

  const radarScore = Math.max(60, 200 - overdueTasks.length * 25 - waiting.length * 4);

  const filteredFlowTasks = useMemo(() => {
    const query = deferredFlowSearch.trim().toLowerCase();
    const rankedPriority = { alta: 0, media: 1, baja: 2 } as Record<string, number>;
    return tasks
      .filter((task) => {
        const matchesSearch = !query || [task.title, task.client_name, task.description].some((value) => (value ?? '').toLowerCase().includes(query));
        const matchesStatus = flowStatusFilter === 'all' || task.status === flowStatusFilter;
        const matchesPriority = flowPriorityFilter === 'all' || task.priority === flowPriorityFilter;
        return matchesSearch && matchesStatus && matchesPriority;
      })
      .sort((a, b) => {
        if (flowGroupBy === 'priority') {
          const byPriority = (rankedPriority[a.priority ?? 'media'] ?? 1) - (rankedPriority[b.priority ?? 'media'] ?? 1);
          if (byPriority !== 0) return byPriority;
        }
        if (flowGroupBy === 'client') {
          const byClient = (a.client_name ?? 'Sin registro').localeCompare(b.client_name ?? 'Sin registro');
          if (byClient !== 0) return byClient;
        }
        if (!a.due_date && b.due_date) return 1;
        if (a.due_date && !b.due_date) return -1;
        return (a.due_date ?? '').localeCompare(b.due_date ?? '') || a.title.localeCompare(b.title);
      });
  }, [deferredFlowSearch, flowGroupBy, flowPriorityFilter, flowStatusFilter, tasks]);

  const activeFlowFilters = Number(Boolean(flowSearch.trim())) + Number(flowStatusFilter !== 'all') + Number(flowPriorityFilter !== 'all');
  const groupLabel = flowGroupBy === 'priority' ? 'Prioridad' : flowGroupBy === 'client' ? 'Registro' : 'Estado';
  const visibleColumnCountLabel = `${visibleStatusColumns.length}/${WORKSPACE_STATUS_COLUMNS.length}`;
  const visibleColumnCounts = useMemo(() => {
    return WORKSPACE_STATUS_COLUMNS.reduce<Record<WorkspaceStatusColumnValue, number>>((acc, column) => {
      acc[column.value] = filteredFlowTasks.filter((task) => task.status === column.value).length;
      return acc;
    }, {
      en_proceso: 0,
      produccion: 0,
      en_espera: 0,
      concluido: 0,
    });
  }, [filteredFlowTasks]);

  function toggleVisibleColumn(status: WorkspaceStatusColumnValue) {
    setVisibleStatusColumns((current) => {
      if (current.includes(status)) {
        if (current.length <= 1) return current;
        return current.filter((value) => value !== status);
      }
      return DEFAULT_WORKSPACE_VISIBLE_COLUMNS.filter((value) => value === status || current.includes(value));
    });
  }

  function showAllWorkspaceColumns() {
    setVisibleStatusColumns(DEFAULT_WORKSPACE_VISIBLE_COLUMNS);
  }

  function cycleFlowGroup() {
    setFlowGroupBy((current) => current === 'status' ? 'priority' : current === 'priority' ? 'client' : 'status');
  }

  function clearFlowFilters() {
    setFlowSearch('');
    setFlowStatusFilter('all');
    setFlowPriorityFilter('all');
  }

  function saveQuickNote() {
    const text = noteDraft.trim();
    if (!text) return;
    const next = [{ id: crypto.randomUUID(), text, updatedAt: new Date().toISOString() }, ...notes].slice(0, 8);
    setNotes(next);
    writeNotes(workspaceKey, next);
    setNoteDraft('');
  }
  async function loadSafeDemoData() {
    if (demoLoading) return;

    setDemoLoading(true);
    setDemoMessage(null);
    setDemoError(null);

    try {
      const response = await fetch('/api/onboarding/demo-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok || !payload?.ok) {
        throw new Error(payload?.message || 'No fue posible cargar el ejemplo seguro.');
      }

      const created = payload.created;
      const tasksCreated = typeof created?.tasks === 'number' ? created.tasks : 0;
      setDemoMessage(tasksCreated > 0 ? `Listo. Creamos 1 proyecto demo y ${tasksCreated} tareas de ejemplo en este workspace.` : payload.message || 'Datos de ejemplo cargados correctamente.');
      setRefreshTick((value) => value + 1);
      router.refresh();
    } catch (err) {
      setDemoError(err instanceof Error ? err.message : 'No fue posible cargar el ejemplo seguro.');
    } finally {
      setDemoLoading(false);
    }
  }


  return (
    <div className="space-y-5 pb-3">
      <section className="relative overflow-hidden rounded-2xl border border-[#F6C7CD] bg-[linear-gradient(90deg,#FFF7F8_0%,#FFF9FB_100%)] px-5 py-5 md:px-9 md:py-7">
        <button type="button" aria-label="Cerrar radar" className="absolute right-5 top-5 hidden h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-white/75 hover:text-slate-900 md:inline-flex">
          ×
        </button>
        <div className="grid gap-5 lg:grid-cols-[150px_minmax(0,1fr)_auto] lg:items-center">
          <div className="hidden h-[132px] w-[132px] items-end justify-center overflow-hidden rounded-2xl bg-white/35 md:flex">
            <Image src="/assistant/guide-male.png" alt="Radar inteligente" width={132} height={132} className="h-[132px] w-[132px] object-contain object-bottom" priority />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 text-[12px] font-extrabold uppercase tracking-[0.22em] text-slate-600">
                <Sparkles className="h-4 w-4 text-[#16C784]" /> Radar inteligente
              </span>
              <span className={cn('inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em]', overdueTasks.length ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-700')}>
                {overdueTasks.length ? 'Prioridad alta' : 'En control'}
              </span>
            </div>
            <h2 className="mt-4 max-w-4xl text-xl font-semibold tracking-[-0.035em] ft-text-main md:text-[1.7rem]">{radarTitle}</h2>
            <p className="mt-3 max-w-3xl text-[15px] leading-6 text-slate-500">{radarCopy}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 lg:justify-end">
            <span className="inline-flex h-9 items-center rounded-full bg-emerald-50 px-4 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-100">Score {radarScore}</span>
            <Link href="/app/tasks" className="inline-flex h-10 items-center justify-center rounded-xl bg-[#050B18] px-5 text-sm font-bold text-white transition hover:bg-slate-800">
              Revisar ahora <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
            <Link href="#workspace-flow" className="inline-flex h-10 items-center justify-center rounded-xl border ft-border bg-white px-5 text-sm font-bold ft-text-main transition hover:bg-slate-50">Ver tablero</Link>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-[repeat(4,minmax(0,1fr))_220px]">
        <WorkspaceKpiCard label="Vence hoy" value={dueToday.length} helper="Tareas abiertas" icon={CalendarDays} tone="rose" />
        <WorkspaceKpiCard label="Importantes" value={importantCount} helper="Foco, no avance" icon={Star} tone="amber" />
        <WorkspaceKpiCard label="Pendientes" value={openTasks.length} helper="Fecha definida" icon={Timer} tone="violet" />
        <WorkspaceKpiCard label="Proyectos activos" value={activeProjects.length} helper="En curso" icon={FolderKanban} tone="sky" />
        <Card className="flex items-center justify-center gap-3 rounded-2xl ft-border bg-white p-4 ring-0">
          <button type="button" onClick={() => setRefreshTick((value) => value + 1)} className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border ft-border bg-white text-slate-600 transition hover:bg-slate-50" aria-label="Actualizar workspace">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
          </button>
          <Link href="/app/tasks" className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border ft-border bg-white text-slate-600 transition hover:bg-slate-50" aria-label="Tareas">
            <LayoutGrid className="h-4 w-4" />
          </Link>
          <Link href="/app/settings" className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border ft-border bg-white text-slate-600 transition hover:bg-slate-50" aria-label="Ajustes rápidos">
            <SlidersHorizontal className="h-4 w-4" />
          </Link>
        </Card>
      </div>

      <section id="workspace-flow" className="rounded-2xl border ft-border bg-white p-4 md:p-5">
        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-50 text-slate-600 ring-1 ring-[#E5EAF1]">
              <LayoutGrid className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-semibold tracking-[-0.02em] ft-text-main">Mi flujo de trabajo</h2>
              <p className="text-sm text-slate-500">Gestiona tus tareas con enfoque. Arrastra y suelta para organizar.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => setFlowFiltersOpen((value) => !value)} className={cn("inline-flex h-10 items-center gap-2 rounded-xl border px-4 text-sm font-semibold transition", flowFiltersOpen || activeFlowFilters ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "ft-border bg-white text-slate-600 hover:bg-slate-50")} aria-expanded={flowFiltersOpen}>
              <SlidersHorizontal className="h-4 w-4" /> Filtros
              {activeFlowFilters ? <span className="ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#16C784] px-1.5 text-[11px] font-semibold text-white">{activeFlowFilters}</span> : null}
            </button>
            <button type="button" onClick={cycleFlowGroup} className="inline-flex h-10 items-center gap-2 rounded-xl border ft-border bg-white px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50" title="Cambiar agrupamiento">
              Agrupar: {groupLabel} <ChevronDown className="h-4 w-4" />
            </button>
            <div className="relative" data-workspace-columns-menu>
              <button
                type="button"
                onClick={() => setColumnsMenuOpen((value) => !value)}
                className={cn(
                  'inline-flex h-10 items-center gap-2 rounded-xl border px-4 text-sm font-semibold transition',
                  columnsMenuOpen || visibleStatusColumns.length < WORKSPACE_STATUS_COLUMNS.length
                    ? 'border-violet-200 bg-violet-50 text-violet-700'
                    : 'ft-border bg-white text-slate-600 hover:bg-slate-50',
                )}
                aria-expanded={columnsMenuOpen}
                aria-haspopup="menu"
              >
                <LayoutGrid className="h-4 w-4" /> Columnas
                <span className="rounded-full bg-white/80 px-1.5 py-0.5 text-[11px] font-bold text-slate-500 ring-1 ring-slate-200">{visibleColumnCountLabel}</span>
              </button>
              {columnsMenuOpen ? (
                <div className="absolute right-0 z-30 mt-2 w-[260px] rounded-2xl border ft-border bg-white p-3 shadow-[0_18px_48px_rgba(15,23,42,0.14)]" role="menu">
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-slate-900">Mostrar columnas</p>
                      <p className="text-xs text-slate-500">Elige qué estados aparecen en este workspace.</p>
                    </div>
                    <button type="button" onClick={() => setColumnsMenuOpen(false)} className="inline-flex h-7 w-7 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" aria-label="Cerrar selector de columnas">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="space-y-1">
                    {WORKSPACE_STATUS_COLUMNS.map((column) => {
                      const checked = visibleStatusColumns.includes(column.value);
                      const disabled = checked && visibleStatusColumns.length === 1;
                      return (
                        <button
                          key={column.value}
                          type="button"
                          onClick={() => toggleVisibleColumn(column.value)}
                          disabled={disabled}
                          className={cn(
                            'flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm font-semibold transition',
                            checked ? 'bg-slate-50 text-slate-900' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900',
                            disabled && 'cursor-not-allowed opacity-60',
                          )}
                          role="menuitemcheckbox"
                          aria-checked={checked}
                        >
                          <span className="flex min-w-0 items-center gap-2">
                            <span className={cn('inline-flex h-4 w-4 items-center justify-center rounded-md border text-[11px]', checked ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-transparent')}>✓</span>
                            <span className="truncate">{column.label}</span>
                          </span>
                          <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-slate-500 ring-1 ring-slate-200">{visibleColumnCounts[column.value]}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                    <button type="button" onClick={showAllWorkspaceColumns} className="text-xs font-bold text-emerald-700 transition hover:text-emerald-800">Mostrar todas</button>
                    <span className="text-[11px] font-medium text-slate-400">Mínimo 1 visible</span>
                  </div>
                </div>
              ) : null}
            </div>
            <Link href={taskNewRoute()} className="inline-flex h-10 items-center justify-center rounded-xl bg-[#16C784] px-5 text-sm font-bold text-white transition hover:bg-emerald-600"><Plus className="mr-2 h-4 w-4" /> Nueva tarea</Link>
          </div>
        </div>
        {flowFiltersOpen ? (
          <div className="mb-4 grid gap-3 rounded-2xl border ft-border bg-slate-50/70 p-3 shadow-inner md:grid-cols-[minmax(240px,1fr)_170px_170px_auto]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={flowSearch} onChange={(event) => setFlowSearch(event.target.value)} placeholder="Buscar en mi flujo..." className="h-11 w-full rounded-xl border ft-border bg-white pl-9 pr-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-200 focus:ring-4 focus:ring-emerald-50" />
            </label>
            <select value={flowStatusFilter} onChange={(event) => setFlowStatusFilter(event.target.value as typeof flowStatusFilter)} className="h-11 rounded-xl border ft-border bg-white px-3 text-sm font-semibold text-slate-700 outline-none">
              <option value="all">Todos los estados</option>
              <option value="en_proceso">En progreso</option>
              <option value="produccion">Producción</option>
              <option value="en_espera">En espera</option>
              <option value="concluido">Hecho</option>
            </select>
            <select value={flowPriorityFilter} onChange={(event) => setFlowPriorityFilter(event.target.value as typeof flowPriorityFilter)} className="h-11 rounded-xl border ft-border bg-white px-3 text-sm font-semibold text-slate-700 outline-none">
              <option value="all">Todas las prioridades</option>
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>
            <button type="button" onClick={clearFlowFilters} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border ft-border bg-white px-4 text-sm font-bold text-slate-600 transition hover:bg-white">
              <X className="h-4 w-4" /> Limpiar
            </button>
          </div>
        ) : null}
        {error ? <div className="mb-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
        {!loading && !error && tasks.length === 0 && projects.length === 0 ? (
          <div className="mb-5 overflow-hidden rounded-2xl border border-emerald-100 bg-[linear-gradient(135deg,#F0FDF4_0%,#FFFFFF_58%,#F8FAFC_100%)] p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 gap-4">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200">
                  <Sparkles className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Workspace nuevo</p>
                  <h3 className="mt-1 text-xl font-semibold tracking-[-0.03em] ft-text-main">Tu workspace está listo para empezar</h3>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                    Podés cargar un ejemplo seguro para ver proyectos, tareas y checklist sin tocar datos reales. Solo se activa cuando este workspace tiene 0 tareas y 0 proyectos.
                  </p>
                  {demoMessage ? <p className="mt-3 rounded-2xl border border-emerald-100 bg-white/80 px-4 py-2 text-sm font-semibold text-emerald-700">{demoMessage}</p> : null}
                  {demoError ? <p className="mt-3 rounded-2xl border border-rose-100 bg-white/80 px-4 py-2 text-sm font-semibold text-rose-700">{demoError}</p> : null}
                </div>
              </div>
              <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col xl:flex-row">
                <button
                  type="button"
                  onClick={loadSafeDemoData}
                  disabled={demoLoading}
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-[#16C784] px-5 text-sm font-bold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {demoLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  Cargar ejemplo seguro
                </button>
                <Link href={taskNewRoute()} className="inline-flex h-11 items-center justify-center rounded-xl border ft-border bg-white px-5 text-sm font-bold ft-text-main transition hover:bg-slate-50">
                  Crear primera tarea
                </Link>
              </div>
            </div>
          </div>
        ) : null}
        <TaskKanbanBoard tasks={filteredFlowTasks} showHeader={false} workspaceKey={`${workspaceKey}:${flowGroupBy}`} visibleStatuses={visibleStatusColumns} onTaskPriorityChange={handleTaskPriorityChange} />
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <WorkspaceQuickWidget title="Tarea rápida" helper="Crea una tarea en segundos" href={taskNewRoute()} icon={ClipboardList} tone="green" />
        <WorkspaceQuickWidget title="Proyectos" helper="Ver todos los proyectos" href={projectListRoute()} icon={FolderKanban} tone="blue" />
        <WorkspaceQuickWidget title="Calendario" helper="Ver tu agenda" href="/app/tasks" icon={CalendarDays} tone="violet" />
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 text-amber-600">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-4">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/80 ring-1 ring-white/80">
                <MessageSquareText className="h-6 w-6" />
              </span>
              <div>
                <p className="text-base font-bold text-slate-950">Notas rápidas</p>
                <p className="text-xs font-medium text-slate-500">Captura ideas al vuelo</p>
              </div>
            </div>
            <BellRing className="h-5 w-5" />
          </div>
          <div className="mt-4 flex gap-2">
            <input
              value={noteDraft}
              onChange={(event) => setNoteDraft(event.target.value)}
              onKeyDown={(event) => { if (event.key === 'Enter') saveQuickNote(); }}
              placeholder="Nueva nota..."
              className="min-w-0 flex-1 rounded-2xl border border-white/80 bg-white/85 px-3 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-amber-200 focus:bg-white"
            />
            <button type="button" onClick={saveQuickNote} className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500 text-white transition hover:bg-amber-600" aria-label="Guardar nota">
              <Plus className="h-4 w-4" />
            </button>
          </div>
          {notes.length ? <p className="mt-2 truncate text-xs text-slate-500">Última: {notes[0].text}</p> : null}
        </div>
      </div>
    </div>
  );
}
