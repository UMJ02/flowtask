import Link from 'next/link';
import { ArrowUpRight, BrainCircuit, CheckCheck, ShieldAlert, Sparkles, Telescope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { asRoute } from '@/lib/navigation/routes';
import type { WorkspaceIntelligenceSummary } from '@/lib/queries/workspace-intelligence';

const toneClasses: Record<WorkspaceIntelligenceSummary['executiveSignals'][number]['tone'], string> = {
  critical: 'bg-rose-50 text-rose-700 ring-1 ring-rose-100',
  attention: 'bg-amber-50 text-amber-700 ring-1 ring-amber-100',
  stable: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100',
};

function toneLabel(tone: WorkspaceIntelligenceSummary['executiveSignals'][number]['tone']) {
  return tone === 'critical' ? 'Crítico' : tone === 'attention' ? 'Atención' : 'Estable';
}

export function WorkspaceIntelligence({ summary, compact = false }: { summary: WorkspaceIntelligenceSummary; compact?: boolean }) {
  const cards = [
    { label: 'Intelligence score', value: `${summary.kpis.intelligenceScore}%`, icon: <BrainCircuit className="h-5 w-5" /> },
    { label: 'Readiness', value: `${summary.kpis.readinessScore}%`, icon: <CheckCheck className="h-5 w-5" /> },
    { label: 'Risk score', value: `${summary.kpis.riskScore}%`, icon: <ShieldAlert className="h-5 w-5" /> },
    { label: 'Ritmo de cierre', value: `${summary.kpis.completionRate}%`, icon: <Sparkles className="h-5 w-5" /> },
  ];

  if (compact) {
    return (
      <Card>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">Workspace intelligence</p>
            <h3 className="mt-2 text-xl font-bold text-slate-900">Lectura ejecutiva unificada</h3>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">Cruza onboarding, planning, control, riesgo y reportes para decirte qué mover primero.</p>
          </div>
          <Link href={asRoute('/app/workspace-intelligence')}><Button>Ver intelligence center</Button></Link>
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
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700 ring-1 ring-cyan-100">{card.icon}</span>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="bg-[linear-gradient(135deg,#083344_0%,#155e75_52%,#0f172a_100%)] text-white shadow-[0_24px_60px_rgba(8,51,68,0.22)]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">Intelligence center</p>
              <h2 className="mt-2 text-3xl font-bold">Una sola lectura para decidir qué hacer primero</h2>
              <p className="mt-2 text-sm text-cyan-100/90">Ya no revisas módulos por separado. Esta vista resume señales, riesgo, preparación y ritmo para que ejecutes con más criterio.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[26px] bg-white/10 px-4 py-3 ring-1 ring-white/10">
                <p className="text-xs uppercase tracking-[0.16em] text-cyan-100/80">Señales activas</p>
                <p className="mt-2 text-3xl font-bold">{summary.kpis.activeSignals}</p>
              </div>
              <div className="rounded-[26px] bg-white/10 px-4 py-3 ring-1 ring-white/10">
                <p className="text-xs uppercase tracking-[0.16em] text-cyan-100/80">Carga vencida</p>
                <p className="mt-2 text-3xl font-bold">{summary.kpis.overdueLoad}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Siguiente movimiento</p>
              <h3 className="mt-2 text-xl font-bold text-slate-900">Recomendaciones accionables</h3>
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
            <Link href={asRoute('/app/reports/print?type=intelligence')} target="_blank"><Button>Intelligence PDF</Button></Link>
            <Link href={asRoute('/app/control-tower')}><Button variant="secondary">Abrir control tower</Button></Link>
            <Link href={asRoute('/app/execution-center')}><Button variant="secondary">Abrir execution center</Button></Link>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Señales ejecutivas</h3>
              <p className="mt-1 text-sm text-slate-500">El estado agregado de los indicadores que más mueven el workspace.</p>
            </div>
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700 ring-1 ring-cyan-100">
              <Telescope className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-5 space-y-3">
            {summary.executiveSignals.map((item) => (
              <div key={item.label} className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-slate-900">{item.value}{typeof item.value === 'number' && item.label !== 'Carga vencida' ? '%' : ''}</p>
                    <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${toneClasses[item.tone]}`}>{toneLabel(item.tone)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Prioridades cruzadas</h3>
              <p className="mt-1 text-sm text-slate-500">Lo más importante que aparece al cruzar módulos y no verlos aislados.</p>
            </div>
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
              <BrainCircuit className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-5 space-y-3">
            {summary.crossModulePriorities.map((item) => (
              <div key={`${item.source}-${item.title}`} className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${toneClasses[item.tone]}`}>{toneLabel(item.tone)}</span>
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{item.source}</span>
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="mt-1 text-sm text-slate-500">{item.detail}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Watchlist unificado</h3>
            <p className="mt-1 text-sm text-slate-500">Un bloque rápido con proyectos, clientes y tareas que merecen seguimiento.</p>
          </div>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {summary.watchlist.map((item) => (
            <div key={`${item.source}-${item.title}-${item.meta}`} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{item.source}</span>
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${toneClasses[item.tone]}`}>{toneLabel(item.tone)}</span>
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-900">{item.title}</p>
              <p className="mt-1 text-sm text-slate-500">{item.meta}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
