'use client';

import { useState, type ComponentType } from 'react';
import { ChevronDown, ListTodo, Workflow } from 'lucide-react';
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
  const heroCards = [
    { label: 'Pulso', value: `${summary.kpis.healthScore}%`, helper: 'Panorama general' },
    { label: 'Ritmo', value: `${summary.kpis.intelligenceScore}%`, helper: 'Seguimiento activo' },
    { label: 'Por vencer', value: String(summary.pipeline.dueThisWeek), helper: 'Esta semana' },
    { label: 'Vencidas', value: String(summary.pipeline.overdueLoad), helper: 'Piden atención' },
  ];

  if (compact) {
    return (
      <Card className="border-slate-200 bg-[linear-gradient(135deg,#ffffff_0%,#f8fafc_55%,#eef6ff_100%)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">Analytics v4.4</p>
            <h3 className="mt-2 text-xl font-bold text-slate-900">Pulso del workspace</h3>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">Una lectura corta para priorizar, revisar proyectos activos y dejar listo un reporte para compartir.</p>
          </div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {heroCards.map(({ label, value, helper }) => (
            <div key={label} className="rounded-2xl border border-white/80 bg-white/90 px-4 py-3 shadow-sm">
              <span className="text-sm text-slate-500">{label}</span>
              <p className="mt-3 text-2xl font-bold text-slate-900">{value}</p>
              <p className="mt-1 text-xs text-slate-500">{helper}</p>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-[linear-gradient(135deg,#052e2b_0%,#0b3954_42%,#0f172a_100%)] text-white shadow-[0_24px_60px_rgba(8,47,73,0.2)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100/80">FlowTask v4.4 · analytics center</p>
            <h1 className="mt-2 text-3xl font-bold leading-[1.08] sm:text-[2.45rem] lg:max-w-3xl">Tu semana clara para priorizar, compartir y anticipar movimiento</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-100/90 sm:text-base">
              {summary.organizationName} · actualizado {summary.generatedAtLabel}. Aquí se concentra lo que merece seguimiento ejecutivo sin llenar la vista de métricas repetidas.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[320px] xl:min-w-[360px]">
            {heroCards.map(({ label, value, helper }) => (
              <HeroMetric key={label} label={label} value={value} helper={helper} />
            ))}
          </div>
        </div>
      </Card>

      <div className="grid items-start gap-4 xl:grid-cols-[1fr_1fr]">
        <ExpandableFeedCard
          title="Foco de la semana"
          subtitle="Tres tareas visibles para mantener la vista ligera. Si necesitas más, despliegas el resto con un click."
          icon={ListTodo}
          items={summary.weeklyFocus}
          emptyLabel="No hay tareas prioritarias para mostrar ahora."
          expandLabel="Ver más tareas"
          collapseLabel="Ver menos tareas"
        />
        <ExpandableFeedCard
          title="Pipeline de proyectos"
          subtitle="Los tres proyectos más relevantes quedan al frente y el resto se abre solo cuando lo necesitas."
          icon={Workflow}
          items={summary.projectPipeline}
          emptyLabel="No hay proyectos activos para este pipeline."
          expandLabel="Ver más proyectos"
          collapseLabel="Ver menos proyectos"
        />
      </div>

      <ShareCenterCard summary={summary} />
    </div>
  );
}

function HeroMetric({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <div className="rounded-[22px] bg-white/10 px-4 py-3 ring-1 ring-white/10 backdrop-blur-sm">
      <p className="text-[11px] uppercase tracking-[0.16em] text-cyan-100/80">{label}</p>
      <p className="mt-2 text-2xl font-bold leading-none text-white sm:text-[1.8rem]">{value}</p>
      <p className="mt-1 text-xs text-slate-200/80">{helper}</p>
    </div>
  );
}

function ExpandableFeedCard({
  title,
  subtitle,
  icon: Icon,
  items,
  emptyLabel,
  expandLabel,
  collapseLabel,
}: {
  title: string;
  subtitle: string;
  icon: ComponentType<{ className?: string }>;
  items: AnalyticsFeedItem[];
  emptyLabel: string;
  expandLabel: string;
  collapseLabel: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const visibleItems = expanded ? items : items.slice(0, 3);

  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>
        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700 ring-1 ring-cyan-100">
          <Icon className="h-5 w-5" />
        </span>
      </div>

      <div className="mt-5 space-y-3">
        {visibleItems.length ? visibleItems.map((item) => (
          <div key={`${item.source}-${item.id}`} className="rounded-2xl border border-slate-200 bg-white px-4 py-4 transition hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-[0_12px_26px_rgba(15,23,42,0.08)]">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">{item.source}</span>
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${toneClasses[item.tone]}`}>{toneLabel(item.tone)}</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{item.statusLabel}</span>
            </div>
            <p className="mt-3 line-clamp-2 text-base font-semibold leading-snug text-slate-900">{item.title}</p>
            <p className="mt-1 text-sm text-slate-500">{item.meta}</p>
          </div>
        )) : <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">{emptyLabel}</div>}
      </div>

      {items.length > 3 ? (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-cyan-200 hover:text-cyan-700"
          >
            <ChevronDown className={`h-4 w-4 transition ${expanded ? 'rotate-180' : ''}`} />
            {expanded ? collapseLabel : expandLabel}
          </button>
        </div>
      ) : null}
    </Card>
  );
}
