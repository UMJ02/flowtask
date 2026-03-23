import Link from 'next/link';
import { AlertTriangle, ArrowUpRight, CalendarClock, FolderKanban, Layers3, Target, UsersRound } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { asRoute } from '@/lib/navigation/routes';
import type { PlanningOverview } from '@/lib/queries/planning';

const bucketToneClasses: Record<PlanningOverview['dueBuckets'][number]['tone'], string> = {
  critical: 'bg-rose-50 text-rose-700 ring-1 ring-rose-100',
  focus: 'bg-amber-50 text-amber-700 ring-1 ring-amber-100',
  planned: 'bg-blue-50 text-blue-700 ring-1 ring-blue-100',
  backlog: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
};

const capacityToneClasses: Record<PlanningOverview['departmentCapacity'][number]['state'], string> = {
  high: 'bg-rose-50 text-rose-700 ring-1 ring-rose-100',
  medium: 'bg-amber-50 text-amber-700 ring-1 ring-amber-100',
  stable: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100',
};

function daysLeftLabel(value: number | null) {
  if (value === null) return 'Sin fecha';
  if (value < 0) return `${Math.abs(value)} día(s) vencida`;
  if (value === 0) return 'Vence hoy';
  return `${value} día(s) restantes`;
}

export function PlanningCenter({ summary, compact = false }: { summary: PlanningOverview; compact?: boolean }) {
  const cards = [
    { label: 'Esta semana', value: summary.kpis.dueThisWeek, icon: <CalendarClock className="h-5 w-5" /> },
    { label: 'Próxima semana', value: summary.kpis.dueNextWeek, icon: <Target className="h-5 w-5" /> },
    { label: 'Tareas vencidas', value: summary.kpis.overdueOpenTasks, icon: <AlertTriangle className="h-5 w-5" /> },
    { label: 'Proyectos activos', value: summary.kpis.activeProjects, icon: <FolderKanban className="h-5 w-5" /> },
  ];

  if (compact) {
    return (
      <Card>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">Planning</p>
            <h3 className="mt-2 text-xl font-bold text-slate-900">Radar de planificación</h3>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">Revisa lo que vence primero, la carga por departamento y cuáles clientes concentran más movimiento.</p>
          </div>
          <Link href={asRoute("/app/planning")}><Button>Ver centro de planificación</Button></Link>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-4">
          {cards.map((card) => (
            <div key={card.label} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="flex items-center justify-between gap-3 text-slate-500">
                <span className="text-sm">{card.label}</span>
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-white text-violet-700 ring-1 ring-slate-200">{card.icon}</span>
              </div>
              <p className="mt-3 text-2xl font-bold text-slate-900">{card.value}</p>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label} className="bg-gradient-to-br from-white to-violet-50/40">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-slate-500">{card.label}</p>
                <p className="mt-3 text-3xl font-bold text-slate-900">{card.value}</p>
              </div>
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-700 ring-1 ring-violet-100">
                {card.icon}
              </span>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="bg-[linear-gradient(135deg,#1e1b4b_0%,#312e81_55%,#0f172a_100%)] text-white shadow-[0_24px_60px_rgba(49,46,129,0.22)]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-200">Planning center</p>
              <h2 className="mt-2 text-3xl font-bold">Tu ventana de capacidad de los próximos 14 días</h2>
              <p className="mt-2 text-sm text-violet-100/90">Esta vista te ayuda a prevenir sobrecarga, ordenar prioridades y detectar qué cliente o frente necesita atención primero.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[26px] bg-white/10 px-4 py-3 ring-1 ring-white/10">
                <p className="text-xs uppercase tracking-[0.16em] text-violet-100/80">Clientes activos</p>
                <p className="mt-2 text-3xl font-bold">{summary.kpis.activeClients}</p>
              </div>
              <div className="rounded-[26px] bg-white/10 px-4 py-3 ring-1 ring-white/10">
                <p className="text-xs uppercase tracking-[0.16em] text-violet-100/80">Colaborativos</p>
                <p className="mt-2 text-3xl font-bold">{summary.kpis.collaborativeProjects}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Recomendaciones</p>
              <h3 className="mt-2 text-xl font-bold text-slate-900">Qué revisar primero</h3>
            </div>
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 ring-1 ring-slate-200">
              <ArrowUpRight className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-5 space-y-3">
            {summary.recommendations.map((item) => (
              <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">{item}</div>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href={asRoute("/app/reports/print?type=planning")} target="_blank"><Button>Planning PDF</Button></Link>
            <Link href={asRoute("/app/tasks")}><Button variant="secondary">Ir a tareas</Button></Link>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {summary.dueBuckets.map((bucket) => (
          <Card key={bucket.label} className="xl:col-span-1">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-slate-500">{bucket.label}</p>
                <p className="mt-3 text-3xl font-bold text-slate-900">{bucket.count}</p>
              </div>
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${bucketToneClasses[bucket.tone]}`}>{bucket.label}</span>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <Card>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Capacidad por departamento</h3>
              <p className="mt-1 text-sm text-slate-500">Qué bloques tienen más presión cerca.</p>
            </div>
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-700 ring-1 ring-violet-100">
              <Layers3 className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-5 space-y-3">
            {summary.departmentCapacity.length ? summary.departmentCapacity.map((item) => (
              <div key={item.name} className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.nearTermItems} items cercanos · {item.openTasks} tareas · {item.activeProjects} proyectos</p>
                  </div>
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${capacityToneClasses[item.state]}`}>{item.state === 'high' ? 'Alta presión' : item.state === 'medium' ? 'Atención media' : 'Estable'}</span>
                </div>
              </div>
            )) : <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-6 text-sm text-slate-500">Todavía no hay departamentos con carga suficiente para resumir.</div>}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Clientes con más movimiento</h3>
              <p className="mt-1 text-sm text-slate-500">Te ayuda a planificar llamadas, revisiones y seguimiento.</p>
            </div>
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
              <UsersRound className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-5 space-y-3">
            {summary.clientMomentum.length ? summary.clientMomentum.map((client) => (
              <Link key={client.id} href={asRoute(`/app/clients/${client.id}`)} className="block rounded-2xl border border-slate-200 bg-white px-4 py-4 transition hover:border-violet-200 hover:bg-violet-50/40">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{client.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{client.upcomingItems} entregables cercanos · {client.openTasks} tareas · {client.openProjects} proyectos</p>
                  </div>
                  <StatusBadge value={client.status} className="shrink-0" />
                </div>
              </Link>
            )) : <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-6 text-sm text-slate-500">No hay clientes con actividad suficiente para resumir.</div>}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <Card>
          <h3 className="text-lg font-semibold text-slate-900">Foco semanal</h3>
          <p className="mt-1 text-sm text-slate-500">Las tareas que conviene resolver primero.</p>
          <div className="mt-5 space-y-3">
            {summary.weeklyFocus.length ? summary.weeklyFocus.map((task) => (
              <Link key={task.id} href={asRoute(`/app/tasks/${task.id}`)} className="block rounded-2xl border border-slate-200 bg-white px-4 py-4 transition hover:border-violet-200 hover:bg-violet-50/40">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{task.title}</p>
                    <p className="mt-1 text-sm text-slate-500">{task.clientName} · {task.dueLabel} · {daysLeftLabel(task.daysLeft)}</p>
                  </div>
                  <StatusBadge value={task.status} className="shrink-0" />
                </div>
              </Link>
            )) : <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-6 text-sm text-slate-500">No hay tareas abiertas para mostrar en el foco semanal.</div>}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-slate-900">Pipeline de proyectos</h3>
          <p className="mt-1 text-sm text-slate-500">Proyectos activos ordenados por cercanía y coordinación.</p>
          <div className="mt-5 space-y-3">
            {summary.projectPipeline.length ? summary.projectPipeline.map((project) => (
              <Link key={project.id} href={asRoute(`/app/projects/${project.id}`)} className="block rounded-2xl border border-slate-200 bg-white px-4 py-4 transition hover:border-violet-200 hover:bg-violet-50/40">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{project.title}</p>
                    <p className="mt-1 text-sm text-slate-500">{project.clientName} · {project.dueLabel} · {project.isCollaborative ? 'Colaborativo' : 'Solo'}</p>
                  </div>
                  <StatusBadge value={project.status} className="shrink-0" />
                </div>
              </Link>
            )) : <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-6 text-sm text-slate-500">No hay proyectos activos para mostrar en el pipeline.</div>}
          </div>
        </Card>
      </div>
    </div>
  );
}
