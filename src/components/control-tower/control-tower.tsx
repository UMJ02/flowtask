import Link from 'next/link';
import { Activity, AlertTriangle, ArrowUpRight, FolderKanban, Radar, Users2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import type { ControlTowerSummary } from '@/lib/queries/control-tower';

const laneToneClasses: Record<ControlTowerSummary['executionLanes'][number]['tone'], string> = {
  critical: 'bg-rose-50 text-rose-700 ring-1 ring-rose-100',
  focus: 'bg-amber-50 text-amber-700 ring-1 ring-amber-100',
  stable: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100',
};

export function ControlTower({ summary, compact = false }: { summary: ControlTowerSummary; compact?: boolean }) {
  const cards = [
    { label: 'Tareas activas', value: summary.kpis.activeTasks, icon: <Activity className="h-5 w-5" /> },
    { label: 'Proyectos activos', value: summary.kpis.activeProjects, icon: <FolderKanban className="h-5 w-5" /> },
    { label: 'Tareas vencidas', value: summary.kpis.overdueTasks, icon: <AlertTriangle className="h-5 w-5" /> },
    { label: 'Señales recientes', value: summary.kpis.activityEvents, icon: <Radar className="h-5 w-5" /> },
  ];

  if (compact) {
    return (
      <Card>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">Control tower</p>
            <h3 className="mt-2 text-xl font-bold text-slate-900">Centro de control operativo</h3>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">Unifica foco inmediato, señales por cliente y lectura rápida de ejecución.</p>
          </div>
          <Link href="/app/control-tower"><Button>Ver centro de control</Button></Link>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-4">
          {cards.map((card) => (
            <div key={card.label} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="flex items-center justify-between gap-3 text-slate-500">
                <span className="text-sm">{card.label}</span>
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-white text-cyan-700 ring-1 ring-slate-200">{card.icon}</span>
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
          <Card key={card.label} className="bg-gradient-to-br from-white to-cyan-50/50">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-slate-500">{card.label}</p>
                <p className="mt-3 text-3xl font-bold text-slate-900">{card.value}</p>
              </div>
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700 ring-1 ring-cyan-100">
                {card.icon}
              </span>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="bg-[linear-gradient(135deg,#083344_0%,#0f172a_55%,#0f172a_100%)] text-white shadow-[0_24px_60px_rgba(8,51,68,0.24)]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">Execution view</p>
              <h2 className="mt-2 text-3xl font-bold">La cabina central para decidir qué mover primero</h2>
              <p className="mt-2 text-sm text-cyan-100/90">Te junta foco inmediato, clientes con más presión y una lectura operativa antes de entrar a tareas, proyectos o reportes.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[26px] bg-white/10 px-4 py-3 ring-1 ring-white/10">
                <p className="text-xs uppercase tracking-[0.16em] text-cyan-100/80">Clientes activos</p>
                <p className="mt-2 text-3xl font-bold">{summary.kpis.activeClients}</p>
              </div>
              <div className="rounded-[26px] bg-white/10 px-4 py-3 ring-1 ring-white/10">
                <p className="text-xs uppercase tracking-[0.16em] text-cyan-100/80">Proyectos en riesgo</p>
                <p className="mt-2 text-3xl font-bold">{summary.kpis.atRiskProjects}</p>
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
            <Link href="/app/reports/print?type=control" target="_blank"><Button>Control PDF</Button></Link>
            <Link href="/app/tasks"><Button variant="secondary">Ir a tareas</Button></Link>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Carriles de ejecución</h3>
              <p className="mt-1 text-sm text-slate-500">Cómo se ve la presión operativa ahora mismo.</p>
            </div>
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700 ring-1 ring-cyan-100">
              <Radar className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-5 space-y-3">
            {summary.executionLanes.map((lane) => (
              <div key={lane.label} className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{lane.label}</p>
                    <p className="mt-1 text-sm text-slate-500">{lane.count} elemento(s)</p>
                  </div>
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${laneToneClasses[lane.tone]}`}>{lane.tone === 'critical' ? 'Crítico' : lane.tone === 'focus' ? 'En foco' : 'Estable'}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Foco inmediato</h3>
              <p className="mt-1 text-sm text-slate-500">Tareas y proyectos que merecen atención antes de cambiar de contexto.</p>
            </div>
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 ring-1 ring-amber-100">
              <AlertTriangle className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-5 space-y-3">
            {summary.focusNow.length ? summary.focusNow.map((item) => (
              <Link key={`${item.type}-${item.id}`} href={item.type === 'task' ? `/app/tasks/${item.id}` : `/app/projects/${item.id}`} className="block rounded-2xl border border-slate-200 bg-white px-4 py-4 transition hover:border-cyan-200 hover:bg-cyan-50/40">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                      <StatusBadge value={item.status} />
                    </div>
                    <p className="mt-1 text-sm text-slate-500">{item.clientName} · {item.dueLabel}</p>
                  </div>
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${item.urgency === 'critical' ? laneToneClasses.critical : item.urgency === 'focus' ? laneToneClasses.focus : laneToneClasses.stable}`}>{item.type === 'task' ? 'Tarea' : 'Proyecto'}</span>
                </div>
              </Link>
            )) : <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-6 text-sm text-slate-500">No hay elementos urgentes por mostrar en este momento.</div>}
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Señales por cliente</h3>
            <p className="mt-1 text-sm text-slate-500">Qué clientes concentran más movimiento cercano.</p>
          </div>
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
            <Users2 className="h-5 w-5" />
          </span>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {summary.clientSignals.length ? summary.clientSignals.map((client) => (
            <Link key={client.id} href={`/app/clients/${client.id}`} className="block rounded-2xl border border-slate-200 bg-white px-4 py-4 transition hover:border-cyan-200 hover:bg-cyan-50/40">
              <p className="text-sm font-semibold text-slate-900">{client.name}</p>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
                <div className="rounded-2xl bg-slate-50 px-3 py-2">
                  <p className="text-xs text-slate-500">Tareas</p>
                  <p className="mt-1 font-bold text-slate-900">{client.openTasks}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-3 py-2">
                  <p className="text-xs text-slate-500">Proyectos</p>
                  <p className="mt-1 font-bold text-slate-900">{client.activeProjects}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-3 py-2">
                  <p className="text-xs text-slate-500">Cercanos</p>
                  <p className="mt-1 font-bold text-slate-900">{client.nearTermItems}</p>
                </div>
              </div>
              <div className="mt-3"><StatusBadge value={client.status} /></div>
            </Link>
          )) : <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-6 text-sm text-slate-500">Todavía no hay clientes con movimiento suficiente para resumir.</div>}
        </div>
      </Card>
    </div>
  );
}
