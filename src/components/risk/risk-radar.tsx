import Link from 'next/link';
import { AlertTriangle, ArrowUpRight, ShieldAlert, Users2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { asRoute } from '@/lib/navigation/routes';
import type { RiskRadarSummary } from '@/lib/queries/risk-radar';

const toneClasses: Record<'critical' | 'attention' | 'stable', string> = {
  critical: 'bg-rose-50 text-rose-700 ring-1 ring-rose-100',
  attention: 'bg-amber-50 text-amber-700 ring-1 ring-amber-100',
  stable: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100',
};

const toneLabels: Record<'critical' | 'attention' | 'stable', string> = {
  critical: 'Crítico',
  attention: 'Atención',
  stable: 'Estable',
};

export function RiskRadar({ summary, compact = false }: { summary: RiskRadarSummary; compact?: boolean }) {
  const cards = [
    { label: 'Risk score', value: `${summary.kpis.riskScore}%`, icon: <ShieldAlert className="h-5 w-5" /> },
    { label: 'Tareas vencidas', value: summary.kpis.overdueTasks, icon: <AlertTriangle className="h-5 w-5" /> },
    { label: 'Proyectos vencidos', value: summary.kpis.overdueProjects, icon: <ArrowUpRight className="h-5 w-5" /> },
    { label: 'Clientes en presión', value: summary.kpis.pressuredClients, icon: <Users2 className="h-5 w-5" /> },
  ];

  if (compact) {
    return (
      <Card>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">Risk radar</p>
            <h3 className="mt-2 text-xl font-bold text-slate-900">Riesgo operativo del workspace</h3>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">Prioriza lo vencido, lo bloqueado y los clientes con más presión sin salir del dashboard.</p>
          </div>
          <Link href={asRoute("/app/risk-radar")}><Button>Ver risk radar</Button></Link>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-4">
          {cards.map((card) => (
            <div key={card.label} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="flex items-center justify-between gap-3 text-slate-500">
                <span className="text-sm">{card.label}</span>
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-white text-rose-700 ring-1 ring-slate-200">{card.icon}</span>
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
          <Card key={card.label} className="bg-gradient-to-br from-white to-rose-50/50">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-slate-500">{card.label}</p>
                <p className="mt-3 text-3xl font-bold text-slate-900">{card.value}</p>
              </div>
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-700 ring-1 ring-rose-100">{card.icon}</span>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
        <Card className="bg-[linear-gradient(135deg,#4c0519_0%,#0f172a_60%,#0f172a_100%)] text-white shadow-[0_24px_60px_rgba(76,5,25,0.28)]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-200">Operational exposure</p>
              <h2 className="mt-2 text-3xl font-bold">Una vista directa del riesgo que sí puede detener la operación</h2>
              <p className="mt-2 text-sm text-rose-100/90">Combina vencimientos, espera, presión por cliente y carga por departamento para decidir dónde intervenir primero.</p>
            </div>
            <div className="rounded-[26px] bg-white/10 px-4 py-3 ring-1 ring-white/10">
              <p className="text-xs uppercase tracking-[0.16em] text-rose-100/80">Riesgo global</p>
              <p className="mt-2 text-4xl font-bold">{summary.kpis.riskScore}%</p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {summary.riskBuckets.map((bucket) => (
              <div key={bucket.label} className="rounded-[24px] bg-white/10 px-4 py-3 ring-1 ring-white/10">
                <p className="text-xs uppercase tracking-[0.16em] text-rose-100/80">{bucket.label}</p>
                <p className="mt-2 text-3xl font-bold">{bucket.count}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Recomendaciones</p>
              <h3 className="mt-2 text-xl font-bold text-slate-900">Qué atacar primero</h3>
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
            <Link href={asRoute("/app/reports/print?type=risk")} target="_blank"><Button>Risk PDF</Button></Link>
            <Link href={asRoute("/app/control-tower")}><Button variant="secondary">Ir a control tower</Button></Link>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Hotspots por departamento</h3>
              <p className="mt-1 text-sm text-slate-500">Dónde se concentra la presión de fechas y carga activa.</p>
            </div>
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-700 ring-1 ring-rose-100">
              <ShieldAlert className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-5 space-y-3">
            {summary.hotspots.map((item) => (
              <div key={item.name} className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.openTasks} tarea(s) · {item.activeProjects} proyecto(s)</p>
                  </div>
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${toneClasses[item.tone]}`}>{toneLabels[item.tone]}</span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-slate-100">
                  <div className={`h-2 rounded-full ${item.tone === 'critical' ? 'bg-rose-500' : item.tone === 'attention' ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, Math.max(12, item.nearTermItems * 12))}%` }} />
                </div>
                <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-500">{item.nearTermItems} item(s) de corto plazo</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Proyectos en watchlist</h3>
              <p className="mt-1 text-sm text-slate-500">Los que tienen más probabilidad de pedir intervención rápida.</p>
            </div>
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 ring-1 ring-amber-100">
              <AlertTriangle className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-5 space-y-3">
            {summary.projectRisks.length ? summary.projectRisks.map((item) => (
              <Link key={item.id} href={asRoute(`/app/projects/${item.id}`)} className="block rounded-2xl border border-slate-200 bg-white px-4 py-4 transition hover:border-rose-200 hover:bg-rose-50/40">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                      <StatusBadge value={item.status} />
                    </div>
                    <p className="mt-1 text-sm text-slate-500">{item.clientName} · {item.dueLabel}</p>
                  </div>
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${toneClasses[item.urgency]}`}>{toneLabels[item.urgency]}</span>
                </div>
              </Link>
            )) : <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-6 text-sm text-slate-500">No hay proyectos suficientes para armar un watchlist ahora mismo.</div>}
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Clientes con presión operativa</h3>
            <p className="mt-1 text-sm text-slate-500">Clientes con más carga combinada entre tareas y proyectos activos.</p>
          </div>
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
            <Users2 className="h-5 w-5" />
          </span>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {summary.clientRisks.length ? summary.clientRisks.map((client) => (
            <Link key={client.id} href={asRoute(`/app/clients/${client.id}`)} className="block rounded-2xl border border-slate-200 bg-white px-4 py-4 transition hover:border-rose-200 hover:bg-rose-50/40">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-900">{client.name}</p>
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${toneClasses[client.tone]}`}>{toneLabels[client.tone]}</span>
              </div>
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
                  <p className="text-xs text-slate-500">Presión</p>
                  <p className="mt-1 font-bold text-slate-900">{client.pressure}</p>
                </div>
              </div>
              <div className="mt-3"><StatusBadge value={client.status} /></div>
            </Link>
          )) : <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-6 text-sm text-slate-500">Todavía no hay clientes con carga suficiente para marcar presión operativa.</div>}
        </div>
      </Card>
    </div>
  );
}
