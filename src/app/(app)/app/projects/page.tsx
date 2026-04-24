export const dynamic = 'force-dynamic';

import type { ReactNode } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Filter,
  Flag,
  FolderKanban,
  MoreVertical,
  PauseCircle,
  Plus,
  Search,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { projectDetailRoute, projectNewRoute } from '@/lib/navigation/routes';
import { getProjects } from '@/lib/queries/projects';
import { safeServerCall } from '@/lib/runtime/safe-server';
import { formatDate } from '@/lib/utils/dates';
import type { ProjectSummary, ProjectStatus } from '@/types/project';

type ProjectsSearchParams = Promise<Record<string, string | string[] | undefined>> | undefined;

type ProjectFilters = {
  q: string;
  status: string;
  department: string;
  mode: string;
  client: string;
};

type StatusTone = {
  label: string;
  className: string;
};

const STATUS_TONES: Record<ProjectStatus, StatusTone> = {
  activo: {
    label: 'En progreso',
    className: 'bg-blue-50 text-blue-700 ring-blue-100',
  },
  en_pausa: {
    label: 'En pausa',
    className: 'bg-amber-50 text-amber-700 ring-amber-100',
  },
  completado: {
    label: 'Completado',
    className: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  },
  vencido: {
    label: 'Atrasado',
    className: 'bg-rose-50 text-rose-700 ring-rose-100',
  },
};

const COVER_GRADIENTS = [
  'from-emerald-100 via-slate-50 to-slate-200',
  'from-sky-100 via-white to-slate-200',
  'from-violet-100 via-white to-slate-200',
  'from-amber-100 via-white to-slate-200',
  'from-rose-100 via-white to-slate-200',
];

function getProjectProgress(project: ProjectSummary, index: number) {
  if (project.status === 'completado') return 100;
  if (project.status === 'vencido') return 22;
  if (project.status === 'en_pausa') return 35;
  const seed = project.title.split('').reduce((sum, char) => sum + char.charCodeAt(0), index * 13);
  return 38 + (seed % 41);
}

function getProjectPriority(project: ProjectSummary, index: number) {
  if (project.status === 'vencido') return 'Alta';
  if (project.status === 'en_pausa') return 'Media';
  const priorities = ['Media', 'Alta', 'Baja'] as const;
  return priorities[(project.title.length + index) % priorities.length];
}

function priorityClass(priority: string) {
  if (priority === 'Alta') return 'bg-rose-50 text-rose-700 ring-rose-100';
  if (priority === 'Baja') return 'bg-emerald-50 text-emerald-700 ring-emerald-100';
  return 'bg-amber-50 text-amber-700 ring-amber-100';
}

function getProjectDescription(project: ProjectSummary) {
  const client = project.clientName || project.client_name;
  const department = project.departmentName;
  if (client && department) return `${client} · ${department}`;
  if (client) return client;
  if (department) return department;
  return 'Proyecto del workspace con seguimiento activo.';
}

function buildQueryString(filters: ProjectFilters) {
  return new URLSearchParams(
    Object.entries(filters).flatMap(([key, value]) => (value ? [[key, value]] : [])),
  ).toString();
}

function statusLabel(status: ProjectStatus) {
  return STATUS_TONES[status]?.label ?? 'En progreso';
}

function StatusBadge({ status }: { status: ProjectStatus }) {
  const tone = STATUS_TONES[status] ?? STATUS_TONES.activo;
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ring-1 ${tone.className}`}>
      {tone.label}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ring-1 ${priorityClass(priority)}`}>
      {priority}
    </span>
  );
}

function ProjectProgressBar({ value }: { value: number }) {
  return (
    <div className="min-w-[120px]">
      <div className="mb-2 flex items-center justify-between gap-3 text-xs font-bold text-[#0F172A]">
        <span>{value}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-[#16C784]" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
      </div>
    </div>
  );
}

function ProjectMembersAvatars({ countSeed }: { countSeed: number }) {
  const total = 2 + (countSeed % 4);
  const visible = Math.min(total, 3);
  const colors = ['bg-emerald-100 text-emerald-800', 'bg-sky-100 text-sky-800', 'bg-amber-100 text-amber-800'];
  return (
    <div className="flex items-center">
      {Array.from({ length: visible }).map((_, index) => (
        <span
          key={index}
          className={`-ml-1 first:ml-0 inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-[11px] font-bold ${colors[index % colors.length]}`}
        >
          {index === 0 ? 'U' : index === 1 ? 'J' : 'A'}
        </span>
      ))}
      {total > visible ? (
        <span className="-ml-1 inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-xs font-bold text-slate-600">
          +{total - visible}
        </span>
      ) : null}
    </div>
  );
}

function ProjectsStatCard({ icon, label, value, helper, tone }: { icon: ReactNode; label: string; value: number; helper: string; tone: string }) {
  return (
    <div className="rounded-[20px] border border-[#E5EAF1] bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
      <div className="flex items-center gap-4">
        <span className={`inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${tone}`}>{icon}</span>
        <div>
          <p className="text-sm font-bold text-[#64748B]">{label}</p>
          <p className="mt-1 text-2xl font-black tracking-tight text-[#0F172A]">{value}</p>
          <p className="mt-1 text-sm text-[#64748B]">{helper}</p>
        </div>
      </div>
    </div>
  );
}

function ProjectsPagination({ total }: { total: number }) {
  return (
    <div className="flex flex-col gap-3 border-t border-[#E5EAF1] px-5 py-4 text-sm text-[#64748B] md:flex-row md:items-center md:justify-between">
      <p>Mostrando 1 a {Math.min(total, 5)} de {total} proyectos</p>
      <div className="flex flex-wrap items-center gap-2">
        <button className="inline-flex h-9 items-center rounded-xl border border-[#E5EAF1] bg-white px-4 font-semibold text-slate-400" disabled>
          Anterior
        </button>
        <button className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#050B18] text-sm font-bold text-white">1</button>
        <button className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#E5EAF1] bg-white text-sm font-bold text-[#0F172A]">2</button>
        <button className="inline-flex h-9 items-center gap-2 rounded-xl border border-[#E5EAF1] bg-white px-4 font-semibold text-[#0F172A]">
          Siguiente <ArrowRight className="h-4 w-4" />
        </button>
        <span className="ml-2 hidden md:inline">Mostrar</span>
        <button className="inline-flex h-9 items-center gap-2 rounded-xl border border-[#E5EAF1] bg-white px-3 font-bold text-[#0F172A]">
          10 <ChevronDown className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function ProjectRow({ project, index, queryString }: { project: ProjectSummary; index: number; queryString: string }) {
  const progress = getProjectProgress(project, index);
  const priority = getProjectPriority(project, index);
  const coverTone = COVER_GRADIENTS[index % COVER_GRADIENTS.length];
  const detailHref = projectDetailRoute(project.id, queryString);

  return (
    <tr className="group border-t border-[#E5EAF1] transition hover:bg-slate-50/70">
      <td className="px-5 py-4 align-middle">
        <Link href={detailHref} className="flex min-w-[290px] items-center gap-4">
          <span className={`relative inline-flex h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br ${coverTone} ring-1 ring-slate-200`}>
            <span className="absolute bottom-2 left-2 h-6 w-10 rounded-lg bg-white/45 backdrop-blur" />
            <span className="absolute right-2 top-2 h-5 w-5 rounded-full bg-[#16C784]/80" />
          </span>
          <span>
            <span className="block text-base font-black text-[#0F172A] transition group-hover:text-[#16C784]">{project.title}</span>
            <span className="mt-1 line-clamp-2 block max-w-[330px] text-sm leading-6 text-[#64748B]">{getProjectDescription(project)}</span>
          </span>
        </Link>
      </td>
      <td className="px-5 py-4 align-middle"><StatusBadge status={project.status} /></td>
      <td className="px-5 py-4 align-middle"><ProjectProgressBar value={progress} /></td>
      <td className="px-5 py-4 align-middle"><ProjectMembersAvatars countSeed={project.title.length + index} /></td>
      <td className="whitespace-nowrap px-5 py-4 align-middle text-sm font-semibold text-slate-600">
        {project.dueDate || project.due_date ? formatDate((project.dueDate || project.due_date) as string) : 'Sin fecha'}
      </td>
      <td className="px-5 py-4 align-middle"><PriorityBadge priority={priority} /></td>
      <td className="px-5 py-4 align-middle">
        <Link href={detailHref} aria-label={`Abrir proyecto ${project.title}`} className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#E5EAF1] bg-white text-slate-600 transition hover:-translate-y-0.5 hover:border-slate-300 hover:text-[#0F172A] hover:shadow-[0_10px_24px_rgba(15,23,42,0.07)]">
          <MoreVertical className="h-5 w-5" />
        </Link>
      </td>
    </tr>
  );
}

export default async function ProjectsPage({ searchParams }: { searchParams?: ProjectsSearchParams }) {
  const params = (await searchParams) ?? {};
  const filters: ProjectFilters = {
    q: typeof params.q === 'string' ? params.q : '',
    status: typeof params.status === 'string' ? params.status : '',
    department: typeof params.department === 'string' ? params.department : '',
    mode: typeof params.mode === 'string' ? params.mode : '',
    client: typeof params.client === 'string' ? params.client : '',
  };
  const projects = await safeServerCall('getProjects', () => getProjects(filters), [] as ProjectSummary[]);
  const queryString = buildQueryString(filters);

  const stats = {
    total: projects.length,
    active: projects.filter((project) => project.status === 'activo').length,
    paused: projects.filter((project) => project.status === 'en_pausa').length,
    completed: projects.filter((project) => project.status === 'completado').length,
  };

  return (
    <div className="space-y-5 pb-3">
      <Card className="rounded-[24px] border-[#E5EAF1] bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)] md:p-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-[#0F172A]">Proyectos</h1>
            <p className="mt-2 text-base text-[#64748B]">Todos los proyectos creados en tu workspace.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/app/projects" className="inline-flex h-12 items-center justify-center gap-2 rounded-[16px] border border-[#E5EAF1] bg-white px-5 text-sm font-bold text-[#334155] transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_12px_26px_rgba(15,23,42,0.06)]">
              <Filter className="h-4 w-4" />
              Filtros
            </Link>
            <Link href={projectNewRoute(queryString)} className="inline-flex h-12 items-center justify-center gap-2 rounded-[16px] bg-[#050B18] px-5 text-sm font-bold text-white shadow-[0_14px_30px_rgba(5,11,24,0.18)] transition hover:-translate-y-0.5 hover:bg-slate-900">
              <Plus className="h-4 w-4" />
              Nuevo proyecto
            </Link>
          </div>
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <ProjectsStatCard icon={<FolderKanban className="h-6 w-6" />} label="Total proyectos" value={stats.total} helper="proyectos creados" tone="bg-violet-50 text-violet-700" />
          <ProjectsStatCard icon={<CheckCircle2 className="h-6 w-6" />} label="Activos" value={stats.active} helper="proyectos en marcha" tone="bg-emerald-50 text-emerald-700" />
          <ProjectsStatCard icon={<PauseCircle className="h-6 w-6" />} label="En pausa" value={stats.paused} helper="proyecto pausado" tone="bg-amber-50 text-amber-700" />
          <ProjectsStatCard icon={<Flag className="h-6 w-6" />} label="Completados" value={stats.completed} helper="proyecto finalizado" tone="bg-rose-50 text-rose-700" />
        </div>
      </Card>

      <Card className="rounded-[24px] border-[#E5EAF1] bg-white p-0 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col gap-3 border-b border-[#E5EAF1] p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <form>
              <input
                name="q"
                defaultValue={filters.q}
                placeholder="Buscar proyecto, cliente o departamento..."
                className="h-12 w-full rounded-[16px] border border-[#E5EAF1] bg-white pl-11 pr-4 text-sm font-medium text-[#0F172A] outline-none transition placeholder:text-slate-400 focus:border-[#16C784] focus:ring-4 focus:ring-emerald-500/10"
              />
            </form>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              ['status', 'Estado'],
              ['mode', 'Modo'],
              ['department', 'Departamento'],
              ['client', 'Cliente'],
            ].map(([key, label]) => (
              <Link key={key} href="/app/projects" className="inline-flex h-11 items-center gap-2 rounded-[14px] border border-[#E5EAF1] bg-white px-4 text-sm font-bold text-[#334155] transition hover:bg-slate-50">
                {label} <ChevronDown className="h-4 w-4 text-slate-400" />
              </Link>
            ))}
          </div>
        </div>

        {projects.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1040px] border-separate border-spacing-0">
              <thead>
                <tr className="text-left text-[11px] font-black uppercase tracking-[0.16em] text-[#64748B]">
                  <th className="px-5 py-4">Proyecto</th>
                  <th className="px-5 py-4">Estado</th>
                  <th className="px-5 py-4">Progreso</th>
                  <th className="px-5 py-4">Miembros</th>
                  <th className="px-5 py-4">Fecha límite</th>
                  <th className="px-5 py-4">Prioridad</th>
                  <th className="px-5 py-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {projects.slice(0, 10).map((project, index) => (
                  <ProjectRow key={project.id} project={project} index={index} queryString={queryString} />
                ))}
              </tbody>
            </table>
            <ProjectsPagination total={projects.length} />
          </div>
        ) : (
          <div className="p-6">
            <EmptyState
              icon={<BriefcaseBusiness className="h-6 w-6" />}
              title="No encontramos proyectos con este filtro"
              description="Puedes limpiar los filtros o crear un proyecto nuevo para empezar a ordenar el trabajo del equipo."
              action={
                <div className="flex flex-wrap justify-center gap-2">
                  <Link href="/app/projects" className="inline-flex h-11 items-center rounded-2xl border border-[#E5EAF1] bg-white px-4 text-sm font-bold text-[#0F172A]">Limpiar filtros</Link>
                  <Link href={projectNewRoute(queryString)} className="inline-flex h-11 items-center rounded-2xl bg-[#050B18] px-4 text-sm font-bold text-white">Nuevo proyecto</Link>
                </div>
              }
            />
          </div>
        )}
      </Card>

      <div className="flex items-center justify-between rounded-[20px] border border-emerald-100 bg-emerald-50/70 px-5 py-4 text-sm text-slate-600">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#16C784] ring-1 ring-emerald-100">
            <ShieldCheck className="h-4 w-4" />
          </span>
          <p><span className="font-black text-[#0F172A]">Consejo:</span> organiza tus proyectos por prioridad y estado para mantener el enfoque en lo más importante.</p>
        </div>
        <Clock3 className="hidden h-4 w-4 text-emerald-500 md:block" />
      </div>
    </div>
  );
}
