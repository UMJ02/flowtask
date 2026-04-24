'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  BellRing,
  CalendarDays,
  ChevronDown,
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

const NOTE_STORAGE_KEY = 'flowtask.workspace.quick-notes.v58.13.1';

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
    <Card className="rounded-[20px] border-[#E5EAF1] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)] ring-0 md:p-5">
      <div className="flex items-center gap-4">
        <span className={cn('inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full ring-1', toneClasses)}>
          <Icon className="h-6 w-6" />
        </span>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-slate-500">{label}</p>
          <p className="mt-0.5 text-3xl font-bold leading-none tracking-[-0.04em] text-[#0F172A]">{value}</p>
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
        'group flex min-h-[112px] items-center justify-between rounded-[20px] border px-5 py-5 shadow-[0_12px_30px_rgba(15,23,42,0.045)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(15,23,42,0.075)]',
        toneClasses,
      )}
    >
      <div className="flex min-w-0 items-center gap-4">
        <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/80 ring-1 ring-white/80">
          <Icon className="h-6 w-6" />
        </span>
        <div className="min-w-0">
          <p className="text-base font-bold text-slate-950">{title}</p>
          <p className="mt-1 truncate text-xs font-medium text-slate-500">{helper}</p>
        </div>
      </div>
      <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/70 ring-1 ring-white/80 transition group-hover:bg-[#050B18] group-hover:text-white">
        {tone === 'green' ? <Plus className="h-6 w-6" /> : <Icon className="h-6 w-6" />}
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
    ? 'Lo vencido está contaminando tu foco.'
    : dueToday.length
      ? 'Ordená prioridades y cerrá los entregables visibles de hoy.'
      : 'Sin urgencias críticas. Aprovechá para planear, documentar y avanzar proyectos activos.';

  const radarScore = Math.max(60, 200 - overdueTasks.length * 25 - waiting.length * 4);

  function saveQuickNote() {
    const text = noteDraft.trim();
    if (!text) return;
    const next = [{ id: crypto.randomUUID(), text, updatedAt: new Date().toISOString() }, ...notes].slice(0, 8);
    setNotes(next);
    writeNotes(workspaceKey, next);
    setNoteDraft('');
  }

  return (
    <div className="space-y-6 pb-3">
      <section className="relative overflow-hidden rounded-[24px] border border-[#F6C7CD] bg-[linear-gradient(90deg,#FFF7F8_0%,#FFF9FB_100%)] px-6 py-6 shadow-[0_18px_50px_rgba(244,63,94,0.055)] md:px-9 md:py-7">
        <button type="button" aria-label="Cerrar radar" className="absolute right-5 top-5 hidden h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-white/75 hover:text-slate-900 md:inline-flex">
          ×
        </button>
        <div className="grid gap-5 lg:grid-cols-[150px_minmax(0,1fr)_auto] lg:items-center">
          <div className="hidden h-[132px] w-[132px] items-end justify-center overflow-hidden rounded-[28px] bg-white/35 md:flex">
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
            <h2 className="mt-4 max-w-4xl text-2xl font-black tracking-[-0.035em] text-[#0F172A] md:text-[1.7rem]">{radarTitle}</h2>
            <p className="mt-3 max-w-3xl text-[15px] leading-6 text-slate-500">{radarCopy}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 lg:justify-end">
            <span className="inline-flex h-9 items-center rounded-full bg-emerald-50 px-4 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-100">Score {radarScore}</span>
            <Link href="/app/tasks" className="inline-flex h-12 items-center justify-center rounded-[14px] bg-[#050B18] px-6 text-sm font-bold text-white shadow-[0_14px_26px_rgba(5,11,24,0.18)] transition hover:bg-slate-800">
              Revisar ahora <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
            <Link href="#workspace-flow" className="inline-flex h-12 items-center justify-center rounded-[14px] border border-[#E5EAF1] bg-white px-6 text-sm font-bold text-[#0F172A] shadow-[0_8px_18px_rgba(15,23,42,0.04)] transition hover:bg-slate-50">Ver tablero</Link>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-[repeat(4,minmax(0,1fr))_220px]">
        <WorkspaceKpiCard label="Vence hoy" value={dueToday.length} helper="Tareas abiertas" icon={CalendarDays} tone="rose" />
        <WorkspaceKpiCard label="Favoritas" value={favoriteCount} helper="Tareas" icon={Star} tone="amber" />
        <WorkspaceKpiCard label="Pendientes" value={openTasks.length} helper="Fecha definida" icon={Timer} tone="violet" />
        <WorkspaceKpiCard label="Proyectos activos" value={activeProjects.length} helper="En curso" icon={FolderKanban} tone="sky" />
        <Card className="flex items-center justify-center gap-3 rounded-[20px] border-[#E5EAF1] bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)] ring-0">
          <button type="button" onClick={() => setRefreshTick((value) => value + 1)} className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#E5EAF1] bg-white text-slate-600 transition hover:bg-slate-50" aria-label="Actualizar workspace">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
          </button>
          <Link href="/app/tasks" className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#E5EAF1] bg-white text-slate-600 transition hover:bg-slate-50" aria-label="Tareas">
            <LayoutGrid className="h-4 w-4" />
          </Link>
          <Link href="/app/settings" className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#E5EAF1] bg-white text-slate-600 transition hover:bg-slate-50" aria-label="Ajustes rápidos">
            <SlidersHorizontal className="h-4 w-4" />
          </Link>
        </Card>
      </div>

      <section id="workspace-flow" className="rounded-[24px] border border-[#E5EAF1] bg-white p-4 shadow-[0_16px_50px_rgba(15,23,42,0.055)] md:p-5">
        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-50 text-slate-600 ring-1 ring-[#E5EAF1]">
              <LayoutGrid className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-black tracking-[-0.02em] text-[#0F172A]">Mi flujo de trabajo</h2>
              <p className="text-sm text-slate-500">Gestiona tus tareas con enfoque. Arrastra y suelta para organizar.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" className="inline-flex h-10 items-center gap-2 rounded-[14px] border border-[#E5EAF1] bg-white px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">
              <SlidersHorizontal className="h-4 w-4" /> Filtros
            </button>
            <button type="button" className="inline-flex h-10 items-center gap-2 rounded-[14px] border border-[#E5EAF1] bg-white px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">
              Agrupar: Estado <ChevronDown className="h-4 w-4" />
            </button>
            <Link href={taskNewRoute()} className="inline-flex h-10 items-center justify-center rounded-[14px] bg-[#16C784] px-5 text-sm font-bold text-white shadow-[0_12px_24px_rgba(22,199,132,0.22)] transition hover:bg-emerald-600"><Plus className="mr-2 h-4 w-4" /> Nueva tarea</Link>
          </div>
        </div>
        {error ? <div className="mb-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
        <TaskKanbanBoard tasks={tasks} showHeader={false} workspaceKey={workspaceKey} />
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <WorkspaceQuickWidget title="Tarea rápida" helper="Crea una tarea en segundos" href={taskNewRoute()} icon={ClipboardList} tone="green" />
        <WorkspaceQuickWidget title="Proyectos" helper="Ver todos los proyectos" href={projectListRoute()} icon={FolderKanban} tone="blue" />
        <WorkspaceQuickWidget title="Calendario" helper="Ver tu agenda" href="/app/tasks" icon={CalendarDays} tone="violet" />
        <div className="rounded-[20px] border border-amber-200 bg-amber-50/70 p-5 text-amber-600 shadow-[0_12px_30px_rgba(15,23,42,0.045)]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-4">
              <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/80 ring-1 ring-white/80">
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
