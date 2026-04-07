import Link from 'next/link';
import { Activity, ArrowUpRight, BarChart3, BrainCircuit, Clock3, Gauge, Radar, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { asRoute } from '@/lib/navigation/routes';
import type { AnalyticsTone, WorkspaceAnalyticsSummary } from '@/lib/queries/analytics';

const toneClasses: Record<AnalyticsTone, string> = {
  critical: 'bg-rose-50 text-rose-700 ring-1 ring-rose-100',
  attention: 'bg-amber-50 text-amber-700 ring-1 ring-amber-100',
  stable: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100',
};

function toneLabel(tone: AnalyticsTone) {
  return tone === 'critical' ? 'Crítico' : tone === 'attention' ? 'Atención' : 'Estable';
}

export function AnalyticsOverview({ summary, compact = false }: { summary: WorkspaceAnalyticsSummary; compact?: boolean }) {
  const topCards = [
    { label: 'Health score', value: `${summary.kpis.healthScore}%`, icon: Gauge },
    { label: 'Intelligence', value: `${summary.kpis.intelligenceScore}%`, icon: BrainCircuit },
    { label: 'Adopción', value: `${summary.kpis.adoptionScore}%`, icon: Activity },
    { label: 'Actividad 48h', value: `${summary.kpis.activityLast48h}`, icon: Clock3 },
  ];

  if (compact) {
    return (
      <Card className="border-slate-200 bg-[linear-gradient(135deg,#ffffff_0%,#f0fdf4_50%,#eff6ff_100%)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Analytics v4</p>
            <h3 className="mt-2 text-xl font-bold text-slate-900">Pulso del workspace</h3>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">Una lectura rápida de salud, adopción y carga operativa para decidir qué mover primero.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={asRoute('/app/analytics')}><Button>Ver analytics</Button></Link>
            <Link href={asRoute('/app/workspace-intelligence')}><Button variant="secondary">Abrir intelligence</Button></Link>
          </div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {topCards.map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-2xl border border-white/80 bg-white/80 px-4 py-3 shadow-sm">
              <div className="flex items-center justify-between gap-3 text-slate-500">
                <span className="text-sm">{label}</span>
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                  <Icon className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-3 text-2xl font-bold text-slate-900">{value}</p>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-[linear-gradient(135deg,#052e16_0%,#14532d_45%,#0f172a_100%)] text-white shadow-[0_24px_60px_rgba(15,23,42,0.2)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">FlowTask v4 · analytics center</p>
            <h1 className="mt-2 text-3xl font-bold">Escala con visibilidad real, no con intuición</h1>
            <p className="mt-2 text-sm text-emerald-50/90">
              {summary.organizationName} · actualizado {summary.generatedAtLabel}. Esta vista cruza salud operativa, adopción, riesgo y carga para ayudarte a crecer sin perder control.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[24px] bg-white/10 px-4 py-3 ring-1 ring-white/10">
              <p className="text-xs uppercase tracking-[0.16em] text-emerald-100/80">Health score</p>
              <p className="mt-2 text-3xl font-bold">{summary.kpis.healthScore}%</p>
            </div>
            <div className="rounded-[24px] bg-white/10 px-4 py-3 ring-1 ring-white/10">
              <p className="text-xs uppercase tracking-[0.16em] text-emerald-100/80">Intelligence score</p>
              <p className="mt-2 text-3xl font-bold">{summary.kpis.intelligenceScore}%</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {topCards.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="bg-gradient-to-br from-white to-emerald-50/50">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-slate-500">{label}</p>
                <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>
              </div>
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                <Icon className="h-5 w-5" />
              </span>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.02fr_0.98fr]">
        <Card>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Indicadores clave</h2>
              <p className="mt-1 text-sm text-slate-500">Lo mínimo que deberías revisar antes de abrir más trabajo.</p>
            </div>
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 ring-1 ring-slate-200">
              <Radar className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-5 space-y-3">
            {summary.highlights.map((item) => (
              <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${toneClasses[item.tone]}`}>{toneLabel(item.tone)}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{item.detail}</p>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Embudo operativo</h2>
              <p className="mt-1 text-sm text-slate-500">Volumen real del workspace para sostener escala sin saturarte.</p>
            </div>
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
              <BarChart3 className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <MetricCard label="Tareas activas" value={summary.pipeline.activeTasks} helper="Pendientes hoy" />
            <MetricCard label="Vencen esta semana" value={summary.pipeline.dueThisWeek} helper="Foco semanal" />
            <MetricCard label="En espera" value={summary.pipeline.waitingTasks} helper="Bloqueo actual" />
            <MetricCard label="Proyectos activos" value={summary.pipeline.activeProjects} helper="Carga total" />
            <MetricCard label="Clientes" value={summary.pipeline.clients} helper="Cartera visible" />
            <MetricCard label="Carga vencida" value={summary.pipeline.overdueLoad} helper="Acción inmediata" tone={summary.pipeline.overdueLoad > 0 ? 'critical' : 'stable'} />
          </div>
          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Actividad reciente</span>
              <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-700 ring-1 ring-slate-200">{summary.kpis.activityLast48h} eventos en 48h</span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <MetricChip label="Logins" value={summary.adoption.loginEvents} />
              <MetricChip label="Cambios en proyectos" value={summary.adoption.projectEvents} />
              <MetricChip label="Cambios en tareas" value={summary.adoption.taskEvents} />
              <MetricChip label="Eventos de soporte" value={summary.adoption.supportEvents} />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <Card>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Watchlist inteligente</h2>
              <p className="mt-1 text-sm text-slate-500">Clientes, proyectos y tareas que merecen seguimiento hoy.</p>
            </div>
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
              <Sparkles className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-5 space-y-3">
            {summary.watchlist.length ? summary.watchlist.map((item) => (
              <div key={`${item.source}-${item.title}-${item.meta}`} className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{item.source}</span>
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${toneClasses[item.tone]}`}>{toneLabel(item.tone)}</span>
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="mt-1 text-sm text-slate-500">{item.meta}</p>
              </div>
            )) : <EmptyState label="Todavía no hay elementos prioritarios para mostrar en esta vista." />}
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Siguiente movimiento</h2>
              <p className="mt-1 text-sm text-slate-500">Recomendaciones accionables para sostener escala y visibilidad.</p>
            </div>
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 ring-1 ring-slate-200">
              <ArrowUpRight className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-5 space-y-3">
            {summary.recommendations.map((item) => (
              <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">{item}</div>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href={asRoute('/app/reports')}><Button>Ver reportes</Button></Link>
            <Link href={asRoute('/app/workspace-intelligence')}><Button variant="secondary">Ver intelligence</Button></Link>
            <Link href={asRoute('/app/support')}><Button variant="secondary">Ir a soporte</Button></Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ label, value, helper, tone = 'stable' }: { label: string; value: number; helper: string; tone?: AnalyticsTone }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
        </div>
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${toneClasses[tone]}`}>{toneLabel(tone)}</span>
      </div>
      <p className="mt-2 text-xs text-slate-500">{helper}</p>
    </div>
  );
}

function MetricChip({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="mt-2 text-xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">{label}</div>;
}
