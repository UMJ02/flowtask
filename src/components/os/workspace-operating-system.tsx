import Link from 'next/link';
import { ArrowUpRight, BrainCircuit, Layers3, ShieldAlert, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { WorkspaceOperatingSystemSummary } from '@/lib/queries/workspace-operating-system';
import { asRoute } from '@/lib/navigation/routes';

const toneClasses: Record<WorkspaceOperatingSystemSummary['priorities'][number]['tone'], string> = {
  critical: 'bg-rose-50 text-rose-700 ring-1 ring-rose-100',
  attention: 'bg-amber-50 text-amber-700 ring-1 ring-amber-100',
  stable: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100',
};

const toneLabels: Record<WorkspaceOperatingSystemSummary['priorities'][number]['tone'], string> = {
  critical: 'Crítico',
  attention: 'Atención',
  stable: 'Estable',
};

export function WorkspaceOperatingSystem({
  summary,
  compact = false,
}: {
  summary: WorkspaceOperatingSystemSummary;
  compact?: boolean;
}) {
  const scoreCards = [
    { label: 'Operating score', value: `${summary.kpis.operatingScore}%` },
    { label: 'Readiness', value: `${summary.kpis.readinessScore}%` },
    { label: 'Execution', value: `${summary.kpis.executionScore}%` },
    { label: 'Risk load', value: `${summary.kpis.riskScore}%` },
  ];

  if (compact) {
    return (
      <Card>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-fuchsia-700">Workspace OS</p>
            <h3 className="mt-2 text-xl font-bold text-slate-900">La capa maestra para operar todo el workspace</h3>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">Junta onboarding, planning, execution, intelligence y riesgo en una sola lectura ejecutiva.</p>
          </div>
          <Link href={asRoute('/app/intelligence')}><Button>Abrir intelligence hub</Button></Link>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-4">
          {scoreCards.map((card) => (
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
      <Card className="bg-[linear-gradient(135deg,#4c1d95_0%,#1e1b4b_50%,#0f172a_100%)] text-white shadow-[0_24px_60px_rgba(76,29,149,0.24)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-fuchsia-200">Workspace operating system</p>
            <h2 className="mt-2 text-3xl font-bold">Una sola capa para leer, decidir y ejecutar sin saltar entre módulos</h2>
            <p className="mt-2 text-sm text-fuchsia-100/90">Este frente amarra la base del workspace, el ritmo de la operación y la presión de riesgo para ayudarte a decidir mejor cada semana.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[26px] bg-white/10 px-4 py-3 ring-1 ring-white/10">
              <p className="text-xs uppercase tracking-[0.16em] text-fuchsia-100/80">Organización</p>
              <p className="mt-2 text-lg font-bold">{summary.foundations.organizationName}</p>
              <p className="mt-1 text-sm text-fuchsia-100/80">Rol base: {summary.foundations.role}</p>
            </div>
            <div className="rounded-[26px] bg-white/10 px-4 py-3 ring-1 ring-white/10">
              <p className="text-xs uppercase tracking-[0.16em] text-fuchsia-100/80">Prioridades activas</p>
              <p className="mt-2 text-3xl font-bold">{summary.kpis.priorities}</p>
              <p className="mt-1 text-sm text-fuchsia-100/80">Señales listas para mover.</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {scoreCards.map((card) => (
          <Card key={card.label} className="bg-gradient-to-br from-white to-fuchsia-50/60">
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-3 text-3xl font-bold text-slate-900">{card.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Carriles del sistema</h3>
              <p className="mt-1 text-sm text-slate-500">La forma más rápida de ver qué segmento necesita más atención.</p>
            </div>
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-fuchsia-50 text-fuchsia-700 ring-1 ring-fuchsia-100">
              <Layers3 className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-5 space-y-3">
            {summary.operatingLanes.map((lane) => (
              <div key={lane.label} className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{lane.label}</p>
                    <p className="mt-1 text-sm text-slate-500">{lane.detail}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-slate-900">{lane.value}</p>
                    <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${toneClasses[lane.tone]}`}>{toneLabels[lane.tone]}</span>
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
              <p className="mt-1 text-sm text-slate-500">Dónde conviene actuar primero para mover todo el sistema con menos fricción.</p>
            </div>
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 ring-1 ring-slate-200">
              <BrainCircuit className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-5 space-y-3">
            {summary.priorities.map((item) => (
              <div key={`${item.source}-${item.title}`} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${toneClasses[item.tone]}`}>{toneLabels[item.tone]}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{item.detail}</p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">{item.source}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Acciones sugeridas</h3>
              <p className="mt-1 text-sm text-slate-500">Acciones concretas para dejar cada bloque más profesional y estable.</p>
            </div>
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
              <Sparkles className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-5 space-y-3">
            {summary.recommendations.map((item) => (
              <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">{item}</div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Accesos del cierre profesional</h3>
              <p className="mt-1 text-sm text-slate-500">Entra directo a la capa que necesites ajustar sin perder contexto del sistema completo.</p>
            </div>
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-700 ring-1 ring-rose-100">
              <ShieldAlert className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              { href: '/app/onboarding', label: 'Onboarding', note: 'Cierra base y readiness' },
              { href: '/app/planning', label: 'Planning', note: 'Ajusta carga y horizonte' },
              { href: '/app/control-tower', label: 'Control Tower', note: 'Prioriza foco inmediato' },
              { href: '/app/risk-radar', label: 'Risk Radar', note: 'Reduce presión y vencimientos' },
              { href: '/app/workspace-intelligence', label: 'Intelligence', note: 'Cruza señales ejecutivas' },
              { href: '/app/execution-center', label: 'Execution Center', note: 'Activa do now y unblock' },
            ].map((item) => (
              <Link key={item.href} href={asRoute(item.href)} className="rounded-2xl border border-slate-200 bg-white px-4 py-4 transition hover:border-fuchsia-200 hover:bg-fuchsia-50/40">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.note}</p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-slate-400" />
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/app/reports/print?type=os" target="_blank"><Button>Workspace OS PDF</Button></Link>
            <Link href={asRoute('/app/reports')}><Button variant="secondary">Abrir reportes</Button></Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
