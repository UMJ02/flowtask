import Link from 'next/link';
import { ArrowRight, Gauge, Layers3, PlayCircle, ShieldCheck, Siren } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { asRoute } from '@/lib/navigation/routes';
import type { ExecutionCenterSummary } from '@/lib/queries/execution-center';

const toneClasses: Record<'critical' | 'attention' | 'stable', string> = {
  critical: 'bg-rose-50 text-rose-700 ring-1 ring-rose-100',
  attention: 'bg-amber-50 text-amber-700 ring-1 ring-amber-100',
  stable: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100',
};

function toneLabel(tone: 'critical' | 'attention' | 'stable') {
  return tone === 'critical' ? 'Crítico' : tone === 'attention' ? 'Atención' : 'Estable';
}

export function ExecutionCenter({ summary, compact = false }: { summary: ExecutionCenterSummary; compact?: boolean }) {
  const cards = [
    { label: 'Execution score', value: `${summary.kpis.executionScore}%`, icon: <Gauge className="h-5 w-5" /> },
    { label: 'Do now', value: summary.kpis.doNow, icon: <PlayCircle className="h-5 w-5" /> },
    { label: 'Unblock', value: summary.kpis.unblock, icon: <Siren className="h-5 w-5" /> },
    { label: 'Monitor', value: summary.kpis.monitor, icon: <ShieldCheck className="h-5 w-5" /> },
  ];

  if (compact) {
    return (
      <Card>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-fuchsia-700">Execution center</p>
            <h3 className="mt-2 text-xl font-bold text-slate-900">Convertir señales en acción</h3>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">Junta lo urgente, lo que está bloqueado y lo que solo necesitas vigilar para ejecutar con claridad.</p>
          </div>
          <Link href={asRoute('/app/execution-center')}><Button>Ver execution center</Button></Link>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-4">
          {cards.map((card) => (
            <div key={card.label} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="flex items-center justify-between gap-3 text-slate-500">
                <span className="text-sm">{card.label}</span>
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-white text-fuchsia-700 ring-1 ring-slate-200">{card.icon}</span>
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
          <Card key={card.label} className="bg-gradient-to-br from-white to-fuchsia-50/50">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-slate-500">{card.label}</p>
                <p className="mt-3 text-3xl font-bold text-slate-900">{card.value}</p>
              </div>
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-fuchsia-50 text-fuchsia-700 ring-1 ring-fuchsia-100">{card.icon}</span>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="bg-[linear-gradient(135deg,#4a044e_0%,#701a75_48%,#0f172a_100%)] text-white shadow-[0_24px_60px_rgba(76,29,149,0.22)]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-fuchsia-200">Execution center</p>
              <h2 className="mt-2 text-3xl font-bold">La capa que convierte lectura en movimiento</h2>
              <p className="mt-2 text-sm text-fuchsia-100/90">No solo lees el workspace: aquí decides qué ejecutar ya, qué destrabar y qué vigilar sin perder velocidad.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[26px] bg-white/10 px-4 py-3 ring-1 ring-white/10">
                <p className="text-xs uppercase tracking-[0.16em] text-fuchsia-100/80">Departamentos bajo presión</p>
                <p className="mt-2 text-3xl font-bold">{summary.kpis.departmentsUnderPressure}</p>
              </div>
              <div className="rounded-[26px] bg-white/10 px-4 py-3 ring-1 ring-white/10">
                <p className="text-xs uppercase tracking-[0.16em] text-fuchsia-100/80">Carga vencida</p>
                <p className="mt-2 text-3xl font-bold">{summary.kpis.overdueLoad}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Próximo movimiento</p>
              <h3 className="mt-2 text-xl font-bold text-slate-900">Recomendaciones de ejecución</h3>
            </div>
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 ring-1 ring-slate-200">
              <ArrowRight className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-5 space-y-3">
            {summary.recommendations.map((item) => (
              <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">{item}</div>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href={asRoute('/app/reports/print?type=execution')} target="_blank"><Button>Execution PDF</Button></Link>
            <Link href={asRoute('/app/intelligence')}><Button variant="secondary">Abrir intelligence hub</Button></Link>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {[
          { title: 'Do now', subtitle: 'Lo que merece ejecución inmediata.', items: summary.doNow, icon: <PlayCircle className="h-5 w-5" /> },
          { title: 'Unblock', subtitle: 'Lo que está frenando el ritmo.', items: summary.unblock, icon: <Siren className="h-5 w-5" /> },
          { title: 'Monitor', subtitle: 'Lo que no está crítico pero sí pide seguimiento.', items: summary.monitor, icon: <ShieldCheck className="h-5 w-5" /> },
        ].map((lane) => (
          <Card key={lane.title}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{lane.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{lane.subtitle}</p>
              </div>
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-fuchsia-50 text-fuchsia-700 ring-1 ring-fuchsia-100">{lane.icon}</span>
            </div>
            <div className="mt-5 space-y-3">
              {lane.items.map((item) => (
                <div key={`${lane.title}-${item.title}-${item.detail}`} className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
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
        ))}
      </div>

      <Card>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Team pulse</h3>
            <p className="mt-1 text-sm text-slate-500">Una lectura rápida del área que tiene más carga y presión de corto plazo.</p>
          </div>
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
            <Layers3 className="h-5 w-5" />
          </span>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {summary.teamPulse.map((item) => {
            const tone = item.state === 'high' ? 'critical' : item.state === 'medium' ? 'attention' : 'stable';
            return (
              <div key={item.name} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-slate-900">{item.name}</span>
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${toneClasses[tone]}`}>{toneLabel(tone)}</span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-slate-500">
                  <div>
                    <p>Open tasks</p>
                    <p className="mt-1 text-lg font-bold text-slate-900">{item.openTasks}</p>
                  </div>
                  <div>
                    <p>Active projects</p>
                    <p className="mt-1 text-lg font-bold text-slate-900">{item.activeProjects}</p>
                  </div>
                  <div>
                    <p>Near term</p>
                    <p className="mt-1 text-lg font-bold text-slate-900">{item.nearTermItems}</p>
                  </div>
                  <div>
                    <p>Score</p>
                    <p className="mt-1 text-lg font-bold text-slate-900">{item.score}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
