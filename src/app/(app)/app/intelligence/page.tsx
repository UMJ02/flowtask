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

  return (
    <div className="space-y-5">
      <SectionHeader
        eyebrow="Insights"
        title="Insights del workspace"
        description="Estado, riesgo y foco en una sola vista."
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

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {executiveCards.map((card) => (
          <Card key={card.label} className="bg-gradient-to-br from-white to-slate-50">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-slate-500">{card.label}</p>
                <p className="mt-3 text-3xl font-bold text-slate-900">{card.value}</p>
              </div>
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-[16px] bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">{card.icon}</span>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="bg-[linear-gradient(135deg,#082f49_0%,#0f766e_54%,#0f172a_100%)] text-white shadow-[0_24px_60px_rgba(15,23,42,0.22)]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">Resumen</p>
              <h2 className="mt-2 text-3xl font-bold">Qué atender ahora</h2>
              <p className="prose-balance mt-2 max-w-2xl text-sm leading-6 text-cyan-100/90">No necesitas abrir varias pantallas para decidir. Aquí ves dónde estás bien, qué está en riesgo y qué mover primero.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[340px]">
              <div className="rounded-[16px] border border-white/10 bg-white/10 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.16em] text-cyan-100/80">Señales activas</p>
                <p className="mt-2 text-3xl font-bold">{workspace.kpis.activeSignals}</p>
              </div>
              <div className="rounded-[16px] border border-white/10 bg-white/10 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.16em] text-cyan-100/80">Carga vencida</p>
                <p className="mt-2 text-3xl font-bold">{workspace.kpis.overdueLoad}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Recomendaciones</p>
              <h3 className="mt-2 text-xl font-bold text-slate-900">Qué conviene hacer</h3>
            </div>
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-[16px] bg-slate-100 text-slate-700 ring-1 ring-slate-200">
              <Telescope className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-5 space-y-3">
            {[...workspace.recommendations, ...risk.recommendations].slice(0, 4).map((item) => (
              <div key={item} className="rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">{item}</div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Estado del workspace</h3>
              <p className="mt-1 text-sm text-slate-500">Lo que falta para que el workspace esté más completo.</p>
            </div>
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-[16px] bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
              <Sparkles className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-5 space-y-3">
            {(onboarding?.steps ?? []).slice(0, 4).map((step) => (
              <div key={step.id} className="rounded-[16px] border border-slate-200 bg-white px-4 py-4">
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
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-[16px] bg-rose-50 text-rose-700 ring-1 ring-rose-100">
              <ShieldAlert className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-5 space-y-3">
            {risk.hotspots.slice(0, 4).map((item) => (
              <div key={item.name} className="rounded-[16px] border border-slate-200 bg-white px-4 py-4">
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
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-[16px] bg-blue-50 text-blue-700 ring-1 ring-blue-100">
              <CalendarRange className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-5 space-y-3">
            {planning.weeklyFocus.slice(0, 4).map((item) => (
              <div key={item.id} className="rounded-[16px] border border-slate-200 bg-white px-4 py-4">
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
              <div key={`${item.source}-${item.title}-${item.meta}`} className="rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-4">
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
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-[16px] bg-slate-100 text-slate-700 ring-1 ring-slate-200">
              <ArrowRight className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-5 grid gap-3">
            <Link href="/app/dashboard" className="rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-emerald-200 hover:bg-emerald-50">
              <p className="text-sm font-semibold text-slate-900">Ir al workspace</p>
              <p className="mt-1 text-sm text-slate-500">Regresa a tu pizarra y sigue trabajando.</p>
            </Link>
            <Link href="/app/tasks" className="rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-emerald-200 hover:bg-emerald-50">
              <p className="text-sm font-semibold text-slate-900">Abrir tareas</p>
              <p className="mt-1 text-sm text-slate-500">Ve al detalle de pendientes y cambia filtros.</p>
            </Link>
            <Link href="/app/reports" className="rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-emerald-200 hover:bg-emerald-50">
              <p className="text-sm font-semibold text-slate-900">Abrir reportes</p>
              <p className="mt-1 text-sm text-slate-500">Exporta un PDF y comparte el estado del trabajo.</p>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
