"use client";

import { ChevronDown, ListTodo, TrendingUp, Workflow } from 'lucide-react';
import { useState, type ComponentType } from 'react';
import { ShareCenterCard } from '@/components/analytics/share-center-card';
import { Card } from '@/components/ui/card';
import type { AnalyticsFeedItem, AnalyticsTone, WorkspaceAnalyticsSummary } from '@/lib/queries/analytics';

const toneClasses: Record<AnalyticsTone, string> = {
  critical: 'bg-rose-50 text-rose-700 ring-1 ring-rose-100',
  attention: 'bg-amber-50 text-amber-700 ring-1 ring-amber-100',
  stable: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100',
};

const heroMetricStyles = [
  'border-cyan-100 bg-cyan-50 text-cyan-900',
  'border-sky-100 bg-sky-50 text-sky-900',
  'border-amber-100 bg-amber-50 text-amber-900',
  'border-rose-100 bg-rose-50 text-rose-900',
] as const;

function toneLabel(tone: AnalyticsTone) {
  if (tone === 'critical') return 'Atención';
  if (tone === 'attention') return 'Prioridad';
  return 'Estable';
}

export function AnalyticsOverview({ summary, compact = false }: { summary: WorkspaceAnalyticsSummary; compact?: boolean }) {
  const heroCards = [
    { label: 'Pulso general', value: `${summary.kpis.healthScore}%`, helper: 'Panorama del momento' },
    { label: 'Ritmo del equipo', value: `${summary.kpis.intelligenceScore}%`, helper: 'Seguimiento activo' },
    { label: 'Por vencer', value: String(summary.pipeline.dueThisWeek), helper: 'Esta semana' },
    { label: 'Vencidas', value: String(summary.pipeline.overdueLoad), helper: 'Requieren atención' },
  ];

  return (
    <div className={compact ? 'space-y-4' : 'space-y-4'}>
      <Card className={`rounded-[30px] border border-cyan-100/80 bg-[linear-gradient(135deg,#082f49_0%,#0f3f5e_45%,#0f172a_100%)] text-white shadow-[0_22px_52px_rgba(8,47,73,0.18)] ${compact ? 'p-5' : 'p-6 sm:p-7'}`}>
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)] xl:items-end">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100/80">Analytics v4.7</p>
            <h1 className={`mt-3 max-w-3xl font-bold leading-[1.06] ${compact ? 'text-[1.7rem] sm:text-[2.1rem]' : 'text-[2rem] sm:text-[2.7rem]'}`}>Pulso del workspace</h1>
            <p className={`mt-3 max-w-2xl text-slate-100/90 ${compact ? 'text-sm leading-6' : 'text-sm leading-7 sm:text-base'}`}>
              Una lectura corta para priorizar, revisar proyectos activos y dejar listo un reporte claro para compartir.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {heroCards.map((item, index) => (
              <HeroMetric key={item.label} {...item} className={heroMetricStyles[index]} />
            ))}
          </div>
        </div>
      </Card>

      <div className="grid items-start gap-4 xl:grid-cols-[1fr_1fr]">
        <ExpandableFeedCard
          title="Foco de la semana"
          subtitle="Tres tareas visibles para decidir rápido qué mover primero y abrir el resto solo cuando haga falta."
          icon={ListTodo}
          items={summary.weeklyFocus}
          emptyLabel="No hay tareas prioritarias para mostrar ahora."
          expandLabel="Ver más tareas"
          collapseLabel="Ver menos tareas"
        />
        <ExpandableFeedCard
          title="Pipeline de proyectos"
          subtitle="Los tres proyectos más relevantes quedan al frente y el resto aparece solo cuando lo necesitas."
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

function HeroMetric({ label, value, helper, className }: { label: string; value: string; helper: string; className: string }) {
  return (
    <div className={`rounded-[22px] border px-5 py-4 shadow-[0_12px_28px_rgba(15,23,42,0.05)] ${className}`}>
      <p className="text-sm font-medium text-current/70">{label}</p>
      <p className="mt-4 text-[2rem] font-bold leading-none text-current">{value}</p>
      <p className="mt-3 text-sm text-current/70">{helper}</p>
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
    <Card className="rounded-[28px] border border-slate-200/90 bg-white/[0.96] p-5 shadow-[0_14px_34px_rgba(15,23,42,0.05)] md:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-[1.65rem] font-bold tracking-tight text-slate-950">{title}</h2>
          <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500">{subtitle}</p>
        </div>
        <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-[22px] bg-cyan-50 text-cyan-700 ring-1 ring-cyan-100">
          <Icon className="h-6 w-6" />
        </span>
      </div>

      <div className="mt-5 space-y-3">
        {visibleItems.length ? visibleItems.map((item) => (
          <div key={`${item.source}-${item.id}`} className="rounded-[22px] border border-slate-200 bg-white px-4 py-4 transition hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-[0_12px_26px_rgba(15,23,42,0.08)]">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">{item.source}</span>
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${toneClasses[item.tone]}`}>{toneLabel(item.tone)}</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{item.statusLabel}</span>
            </div>
            <p className="mt-3 line-clamp-2 text-[1.05rem] font-semibold leading-snug text-slate-900">{item.title}</p>
            <p className="mt-1 text-sm text-slate-500">{item.meta}</p>
          </div>
        )) : <div className="rounded-[22px] border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">{emptyLabel}</div>}
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
