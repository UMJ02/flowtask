import type { ComponentType } from 'react';
import { Activity, BarChart3, BrainCircuit, Clock3, Gauge, ListTodo, Workflow } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ShareCenterCard } from '@/components/analytics/share-center-card';
import type { AnalyticsFeedItem, AnalyticsTone, WorkspaceAnalyticsSummary } from '@/lib/queries/analytics';

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
      <Card className="border-slate-200 bg-[linear-gradient(135deg,#ffffff_0%,#f8fafc_55%,#eef2ff_100%)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">Analytics v4.2</p>
            <h3 className="mt-2 text-xl font-bold text-slate-900">Pulso del workspace</h3>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">Una lectura rápida de salud, deadlines y foco semanal para sostener visibilidad sin saturar la vista.</p>
          </div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {topCards.map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-2xl border border-white/80 bg-white/90 px-4 py-3 shadow-sm">
              <div className="flex items-center justify-between gap-3 text-slate-500">
                <span className="text-sm">{label}</span>
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-violet-50 text-violet-700 ring-1 ring-violet-100">
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
      <Card className="bg-[linear-gradient(135deg,#1e1b4b_0%,#6d28d9_48%,#0f172a_100%)] text-white shadow-[0_24px_60px_rgba(76,29,149,0.22)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-100/80">FlowTask v4.2 · analytics center</p>
            <h1 className="mt-2 text-3xl font-bold leading-tight sm:text-[2rem]">Escala con visibilidad ejecutiva y un share center listo para jefatura</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-violet-50/90">
              {summary.organizationName} · actualizado {summary.generatedAtLabel}. Todo queda resumido en foco semanal, pipeline de proyectos y una landing pública para compartir sin login.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[280px]">
            <HeroMetric label="Health score" value={`${summary.kpis.healthScore}%`} />
            <HeroMetric label="Intelligence" value={`${summary.kpis.intelligenceScore}%`} />
            <HeroMetric label="Deadlines semana" value={String(summary.pipeline.dueThisWeek)} />
            <HeroMetric label="Carga vencida" value={String(summary.pipeline.overdueLoad)} />
          </div>
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <ScrollableFeedCard
          title="Foco de la semana"
          subtitle="Tareas con prioridad y fechas visibles. El bloque mantiene la vista compacta con scroll interno."
          icon={ListTodo}
          items={summary.weeklyFocus}
          emptyLabel="No hay tareas prioritarias para mostrar ahora."
        />
        <ScrollableFeedCard
          title="Pipeline de proyectos"
          subtitle="Solo tres ítems visibles a la vez para evitar una columna larga y pesada."
          icon={Workflow}
          items={summary.projectPipeline}
          emptyLabel="No hay proyectos activos para este pipeline."
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Resumen ejecutivo</h2>
              <p className="mt-1 text-sm text-slate-500">Lectura corta del estado operativo para usar dentro de la app sin ensuciar analytics con más métricas.</p>
            </div>
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 ring-1 ring-slate-200">
              <BarChart3 className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricTile label="Prioritarios" value={summary.shareDigest.priorityCount} helper="Lista ejecutiva" tone="attention" />
            <MetricTile label="En proceso" value={summary.shareDigest.inProgressCount} helper="Movimiento activo" />
            <MetricTile label="En espera" value={summary.shareDigest.waitingCount} helper="Requiere destrabe" tone={summary.shareDigest.waitingCount > 0 ? 'attention' : 'stable'} />
            <MetricTile label="Concluidos" value={summary.shareDigest.completedCount} helper="Entrega visible" />
          </div>
          <div className="mt-5 space-y-3">
            {summary.recommendations.map((item) => (
              <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">{item}</div>
            ))}
          </div>
        </Card>
        <ShareCenterCard summary={summary} />
      </div>
    </div>
  );
}

function HeroMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] bg-white/10 px-4 py-3 ring-1 ring-white/10">
      <p className="text-[11px] uppercase tracking-[0.16em] text-violet-100/80">{label}</p>
      <p className="mt-2 text-2xl font-bold leading-none text-white sm:text-[1.85rem]">{value}</p>
    </div>
  );
}

function ScrollableFeedCard({
  title,
  subtitle,
  icon: Icon,
  items,
  emptyLabel,
}: {
  title: string;
  subtitle: string;
  icon: ComponentType<{ className?: string }>
  items: AnalyticsFeedItem[];
  emptyLabel: string;
}) {
  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-700 ring-1 ring-violet-100">
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <div className="mt-5 max-h-[292px] space-y-3 overflow-y-auto pr-2">
        {items.length ? items.map((item) => (
          <div key={`${item.source}-${item.id}`} className="rounded-2xl border border-slate-200 bg-white px-4 py-4 transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-[0_12px_26px_rgba(15,23,42,0.08)]">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">{item.source}</span>
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${toneClasses[item.tone]}`}>{toneLabel(item.tone)}</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{item.statusLabel}</span>
            </div>
            <p className="mt-3 text-sm font-semibold text-slate-900">{item.title}</p>
            <p className="mt-1 text-sm text-slate-500">{item.meta}</p>
          </div>
        )) : <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">{emptyLabel}</div>}
      </div>
    </Card>
  );
}

function MetricTile({ label, value, helper, tone = 'stable' }: { label: string; value: number; helper: string; tone?: AnalyticsTone }) {
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
