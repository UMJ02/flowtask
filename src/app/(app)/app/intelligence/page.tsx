import Link from 'next/link';
import { ArrowRight, BrainCircuit, CalendarRange, ShieldAlert, Sparkles, Telescope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ErrorState } from '@/components/ui/error-state';
import { SectionHeader } from '@/components/ui/section-header';
import { getExecutionCenterSummary } from '@/lib/queries/execution-center';
import { getPlanningOverview } from '@/lib/queries/planning';
import { getRiskRadarSummary } from '@/lib/queries/risk-radar';
import { getWorkspaceOnboardingSummary } from '@/lib/queries/onboarding';
import { getWorkspaceIntelligenceSummary } from '@/lib/queries/workspace-intelligence';
import { safeServerCall } from '@/lib/runtime/safe-server';

function toneClass(tone: 'critical' | 'attention' | 'stable') {
  if (tone === 'critical') return 'bg-rose-50 text-rose-700 ring-1 ring-rose-100';
  if (tone === 'attention') return 'bg-amber-50 text-amber-700 ring-1 ring-amber-100';
  return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100';
}

function toneLabel(tone: 'critical' | 'attention' | 'stable') {
  return tone === 'critical' ? 'Crítico' : tone === 'attention' ? 'Atención' : 'Estable';
}

export default async function IntelligencePage() {
  const [onboarding, planning, risk, workspace, execution] = await Promise.all([
    safeServerCall('getWorkspaceOnboardingSummary', () => getWorkspaceOnboardingSummary(), null),
    safeServerCall('getPlanningOverview', () => getPlanningOverview(), null),
    safeServerCall('getRiskRadarSummary', () => getRiskRadarSummary(), null),
    safeServerCall('getWorkspaceIntelligenceSummary', () => getWorkspaceIntelligenceSummary(), null),
    safeServerCall('getExecutionCenterSummary', () => getExecutionCenterSummary(), null),
  ]);

  if (!workspace || !planning || !risk || !execution) {
    return (
      <ErrorState
        title="No pudimos abrir esta vista"
        description="Faltan datos del workspace para consolidar esta vista. Revisa tu contexto y vuelve a intentarlo."
        action={
          <Link href="/app/dashboard">
            <Button>Ir al dashboard</Button>
          </Link>
        }
      />
    );
  }

  const executiveCards = [
    { label: 'Estado', value: `${onboarding?.score ?? workspace.kpis.readinessScore}%`, icon: <Sparkles className="h-5 w-5" /> },
    { label: 'Riesgo', value: `${risk.kpis.riskScore}%`, icon: <ShieldAlert className="h-5 w-5" /> },
    { label: 'Capacidad', value: `${planning.departmentCapacity[0]?.score ?? 0}%`, icon: <CalendarRange className="h-5 w-5" /> },
    { label: 'Ejecución', value: `${execution.kpis.executionScore}%`, icon: <BrainCircuit className="h-5 w-5" /> },
  ];

  const topRecommendations = [...workspace.recommendations, ...risk.recommendations].slice(0, 4);

  return (
    <div className="page-grid">
      <SectionHeader
        eyebrow="Insights"
        title="Insights"
        description="Estado, riesgo y foco en una sola vista para decidir más rápido."
        icon={<BrainCircuit className="h-5 w-5" />}
        actions={
          <>
            <Link href="/app/reports/print?type=intelligence" target="_blank">
              <Button>PDF</Button>
            </Link>
            <Link href="/app/dashboard">
              <Button variant="secondary">Ir al workspace</Button>
            </Link>
          </>
        }
      />

      <Card className="border-slate-200 bg-white px-4 py-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0 max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Resumen</p>
            <div className="mt-2 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <h2 className="text-2xl font-bold tracking-tight text-slate-950">Resumen rápido</h2>
                <p className="mt-1 text-sm text-slate-500">Lo más importante del día en una sola vista.</p>
              </div>
              <Link href="/app/risk-radar" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-950">
                Ver insights <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[360px]">
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Señales activas</p>
              <p className="mt-2 text-[1.8rem] font-bold leading-none text-slate-950">{workspace.kpis.activeSignals}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Carga vencida</p>
              <p className="mt-2 text-[1.8rem] font-bold leading-none text-slate-950">{workspace.kpis.overdueLoad}</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {executiveCards.map((card) => (
          <Card key={card.label} className="bg-gradient-to-br from-white to-slate-50/60">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{card.label}</p>
                <p className="mt-3 text-[2rem] font-bold leading-none text-slate-900">{card.value}</p>
              </div>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">{card.icon}</span>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Recomendaciones</p>
              <h3 className="mt-2 text-xl font-bold text-slate-900">Qué conviene hacer</h3>
            </div>
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-slate-700 ring-1 ring-slate-200">
              <Telescope className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-4 grid gap-3">
            {topRecommendations.map((item) => (
              <div key={item} className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">{item}</div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Watchlist</h3>
              <p className="mt-1 text-sm text-slate-500">Una sola lista con lo que merece seguimiento.</p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {workspace.watchlist.slice(0, 6).map((item) => (
              <div key={`${item.source}-${item.title}-${item.meta}`} className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{item.source}</span>
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${toneClass(item.tone)}`}>{toneLabel(item.tone)}</span>
                </div>
                <p className="mt-3 line-clamp-2 text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="mt-1 line-clamp-2 text-sm text-slate-500">{item.meta}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Estado del workspace</h3>
              <p className="mt-1 text-sm text-slate-500">Lo que falta para completar mejor la base.</p>
            </div>
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
              <Sparkles className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-4 space-y-3">
            {(onboarding?.steps ?? []).slice(0, 4).map((step) => (
              <div key={step.id} className="rounded-lg border border-slate-200 bg-white px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">{step.title}</p>
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${step.done ? toneClass('stable') : toneClass('attention')}`}>{step.done ? 'Listo' : 'Pendiente'}</span>
                </div>
                <p className="mt-2 text-sm text-slate-500">{step.description}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Riesgos</h3>
              <p className="mt-1 text-sm text-slate-500">Dónde hay más presión ahora mismo.</p>
            </div>
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-rose-50 text-rose-700 ring-1 ring-rose-100">
              <ShieldAlert className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-4 space-y-3">
            {risk.hotspots.slice(0, 4).map((item) => (
              <div key={item.name} className="rounded-lg border border-slate-200 bg-white px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${toneClass(item.tone)}`}>{toneLabel(item.tone)}</span>
                </div>
                <p className="mt-2 text-sm text-slate-500">{item.openTasks} tareas · {item.activeProjects} proyectos · {item.nearTermItems} elementos cercanos</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Plan y prioridad</h3>
              <p className="mt-1 text-sm text-slate-500">Qué viene y qué conviene mover primero.</p>
            </div>
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-blue-50 text-blue-700 ring-1 ring-blue-100">
              <CalendarRange className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-4 space-y-3">
            {planning.weeklyFocus.slice(0, 4).map((item) => (
              <div key={item.id} className="rounded-lg border border-slate-200 bg-white px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${toneClass(item.urgency === 'overdue' ? 'critical' : item.urgency === 'today' || item.urgency === 'this_week' ? 'attention' : 'stable')}`}>{item.dueLabel}</span>
                </div>
                <p className="mt-2 text-sm text-slate-500">{item.clientName} · {item.status}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Sigue desde aquí</h3>
            <p className="mt-1 text-sm text-slate-500">Vuelve al tablero o comparte un resumen cuando lo necesites.</p>
          </div>
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-slate-700 ring-1 ring-slate-200">
            <ArrowRight className="h-5 w-5" />
          </span>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <Link href="/app/dashboard" className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-emerald-200 hover:bg-emerald-50">
            <p className="text-sm font-semibold text-slate-900">Ir al workspace</p>
            <p className="mt-1 text-sm text-slate-500">Regresa a tu pizarra y sigue trabajando.</p>
          </Link>
          <Link href="/app/tasks" className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-emerald-200 hover:bg-emerald-50">
            <p className="text-sm font-semibold text-slate-900">Abrir tareas</p>
            <p className="mt-1 text-sm text-slate-500">Ve al detalle de pendientes y cambia filtros.</p>
          </Link>
          <Link href="/app/reports" className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-emerald-200 hover:bg-emerald-50">
            <p className="text-sm font-semibold text-slate-900">Abrir reportes</p>
            <p className="mt-1 text-sm text-slate-500">Exporta un PDF y comparte el estado del trabajo.</p>
          </Link>
        </div>
      </Card>
    </div>
  );
}
