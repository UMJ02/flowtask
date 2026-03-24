import Link from 'next/link';
import { ArrowUpRight, BriefcaseBusiness, Building2, ClipboardList, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { asRoute } from '@/lib/navigation/routes';
import type { ExecutiveSuiteSummary } from '@/lib/queries/executive-suite';

const toneClasses: Record<'critical' | 'attention' | 'stable', string> = {
  critical: 'bg-rose-50 text-rose-700 ring-1 ring-rose-100',
  attention: 'bg-amber-50 text-amber-700 ring-1 ring-amber-100',
  stable: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100',
};

function toneLabel(tone: 'critical' | 'attention' | 'stable') {
  return tone === 'critical' ? 'Crítico' : tone === 'attention' ? 'Atención' : 'Estable';
}

const sourceIcons = {
  Project: <BriefcaseBusiness className="h-4 w-4" />,
  Client: <Building2 className="h-4 w-4" />,
  Task: <ClipboardList className="h-4 w-4" />,
};

export function ExecutiveSuite({ summary, compact = false }: { summary: ExecutiveSuiteSummary; compact?: boolean }) {
  const cards = [
    { label: 'Executive score', value: `${summary.kpis.executiveScore}%` },
    { label: 'Operating', value: `${summary.kpis.operatingScore}%` },
    { label: 'Execution', value: `${summary.kpis.executionScore}%` },
    { label: 'Risk load', value: `${summary.kpis.riskScore}%` },
  ];

  if (compact) {
    return (
      <Card>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">Executive suite</p>
            <h3 className="mt-2 text-xl font-bold text-slate-900">El tablero semanal para decidir sin perder contexto</h3>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">Cruza operating score, ejecución, riesgo y watchlist para tener una lectura ejecutiva limpia del workspace.</p>
          </div>
          <Link href={asRoute('/app/executive-suite')}><Button>Ver executive suite</Button></Link>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-4">
          {cards.map((card) => (
            <div key={card.label} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{card.label}</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{card.value}</p>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-[linear-gradient(135deg,#312e81_0%,#581c87_55%,#0f172a_100%)] text-white shadow-[0_24px_60px_rgba(49,46,129,0.24)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-200">Executive suite</p>
            <h2 className="mt-2 text-3xl font-bold">Una sola capa para revisar foco, riesgo y gobierno del workspace</h2>
            <p className="mt-2 text-sm text-violet-100/90">Pensado para cierres semanales y conversaciones ejecutivas. Aquí se condensa qué mover, qué escalar y qué solo vigilar.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[26px] bg-white/10 px-4 py-3 ring-1 ring-white/10">
              <p className="text-xs uppercase tracking-[0.16em] text-violet-100/80">Decisiones activas</p>
              <p className="mt-2 text-3xl font-bold">{summary.kpis.activeDecisions}</p>
            </div>
            <div className="rounded-[26px] bg-white/10 px-4 py-3 ring-1 ring-white/10">
              <p className="text-xs uppercase tracking-[0.16em] text-violet-100/80">Watchlist</p>
              <p className="mt-2 text-3xl font-bold">{summary.kpis.watchlistSize}</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label} className="bg-gradient-to-br from-white to-violet-50/60">
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-3 text-3xl font-bold text-slate-900">{card.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Decision board</h3>
              <p className="mt-1 text-sm text-slate-500">Lo que más conviene mover primero para sostener ritmo y bajar fricción.</p>
            </div>
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-700 ring-1 ring-violet-100">
              <ShieldCheck className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-5 space-y-3">
            {summary.decisionBoard.map((item) => (
              <div key={`${item.source}-${item.title}`} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${toneClasses[item.tone]}`}>{toneLabel(item.tone)}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{item.detail}</p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">{item.source}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Cadencia semanal</h3>
              <p className="mt-1 text-sm text-slate-500">Los cuatro números que no deberían perderse en la conversación del equipo.</p>
            </div>
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
              <Sparkles className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-5 space-y-3">
            {summary.weeklyCadence.map((item) => (
              <div key={item.label} className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.detail}</p>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <Card>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Governance watchlist</h3>
              <p className="mt-1 text-sm text-slate-500">Items que vale la pena llevar a revisión con responsables visibles y contexto corto.</p>
            </div>
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 ring-1 ring-slate-200">
              <BriefcaseBusiness className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-5 space-y-3">
            {summary.governanceWatchlist.map((item) => (
              <div key={`${item.source}-${item.title}-${item.owner}`} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">{sourceIcons[item.source]} {item.source}</span>
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${toneClasses[item.tone]}`}>{toneLabel(item.tone)}</span>
                    </div>
                    <p className="mt-3 text-sm font-semibold text-slate-900">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.owner} · {item.detail}</p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Recomendaciones ejecutivas</h3>
              <p className="mt-1 text-sm text-slate-500">Próximos movimientos para cerrar la semana con foco profesional y sin sobrecomplicar la operación.</p>
            </div>
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
              <Sparkles className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-5 space-y-3">
            {summary.recommendations.map((item) => (
              <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">{item}</div>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/app/reports/print?type=executive-suite" target="_blank"><Button>Executive PDF</Button></Link>
            <Link href={asRoute('/app/intelligence')}><Button variant="secondary">Abrir intelligence hub</Button></Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
