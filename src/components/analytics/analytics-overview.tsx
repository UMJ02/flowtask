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
    { label: 'Pulso', value: `${summary.kpis.healthScore}%`, helper: 'panorama general', tone: 'sky' },
    { label: 'Ritmo', value: `${summary.kpis.intelligenceScore}%`, helper: 'seguimiento activo', tone: 'violet' },
    { label: 'En espera', value: String(summary.shareDigest.waitingCount), helper: 'tareas trabadas', tone: 'amber' },
    { label: 'En proceso', value: String(summary.shareDigest.inProgressCount), helper: 'trabajo en curso', tone: 'emerald' },
  ] as const;

  if (compact) {
    return (
      <Card className="border-slate-200 bg-[linear-gradient(135deg,#ffffff_0%,#f8fafc_55%,#eef6ff_100%)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">Analytics v4.4</p>
            <h3 className="mt-2 text-xl font-bold text-slate-900">Lectura rápida del workspace</h3>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">Una lectura corta para priorizar, revisar proyectos activos y dejar listo un reporte para compartir.</p>
          </div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {heroCards.map(({ label, value, helper, tone }) => (
            <div
              key={label}
              className={[
                'rounded-2xl border px-4 py-3 shadow-sm',
                tone === 'sky' && 'border-sky-100 bg-sky-50/80',
                tone === 'violet' && 'border-violet-100 bg-violet-50/80',
                tone === 'amber' && 'border-amber-100 bg-amber-50/85',
                tone === 'emerald' && 'border-emerald-100 bg-emerald-50/85',
              ].filter(Boolean).join(' ')}
            >
              <span className="text-sm text-slate-600">{label}</span>
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
      <Card className="border-cyan-200/70 bg-[linear-gradient(135deg,rgba(5,46,43,0.98)_0%,rgba(11,57,84,0.97)_44%,rgba(15,23,42,0.98)_100%)] px-5 py-5 text-white shadow-[0_22px_50px_rgba(8,47,73,0.18)] md:px-6 md:py-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100/80">FlowTask v4.4 · analytics center</p>
            <h1 className="mt-2 text-[1.95rem] font-bold leading-[1.08] sm:text-[2.15rem] lg:max-w-3xl">Un resumen claro para priorizar sin llenar la vista</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-100/90 sm:text-[15px]">
              {summary.organizationName} · actualizado {summary.generatedAtLabel}. Aquí ves el ritmo del workspace, lo que sigue en espera y el volumen que hoy está en movimiento.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[320px] xl:min-w-[360px]">
            {heroCards.map(({ label, value, helper, tone }) => (
              <HeroMetric key={label} label={label} value={value} helper={helper} tone={tone} />
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

function HeroMetric({ label, value, helper, tone }: { label: string; value: string; helper: string; tone: 'sky' | 'violet' | 'amber' | 'emerald' }) {
  const theme = tone === 'sky'
    ? 'border-sky-200/25 bg-white/10 text-cyan-100'
    : tone === 'violet'
      ? 'border-violet-200/25 bg-white/10 text-cyan-100'
      : tone === 'amber'
        ? 'border-amber-200/25 bg-white/10 text-cyan-100'
        : 'border-emerald-200/25 bg-white/10 text-cyan-100';

  return (
    <div className={`rounded-[20px] border px-4 py-3.5 backdrop-blur-sm ${theme}`}>
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
