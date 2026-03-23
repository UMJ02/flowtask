import Link from 'next/link';
import { Activity, AlertTriangle, ArrowUpRight, BriefcaseBusiness, CalendarClock, CheckCircle2, FileText, UsersRound } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import type { ReportsOverview } from '@/lib/queries/reports';

const urgencyStyles: Record<'overdue' | 'today' | 'planned', string> = {
  overdue: 'bg-rose-50 text-rose-700 ring-1 ring-rose-100',
  today: 'bg-amber-50 text-amber-700 ring-1 ring-amber-100',
  planned: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
};

const urgencyLabels: Record<'overdue' | 'today' | 'planned', string> = {
  overdue: 'Vencida',
  today: 'Hoy',
  planned: 'Planificada',
};

export function OperationsOverview({ summary }: { summary: ReportsOverview }) {
  const cards = [
    { label: 'Tareas activas', value: summary.kpis.activeTasks, icon: <Activity className="h-5 w-5" /> },
    { label: 'Vencidas', value: summary.kpis.overdueTasks, icon: <AlertTriangle className="h-5 w-5" /> },
    { label: 'Para hoy', value: summary.kpis.dueToday, icon: <CalendarClock className="h-5 w-5" /> },
    { label: 'Clientes activos', value: summary.kpis.clients, icon: <UsersRound className="h-5 w-5" /> },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label} className="bg-gradient-to-br from-white to-slate-50/70">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-slate-500">{card.label}</p>
                <p className="mt-3 text-3xl font-bold text-slate-900">{card.value}</p>
              </div>
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                {card.icon}
              </span>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="bg-[linear-gradient(135deg,#0f172a_0%,#111827_55%,#1e293b_100%)] text-white shadow-[0_24px_60px_rgba(15,23,42,0.22)]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">Operations center</p>
              <h2 className="mt-2 text-3xl font-bold">Tu lectura ejecutiva del workspace</h2>
              <p className="mt-2 text-sm text-slate-300">Con esta vista puedes decidir rápido qué atender, qué imprimir y qué bloque necesita seguimiento con el equipo.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[26px] bg-white/10 px-4 py-3 ring-1 ring-white/10">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-300">Ritmo de cierre</p>
                <p className="mt-2 text-3xl font-bold">{summary.kpis.completionRate}%</p>
                <p className="mt-1 text-sm text-slate-300">Tareas cerradas sobre el total registrado.</p>
              </div>
              <div className="rounded-[26px] bg-white/10 px-4 py-3 ring-1 ring-white/10">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-300">Proyectos activos</p>
                <p className="mt-2 text-3xl font-bold">{summary.kpis.activeProjects}</p>
                <p className="mt-1 text-sm text-slate-300">Carga operativa vigente en el workspace.</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Acciones rápidas</p>
              <h3 className="mt-2 text-xl font-bold text-slate-900">Salida de reporte</h3>
              <p className="mt-2 text-sm text-slate-500">Exporta y comparte el estado del equipo sin salir del módulo.</p>
            </div>
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 ring-1 ring-slate-200">
              <FileText className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-5 grid gap-3">
            <Link href="/app/reports/print?type=summary" target="_blank"><Button className="w-full justify-between">Resumen para PDF <ArrowUpRight className="h-4 w-4" /></Button></Link>
            <Link href="/app/reports/print?type=projects" target="_blank"><Button variant="secondary" className="w-full justify-between">Proyectos para PDF <ArrowUpRight className="h-4 w-4" /></Button></Link>
            <Link href="/app/reports/print?type=operations" target="_blank"><Button variant="secondary" className="w-full justify-between">Operación para PDF <ArrowUpRight className="h-4 w-4" /></Button></Link>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Distribución por estado</h3>
              <p className="mt-1 text-sm text-slate-500">Lectura rápida de tareas y proyectos.</p>
            </div>
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
              <BriefcaseBusiness className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Tareas</p>
              {summary.taskStatus.length ? summary.taskStatus.map((item) => (
                <div key={`task-${item.value}`} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <StatusBadge value={item.value} />
                  <span className="text-sm font-semibold text-slate-900">{item.count}</span>
                </div>
              )) : <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-6 text-sm text-slate-500">Todavía no hay tareas para resumir.</div>}
            </div>
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Proyectos</p>
              {summary.projectStatus.length ? summary.projectStatus.map((item) => (
                <div key={`project-${item.value}`} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <StatusBadge value={item.value} />
                  <span className="text-sm font-semibold text-slate-900">{item.count}</span>
                </div>
              )) : <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-6 text-sm text-slate-500">Todavía no hay proyectos para resumir.</div>}
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Radar de atención</h3>
              <p className="mt-1 text-sm text-slate-500">Clientes y tareas que piden revisión primero.</p>
            </div>
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 ring-1 ring-amber-100">
              <CheckCircle2 className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Clientes con más carga</p>
              {summary.attentionClients.length ? summary.attentionClients.map((client) => (
                <Link key={client.id} href={`/app/clients/${client.id}`} className="block rounded-2xl border border-slate-200 bg-white px-4 py-3 transition hover:border-emerald-200 hover:bg-emerald-50/40">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{client.name}</p>
                      <p className="mt-1 text-sm text-slate-500">{client.openTasks} tareas abiertas · {client.openProjects} proyectos activos</p>
                    </div>
                    <StatusBadge value={client.status} className="shrink-0" />
                  </div>
                </Link>
              )) : <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-6 text-sm text-slate-500">No hay clientes con carga visible todavía.</div>}
            </div>
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Tareas foco</p>
              {summary.focusTasks.length ? summary.focusTasks.map((task) => (
                <Link key={task.id} href={`/app/tasks/${task.id}`} className="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition hover:border-emerald-200 hover:bg-emerald-50/40">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{task.title}</p>
                      <p className="mt-1 text-sm text-slate-500">{task.clientName} · {task.dueLabel}</p>
                    </div>
                    <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] ${urgencyStyles[task.urgency]}`}>
                      {urgencyLabels[task.urgency]}
                    </span>
                  </div>
                </Link>
              )) : <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-6 text-sm text-slate-500">No hay tareas foco en este momento.</div>}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
