'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowRight, ArrowUpRight, CalendarClock, ChevronLeft, ChevronRight, FolderKanban, Layers3, Target, UsersRound } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { asRoute } from '@/lib/navigation/routes';
import type { PlanningOverview } from '@/lib/queries/planning';

type PlanningTabKey = 'departmentCapacity' | 'weeklyFocus' | 'clientMomentum' | 'projectPipeline';

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

function RecommendationCarousel({ recommendations }: { recommendations: string[] }) {
  const safeItems = recommendations.length ? recommendations : ['La planificación viene balanceada. Mantén esta vista como radar rápido de la semana.'];
  const slides = useMemo(() => {
    const groups: string[][] = [];
    for (let index = 0; index < safeItems.length; index += 2) {
      groups.push(safeItems.slice(index, index + 2));
    }
    return groups;
  }, [safeItems]);
  const [page, setPage] = useState(0);
  const current = slides[page] ?? [];

  return (
    <Card className="p-4 md:p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Recomendaciones</p>
          <h3 className="mt-1 text-lg font-semibold text-slate-900">Qué conviene revisar primero</h3>
        </div>
        {slides.length > 1 ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((currentPage) => (currentPage === 0 ? slides.length - 1 : currentPage - 1))}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-violet-200 hover:text-violet-700"
              aria-label="Recomendación anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setPage((currentPage) => (currentPage + 1) % slides.length)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-violet-200 hover:text-violet-700"
              aria-label="Siguiente recomendación"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      </div>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {current.map((item) => (
          <div
            key={item}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 transition duration-300 hover:border-violet-200 hover:bg-violet-50/40"
          >
            {item}
          </div>
        ))}
      </div>
    </Card>
  );
}

function PlanningModules({ summary }: { summary: PlanningOverview }) {
  const [activeTab, setActiveTab] = useState<PlanningTabKey>('departmentCapacity');
  const [expanded, setExpanded] = useState<Record<PlanningTabKey, boolean>>({
    departmentCapacity: false,
    weeklyFocus: false,
    clientMomentum: false,
    projectPipeline: false,
  });

  const tabs: Array<{ key: PlanningTabKey; label: string; icon: React.ReactNode; helper: string }> = [
    { key: 'departmentCapacity', label: 'Capacidad por departamento', icon: <Layers3 className="h-4 w-4" />, helper: 'Presión cercana por equipo.' },
    { key: 'weeklyFocus', label: 'Foco semanal', icon: <CalendarClock className="h-4 w-4" />, helper: 'Lo que conviene resolver primero.' },
    { key: 'clientMomentum', label: 'Clientes con más movimiento', icon: <UsersRound className="h-4 w-4" />, helper: 'Frentes que piden seguimiento.' },
    { key: 'projectPipeline', label: 'Pipeline de proyectos', icon: <FolderKanban className="h-4 w-4" />, helper: 'Activos por cercanía y coordinación.' },
  ];

  const limit = expanded[activeTab] ? 999 : 5;

  return (
    <Card className="p-4 md:p-5">
      <div className="border-b border-slate-200 pb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Planning modules</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const isActive = tab.key === activeTab;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                  isActive
                    ? 'border-violet-200 bg-violet-50 text-violet-800 shadow-[0_10px_24px_rgba(139,92,246,0.12)]'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-violet-200 hover:text-violet-700'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === 'departmentCapacity' ? (
        <div className="pt-3">
          <h3 className="text-lg font-semibold text-slate-900">Capacidad por departamento</h3>
          <p className="mt-1 text-sm text-slate-500">Qué bloques tienen más presión cerca.</p>
          <div className="mt-3 divide-y divide-slate-200 rounded-[18px] border border-slate-200 bg-white">
            {summary.departmentCapacity.length ? summary.departmentCapacity.slice(0, limit).map((item) => (
              <div key={item.name} className="flex items-start justify-between gap-3 px-3.5 py-3.5">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                  <p className="mt-1 text-sm text-slate-500">{item.nearTermItems} items cercanos · {item.openTasks} tareas · {item.activeProjects} proyectos</p>
                </div>
                <span className={`shrink-0 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${capacityToneClasses[item.state]}`}>
                  {item.state === 'high' ? 'Alta presión' : item.state === 'medium' ? 'Atención media' : 'Estable'}
                </span>
              </div>
            )) : <div className="px-4 py-6 text-sm text-slate-500">Todavía no hay departamentos con carga suficiente para resumir.</div>}
          </div>
        </div>
      ) : null}

      {activeTab === 'weeklyFocus' ? (
        <div className="pt-3">
          <h3 className="text-lg font-semibold text-slate-900">Foco semanal</h3>
          <p className="mt-1 text-sm text-slate-500">Las tareas que conviene resolver primero.</p>
          <div className="mt-3 divide-y divide-slate-200 rounded-[18px] border border-slate-200 bg-white">
            {summary.weeklyFocus.length ? summary.weeklyFocus.slice(0, limit).map((task) => (
              <Link key={task.id} href={asRoute(`/app/tasks/${task.id}`)} className="flex items-start justify-between gap-3 px-3.5 py-3.5 transition hover:bg-violet-50/40">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{task.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{task.clientName} · {task.dueLabel} · {daysLeftLabel(task.daysLeft)}</p>
                </div>
                <StatusBadge value={task.status} className="shrink-0" />
              </Link>
            )) : <div className="px-4 py-6 text-sm text-slate-500">No hay tareas abiertas para mostrar en el foco semanal.</div>}
          </div>
        </div>
      ) : null}

      {activeTab === 'clientMomentum' ? (
        <div className="pt-3">
          <h3 className="text-lg font-semibold text-slate-900">Clientes con más movimiento</h3>
          <p className="mt-1 text-sm text-slate-500">Te ayuda a planificar llamadas, revisiones y seguimiento.</p>
          <div className="mt-3 divide-y divide-slate-200 rounded-[18px] border border-slate-200 bg-white">
            {summary.clientMomentum.length ? summary.clientMomentum.slice(0, limit).map((client) => (
              <Link key={client.id} href={asRoute(`/app/clients/${client.id}`)} className="flex items-start justify-between gap-3 px-3.5 py-3.5 transition hover:bg-violet-50/40">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{client.name}</p>
                  <p className="mt-1 text-sm text-slate-500">{client.upcomingItems} entregables cercanos · {client.openTasks} tareas · {client.openProjects} proyectos</p>
                </div>
                <StatusBadge value={client.status} className="shrink-0" />
              </Link>
            )) : <div className="px-4 py-6 text-sm text-slate-500">No hay clientes con actividad suficiente para resumir.</div>}
          </div>
        </div>
      ) : null}

      {activeTab === 'projectPipeline' ? (
        <div className="pt-3">
          <h3 className="text-lg font-semibold text-slate-900">Pipeline de proyectos</h3>
          <p className="mt-1 text-sm text-slate-500">Proyectos activos ordenados por cercanía y coordinación.</p>
          <div className="mt-3 divide-y divide-slate-200 rounded-[18px] border border-slate-200 bg-white">
            {summary.projectPipeline.length ? summary.projectPipeline.slice(0, limit).map((project) => (
              <Link key={project.id} href={asRoute(`/app/projects/${project.id}`)} className="flex items-start justify-between gap-3 px-3.5 py-3.5 transition hover:bg-violet-50/40">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{project.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{project.clientName} · {project.dueLabel} · {project.isCollaborative ? 'Colaborativo' : 'Solo'} </p>
                </div>
                <StatusBadge value={project.status} className="shrink-0" />
              </Link>
            )) : <div className="px-4 py-6 text-sm text-slate-500">No hay proyectos activos para mostrar en el pipeline.</div>}
          </div>
        </div>
      ) : null}

      {((activeTab === 'departmentCapacity' && summary.departmentCapacity.length > 5)
        || (activeTab === 'weeklyFocus' && summary.weeklyFocus.length > 5)
        || (activeTab === 'clientMomentum' && summary.clientMomentum.length > 5)
        || (activeTab === 'projectPipeline' && summary.projectPipeline.length > 5)) ? (
        <div className="mt-3 flex justify-end">
          <Button variant="secondary" onClick={() => setExpanded((current) => ({ ...current, [activeTab]: !current[activeTab] }))}>
            {expanded[activeTab] ? 'Ver menos' : 'Ver más'}
          </Button>
        </div>
      ) : null}
    </Card>
  );
}

export function PlanningCenter({ summary, compact = false }: { summary: PlanningOverview; compact?: boolean }) {
  const headlineCards = [
    { label: 'Esta semana', value: summary.kpis.dueThisWeek, icon: <CalendarClock className="h-4 w-4" /> },
    { label: 'Próxima semana', value: summary.kpis.dueNextWeek, icon: <Target className="h-4 w-4" /> },
    { label: 'Tareas vencidas', value: summary.kpis.overdueOpenTasks, icon: <ArrowUpRight className="h-4 w-4" /> },
    { label: 'Proyectos activos', value: summary.kpis.activeProjects, icon: <FolderKanban className="h-4 w-4" /> },
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
          <Link href={asRoute('/app/planning')}><Button>Ver centro de planificación</Button></Link>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-4">
          {headlineCards.map((card) => (
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
    <div className="space-y-3">
      <Card className="bg-[linear-gradient(135deg,#221b55_0%,#342d8d_58%,#151c4a_100%)] px-4 py-3.5 text-white shadow-[0_18px_42px_rgba(49,46,129,0.15)] md:px-5 md:py-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-200">Planning center</p>
            <h2 className="mt-2 text-[1.6rem] font-bold md:text-[2rem]">Tu ventana de capacidad de los próximos 14 días</h2>
            <p className="mt-1.5 text-sm text-violet-100/88">Esta vista te ayuda a prevenir sobrecarga, ordenar prioridades y detectar qué cliente o frente necesita atención primero.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[320px]">
            <div className="rounded-[18px] bg-white/10 px-3.5 py-2.5 ring-1 ring-white/10">
              <p className="text-xs uppercase tracking-[0.16em] text-violet-100/80">Clientes activos</p>
              <p className="mt-2 text-3xl font-bold">{summary.kpis.activeClients}</p>
            </div>
            <div className="rounded-[18px] bg-white/10 px-3.5 py-2.5 ring-1 ring-white/10">
              <p className="text-xs uppercase tracking-[0.16em] text-violet-100/80">Colaborativos</p>
              <p className="mt-2 text-3xl font-bold">{summary.kpis.collaborativeProjects}</p>
            </div>
          </div>
        </div>
      </Card>

      <RecommendationCarousel recommendations={summary.recommendations} />
      <PlanningModules summary={summary} />
    </div>
  );
}
