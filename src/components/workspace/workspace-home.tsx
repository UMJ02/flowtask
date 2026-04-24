'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  BellRing,
  CalendarDays,
  ChevronRight,
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
import { createClient } from '@/lib/supabase/client';
import { applyClientWorkspaceScope, getClientWorkspaceContext } from '@/lib/supabase/workspace-client';
import { cn } from '@/lib/utils/classnames';
import { projectListRoute, taskNewRoute } from '@/lib/navigation/routes';

const NOTE_STORAGE_KEY = 'flowtask.workspace.quick-notes.v58.13';

const todayIso = () => new Date().toISOString().slice(0, 10);

function formatShortDate(value?: string | null) {
  if (!value) return 'Sin fecha';
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return value;
  const [, , month, day] = match;
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return `${day} ${months[Math.max(0, Math.min(11, Number(month) - 1))]}`;
}

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

function KpiCard({
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
    rose: 'bg-rose-50 text-rose-600 ring-rose-100',
    amber: 'bg-amber-50 text-amber-600 ring-amber-100',
    violet: 'bg-violet-50 text-violet-600 ring-violet-100',
    sky: 'bg-sky-50 text-sky-600 ring-sky-100',
  }[tone];

  return (
    <Card className="rounded-[18px] border-slate-200/80 bg-white/95 p-4 shadow-[0_12px_28px_rgba(15,23,42,0.045)] md:p-4">
      <div className="flex items-center gap-3">
        <span className={cn('inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ring-1', toneClasses)}>
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-500">{label}</p>
          <p className="mt-0.5 text-2xl font-bold tracking-tight text-slate-950">{value}</p>
          <p className="mt-0.5 truncate text-xs text-slate-500">{helper}</p>
        </div>
      </div>
    </Card>
  );
}

function QuickWidget({
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
  tone: string;
}) {
  return (
    <Link
      href={href as any}
      className={cn(
        'group flex min-h-[102px] items-center justify-between rounded-[20px] border bg-white/86 px-4 py-4 shadow-[0_12px_28px_rgba(15,23,42,0.045)] ring-1 ring-white/80 transition hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(15,23,42,0.075)]',
        tone,
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/75 text-slate-700 ring-1 ring-white/70">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-950">{title}</p>
          <p className="mt-1 truncate text-xs text-slate-500">{helper}</p>
        </div>
      </div>
      <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/70 text-slate-700 ring-1 ring-white/80 transition group-hover:bg-slate-950 group-hover:text-white">
        <ChevronRight className="h-4 w-4" />
      </span>
    </Link>
  );
}

export function WorkspaceHome() {
  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tasks, setTasks] = useState<WorkspaceTask[]>([]);
  const [projects, setProjects] = useState<WorkspaceProject[]>([]);
  const [workspaceKey, setWorkspaceKey] = useState('personal');
  const [workspaceLabel, setWorkspaceLabel] = useState('workspace personal');
  const [noteDraft, setNoteDraft] = useState('');
  const [notes, setNotes] = useState<QuickNote[]>([]);
  const [refreshTick, setRefreshTick] = useState(0);

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
          .select('id,title,status,priority,client_name,due_date,project_id,organization_id,owner_id,created_at,updated_at')
          .order('due_date', { ascending: true, nullsFirst: false })
          .order('updated_at', { ascending: false })
          .limit(120),
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
  }, [refreshTick, supabase]);

  const today = todayIso();
  const openTasks = useMemo(() => tasks.filter((task) => task.status !== 'concluido'), [tasks]);
  const overdueTasks = useMemo(() => openTasks.filter((task) => task.due_date && task.due_date < today), [openTasks, today]);
  const dueToday = useMemo(() => openTasks.filter((task) => task.due_date === today), [openTasks, today]);
  const waiting = useMemo(() => openTasks.filter((task) => task.status === 'en_espera'), [openTasks]);
  const activeProjects = useMemo(() => projects.filter((project) => project.status !== 'completado'), [projects]);
  const favoriteCount = useMemo(() => {
    if (typeof window === 'undefined') return 0;
    try {
      const raw = window.localStorage.getItem('flowtask.memory.v1');
      const parsed = raw ? JSON.parse(raw) : null;
      return Array.isArray(parsed?.favorites) ? parsed.favorites.filter((item: { type?: string }) => item.type === 'task').length : 0;
    } catch {
      return 0;
    }
  }, [tasks.length]);

  const radarTitle = overdueTasks.length
    ? `Hay ${overdueTasks.length} tarea${overdueTasks.length === 1 ? '' : 's'} vencida${overdueTasks.length === 1 ? '' : 's'} empujando el día`
    : dueToday.length
      ? `Hay ${dueToday.length} tarea${dueToday.length === 1 ? '' : 's'} para mover hoy`
      : 'Tu workspace está estable para avanzar con foco';

  const radarCopy = overdueTasks.length
    ? 'Lo vencido está contaminando tu foco. Revisá el flujo y limpiá bloqueos antes de crear más carga.'
    : dueToday.length
      ? 'Buen momento para ordenar prioridades y cerrar entregables visibles.'
      : 'Sin urgencias críticas. Aprovechá para planear, documentar y avanzar proyectos activos.';

  function saveQuickNote() {
    const text = noteDraft.trim();
    if (!text) return;
    const next = [{ id: crypto.randomUUID(), text, updatedAt: new Date().toISOString() }, ...notes].slice(0, 8);
    setNotes(next);
    writeNotes(workspaceKey, next);
    setNoteDraft('');
  }

  return (
    <div className="space-y-4 pb-2">
      <Card className="relative overflow-hidden rounded-[22px] border-rose-100/80 bg-[radial-gradient(circle_at_15%_15%,rgba(16,185,129,0.10),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.98),rgba(255,247,247,0.92))] p-4 shadow-[0_18px_44px_rgba(15,23,42,0.055)] md:p-5">
        <div className="absolute right-6 top-5 hidden h-24 w-24 rounded-full bg-emerald-100/60 blur-3xl md:block" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="hidden h-[112px] w-[112px] shrink-0 items-end justify-center overflow-hidden rounded-[26px] bg-gradient-to-br from-slate-100 to-white ring-1 ring-slate-200/80 md:flex">
              <div className="mb-[-12px] flex h-24 w-20 items-center justify-center rounded-t-full bg-slate-900 shadow-lg">
                <Sparkles className="h-9 w-9 text-emerald-300" />
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-600 ring-1 ring-slate-200">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-600" /> Radar inteligente
                </span>
                <span className={cn('inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em]', overdueTasks.length ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700')}>
                  {overdueTasks.length ? 'Prioridad alta' : 'En control'}
                </span>
              </div>
              <h2 className="mt-3 max-w-4xl text-xl font-black tracking-[-0.03em] text-slate-950 md:text-2xl lg:text-[1.72rem]">{radarTitle}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">{radarCopy}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <span className="inline-flex h-9 items-center rounded-full bg-emerald-50 px-3 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100">Score {Math.max(60, 200 - overdueTasks.length * 25 - waiting.length * 4)}</span>
            <Link href="/app/tasks" className="inline-flex h-10 items-center justify-center rounded-[14px] bg-slate-950 px-4 text-sm font-bold text-white shadow-[0_12px_24px_rgba(15,23,42,0.16)] transition hover:bg-slate-800">Revisar ahora <ChevronRight className="ml-2 h-4 w-4" /></Link>
            <Link href="#workspace-flow" className="inline-flex h-10 items-center justify-center rounded-[14px] border border-slate-200 bg-white/80 px-4 text-sm font-bold text-slate-700 transition hover:bg-white">Ver tablero</Link>
          </div>
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[repeat(4,minmax(0,1fr))_220px]">
        <KpiCard label="Vence hoy" value={dueToday.length} helper="Tareas abiertas" icon={CalendarDays} tone="rose" />
        <KpiCard label="Favoritas" value={favoriteCount} helper="Tareas guardadas" icon={Star} tone="amber" />
        <KpiCard label="Pendientes" value={openTasks.length} helper="Fecha definida" icon={Timer} tone="violet" />
        <KpiCard label="Proyectos activos" value={activeProjects.length} helper="En curso" icon={FolderKanban} tone="sky" />
        <Card className="flex items-center justify-center gap-2 rounded-[18px] border-slate-200/80 bg-white/80 p-3 shadow-[0_12px_28px_rgba(15,23,42,0.04)]">
          <button type="button" onClick={() => setRefreshTick((value) => value + 1)} className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50" aria-label="Actualizar workspace">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
          </button>
          <Link href="/app/tasks" className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50" aria-label="Tareas">
            <LayoutGrid className="h-4 w-4" />
          </Link>
          <Link href="/app/settings" className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50" aria-label="Ajustes rápidos">
            <SlidersHorizontal className="h-4 w-4" />
          </Link>
        </Card>
      </div>

      <section id="workspace-flow">
        <Card className="rounded-[22px] border-slate-200/80 bg-white/92 p-4 shadow-[0_18px_46px_rgba(15,23,42,0.055)] md:p-4">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-50 text-slate-700 ring-1 ring-slate-200">
              <LayoutGrid className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-black tracking-[-0.02em] text-slate-950">Mi flujo de trabajo</h2>
              <p className="text-sm text-slate-500">{workspaceLabel}. Arrastrá y soltá para reorganizar.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" className="inline-flex h-10 items-center gap-2 rounded-[14px] border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">
              <SlidersHorizontal className="h-4 w-4" /> Filtros
            </button>
            <button type="button" className="inline-flex h-10 items-center gap-2 rounded-[14px] border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">
              Agrupar: Estado
            </button>
            <Link href={taskNewRoute()} className="inline-flex h-10 items-center justify-center rounded-[14px] bg-emerald-600 px-4 text-sm font-bold text-white shadow-[0_12px_24px_rgba(16,185,129,0.18)] transition hover:bg-emerald-700"><Plus className="mr-2 h-4 w-4" /> Nueva tarea</Link>
          </div>
        </div>
        {error ? <div className="mb-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
        <TaskKanbanBoard tasks={tasks} showHeader={false} workspaceKey={workspaceKey} />
        </Card>
      </section>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <QuickWidget title="Tarea rápida" helper="Crea una tarea en segundos" href={taskNewRoute()} icon={ClipboardList} tone="border-emerald-100 bg-emerald-50/55" />
        <QuickWidget title="Proyectos" helper="Ver todos los proyectos" href={projectListRoute()} icon={FolderKanban} tone="border-sky-100 bg-sky-50/55" />
        <QuickWidget title="Calendario" helper="Ver tu agenda" href="/app/tasks" icon={CalendarDays} tone="border-violet-100 bg-violet-50/55" />
        <div className="rounded-[20px] border border-amber-100 bg-amber-50/55 p-4 shadow-[0_12px_28px_rgba(15,23,42,0.045)] ring-1 ring-white/80">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/75 text-amber-700 ring-1 ring-white/70">
                <MessageSquareText className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-slate-950">Notas rápidas</p>
                <p className="text-xs text-slate-500">Captura ideas al vuelo</p>
              </div>
            </div>
            <BellRing className="h-4 w-4 text-amber-600" />
          </div>
          <div className="mt-3 flex gap-2">
            <input
              value={noteDraft}
              onChange={(event) => setNoteDraft(event.target.value)}
              onKeyDown={(event) => { if (event.key === 'Enter') saveQuickNote(); }}
              placeholder="Nueva nota..."
              className="min-w-0 flex-1 rounded-2xl border border-white/70 bg-white/80 px-3 py-2 text-sm outline-none transition focus:border-amber-200 focus:bg-white"
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
