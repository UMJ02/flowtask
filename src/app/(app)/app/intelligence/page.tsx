import Link from 'next/link';
import { ArrowRight, BrainCircuit, CalendarRange, SearchCheck, ShieldAlert, Sparkles, Telescope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ErrorState } from '@/components/ui/error-state';
import { SectionHeader } from '@/components/ui/section-header';
import { getExecutionCenterSummary } from '@/lib/queries/execution-center';
import { getPlanningOverview } from '@/lib/queries/planning';
import { getRiskRadarSummary } from '@/lib/queries/risk-radar';
import { getWorkspaceOnboardingSummary } from '@/lib/queries/onboarding';
import { getWorkspaceIntelligenceSummary } from '@/lib/queries/workspace-intelligence';

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
    getWorkspaceOnboardingSummary(),
    getPlanningOverview(),
    getRiskRadarSummary(),
    getWorkspaceIntelligenceSummary(),
    getExecutionCenterSummary(),
  ]);

  if (!workspace || !planning || !risk || !execution) {
    return (
      <ErrorState
        title="No pudimos abrir esta vista"
        description="Faltan datos del workspace para mostrarte recomendaciones claras. Inténtalo de nuevo en un momento."
      />
    );
  }

  const executiveCards = [
    { label: 'Estado general', value: `${onboarding?.score ?? workspace.kpis.readinessScore}%`, icon: <Sparkles className="h-5 w-5" /> },
    { label: 'Riesgo actual', value: `${risk.kpis.riskScore}%`, icon: <ShieldAlert className="h-5 w-5" /> },
    { label: 'Capacidad', value: `${planning.departmentCapacity[0]?.score ?? 0}%`, icon: <CalendarRange className="h-5 w-5" /> },
    { label: 'Ejecución', value: `${execution.kpis.executionScore}%`, icon: <BrainCircuit className="h-5 w-5" /> },
  ];

  return (
    <div className="space-y-5">
      <SectionHeader
        eyebrow="Insights"
        title="Qué conviene atender"
        description="Todo lo importante del workspace en una sola vista, con lenguaje claro y acciones rápidas."
        icon={<BrainCircuit className="h-5 w-5" />}
        actions={
          <>
            <Link href="/app/reports/print?type=intelligence" target="_blank">
              <Button>PDF</Button>
            </Link>
            <Link href="/app/workspace">
              <Button variant="secondary">Volver al workspace</Button>
            </Link>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {executiveCards.map((card) => (
          <Card key={card.label} className="bg-gradient-to-br from-white to-slate-50">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-slate-500">{card.label}</p>
                <p className="mt-3 text-3xl font-semibold text-slate-900">{card.value}</p>
              </div>
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">{card.icon}</span>
            </div>
          </Card>
        ))}
      </div>

      <Card className="border-slate-200 bg-white">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Resumen rápido</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Qué atender ahora</h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
              Mira las señales activas, la carga vencida y entra al detalle solo cuando haga falta.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[360px]">
            {[
              { label: 'Señales activas', value: workspace.kpis.activeSignals },
              { label: 'Carga vencida', value: workspace.kpis.overdueLoad },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
                  <p className="text-4xl font-semibold leading-none text-slate-950">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
        <Card>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Sugerencias</p>
              <h3 className="mt-2 text-xl font-semibold text-slate-900">Qué conviene hacer primero</h3>
            </div>
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 ring-1 ring-slate-200">
              <Telescope className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-5 grid gap-3">
            {[...workspace.recommendations, ...risk.recommendations].slice(0, 4).map((item) => (
              <div key={item} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">{item}</div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Sigue desde aquí</p>
              <h3 className="mt-2 text-xl font-semibold text-slate-900">Entra al detalle cuando lo necesites</h3>
            </div>
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
              <SearchCheck className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-5 grid gap-3">
            <Link href="/app/workspace" className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-emerald-200 hover:bg-emerald-50">
              <p className="text-sm font-semibold text-slate-900">Volver al workspace</p>
              <p className="mt-1 text-sm text-slate-500">Retoma tu tablero principal y sigue avanzando.</p>
            </Link>
            <Link href="/app/tasks" className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-emerald-200 hover:bg-emerald-50">
              <p className="text-sm font-semibold text-slate-900">Abrir tareas</p>
              <p className="mt-1 text-sm text-slate-500">Ve directo a los pendientes que más atención piden.</p>
            </Link>
            <Link href="/app/reports" className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-emerald-200 hover:bg-emerald-50">
              <p className="text-sm font-semibold text-slate-900">Abrir reportes</p>
              <p className="mt-1 text-sm text-slate-500">Comparte un resumen limpio sin salir del flujo.</p>
            </Link>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Estado del workspace</h3>
              <p className="mt-1 text-sm text-slate-500">Lo que todavía puedes completar para trabajar más cómodo.</p>
            </div>
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
              <Sparkles className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-5 space-y-3">
            {(onboarding?.steps ?? []).slice(0, 4).map((step) => (
              <div key={step.id} className="rounded-xl border border-slate-200 bg-white px-4 py-4">
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
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-700 ring-1 ring-rose-100">
              <ShieldAlert className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-5 space-y-3">
            {risk.hotspots.slice(0, 4).map((item) => (
              <div key={item.name} className="rounded-xl border border-slate-200 bg-white px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${toneClass(item.tone)}`}>{toneLabel(item.tone)}</span>
                </div>
                <p className="mt-2 text-sm text-slate-500">{item.openTasks} tareas · {item.activeProjects} proyectos · {item.nearTermItems} por revisar</p>
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
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
              <CalendarRange className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-5 space-y-3">
            {planning.weeklyFocus.slice(0, 4).map((item) => (
              <div key={item.id} className="rounded-xl border border-slate-200 bg-white px-4 py-4">
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

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Watchlist</h3>
              <p className="mt-1 text-sm text-slate-500">Una sola lista con lo que merece seguimiento.</p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {workspace.watchlist.slice(0, 6).map((item) => (
              <div key={`${item.source}-${item.title}-${item.meta}`} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{item.source}</span>
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${toneClass(item.tone)}`}>{toneLabel(item.tone)}</span>
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="mt-1 text-sm text-slate-500">{item.meta}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Sigue desde aquí</h3>
              <p className="mt-1 text-sm text-slate-500">Vuelve al tablero o comparte un resumen cuando lo necesites.</p>
            </div>
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 ring-1 ring-slate-200">
              <ArrowRight className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-5 grid gap-3">
            <Link href="/app/workspace" className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-emerald-200 hover:bg-emerald-50">
              <p className="text-sm font-semibold text-slate-900">Ir al workspace</p>
              <p className="mt-1 text-sm text-slate-500">Regresa a tu pizarra y sigue trabajando.</p>
            </Link>
            <Link href="/app/tasks" className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-emerald-200 hover:bg-emerald-50">
              <p className="text-sm font-semibold text-slate-900">Abrir tareas</p>
              <p className="mt-1 text-sm text-slate-500">Ve al detalle de pendientes y ajusta la vista.</p>
            </Link>
            <Link href="/app/reports" className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-emerald-200 hover:bg-emerald-50">
              <p className="text-sm font-semibold text-slate-900">Abrir reportes</p>
              <p className="mt-1 text-sm text-slate-500">Comparte el estado del trabajo con un PDF limpio.</p>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
