import Link from 'next/link';
import { AlertTriangle, ArrowRight, BriefcaseBusiness, CalendarClock, CircleDashed, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { WorkspaceFloatingActions } from '@/components/workspace/floating-actions';
import { asRoute, projectListRoute, taskListRoute } from '@/lib/navigation/routes';

function metricTone(value: number, variant: 'danger' | 'warning' | 'neutral' = 'neutral') {
  if (variant === 'danger') return value > 0 ? 'text-rose-700 bg-rose-50 ring-rose-100' : 'text-slate-700 bg-slate-50 ring-slate-100';
  if (variant === 'warning') return value > 0 ? 'text-amber-700 bg-amber-50 ring-amber-100' : 'text-slate-700 bg-slate-50 ring-slate-100';
  return 'text-emerald-700 bg-emerald-50 ring-emerald-100';
}

export function DashboardHero({
  activeTasks,
  waitingTasks,
  overdueTasks,
  dueSoonTasks,
  activeProjects,
}: {
  activeTasks: number;
  waitingTasks: number;
  overdueTasks: number;
  dueSoonTasks: number;
  activeProjects: number;
}) {
  const focusLabel = overdueTasks > 0
    ? 'Tu foco inmediato está en resolver vencimientos y destrabar pendientes críticos.'
    : dueSoonTasks > 0
      ? 'Tienes entregas cercanas que conviene anticipar hoy para proteger la operación.'
      : 'Tu operación se ve estable; este es buen momento para avanzar en trabajo profundo.';

  const metrics = [
    {
      label: 'Pendientes en espera',
      value: waitingTasks,
      helper: 'requieren seguimiento',
      icon: CircleDashed,
      tone: metricTone(waitingTasks, 'warning'),
      href: taskListRoute('status=en_espera&view=list'),
    },
    {
      label: 'Vencidas',
      value: overdueTasks,
      helper: 'prioridad máxima',
      icon: AlertTriangle,
      tone: metricTone(overdueTasks, 'danger'),
      href: taskListRoute('due=overdue&view=list'),
    },
    {
      label: 'Próximas por vencer',
      value: dueSoonTasks,
      helper: 'siguiente ventana',
      icon: CalendarClock,
      tone: metricTone(dueSoonTasks, 'warning'),
      href: taskListRoute('due=soon&view=list'),
    },
    {
      label: 'Proyectos activos',
      value: activeProjects,
      helper: 'frentes abiertos',
      icon: BriefcaseBusiness,
      tone: metricTone(activeProjects),
      href: projectListRoute('status=activo'),
    },
  ];

  return (
    <Card className="rounded-[32px] border border-slate-200/80 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.16),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.10),_transparent_22%),linear-gradient(135deg,rgba(255,255,255,0.98),rgba(248,250,252,0.98))] p-5 shadow-[0_20px_46px_rgba(15,23,42,0.08)] md:p-7">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(360px,0.9fr)] xl:items-start">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/[0.85] px-3 py-1 text-xs font-semibold tracking-[0.16em] text-emerald-700 ring-1 ring-emerald-100">
            <Sparkles className="h-3.5 w-3.5" />
            Workspace overview
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Tu jornada arranca con {activeTasks} tareas activas y {activeProjects} proyectos en movimiento.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 md:text-[15px]">
            {focusLabel} Revisa la pizarra, prioriza lo que bloquea al equipo y entra directo a ejecución sin perder contexto.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3 lg:flex-nowrap">
            <Link
              href={asRoute('/app/board')}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-900"
            >
              Abrir pizarra
              <ArrowRight className="h-4 w-4" />
            </Link>
            <WorkspaceFloatingActions />
            <Link
              href={asRoute('/app/planning')}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-emerald-200 hover:text-emerald-700"
            >
              Revisar planificación
            </Link>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <Link
                key={metric.label}
                href={metric.href}
                className="group relative overflow-hidden rounded-[24px] border border-white/70 bg-white/[0.90] p-4 shadow-[0_12px_26px_rgba(15,23,42,0.05)] ring-1 ring-slate-100 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(236,253,245,0.98))] hover:shadow-[0_18px_34px_rgba(15,23,42,0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200"
              >
                <span className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400/0 via-emerald-400/80 to-cyan-400/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 transition duration-300 group-hover:text-emerald-900">{metric.label}</p>
                    <p className="mt-1 text-xs text-slate-500 transition duration-300 group-hover:text-slate-600">{metric.helper}</p>
                  </div>
                  <span className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ring-1 transition duration-300 group-hover:scale-105 group-hover:rotate-3 ${metric.tone}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                </div>
                <div className="mt-5 flex items-end justify-between gap-3">
                  <p className="text-4xl font-bold tracking-tight text-slate-900 transition duration-300 group-hover:text-emerald-950">{metric.value}</p>
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition duration-300 group-hover:border-emerald-200 group-hover:bg-emerald-50 group-hover:text-emerald-700">
                    <ArrowRight className="h-4 w-4 transition duration-300 group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
