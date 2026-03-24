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
import { reportsPrintRoute } from '@/lib/navigation/routes';
import { ModuleMap } from '@/components/intelligence/module-map';
import { getModulesByLifecycle } from '@/lib/intelligence/module-registry';

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
        description="Faltan datos del workspace para consolidar esta vista. Revisa tu contexto y vuelve a intentarlo."
      />
    );
  }

  const executiveCards = [
    { label: 'Estado', value: `${onboarding?.score ?? workspace.kpis.readinessScore}%`, icon: <Sparkles className="h-5 w-5" /> },
    { label: 'Riesgo', value: `${risk.kpis.riskScore}%`, icon: <ShieldAlert className="h-5 w-5" /> },
    { label: 'Capacidad', value: `${planning.departmentCapacity[0]?.score ?? 0}%`, icon: <CalendarRange className="h-5 w-5" /> },
    { label: 'Ejecución', value: `${execution.kpis.executionScore}%`, icon: <BrainCircuit className="h-5 w-5" /> },
  ];

  const coreModules = getModulesByLifecycle('core').filter((item) => item.id !== 'intelligence-hub');
  const supportModules = getModulesByLifecycle('support');
  const legacyModules = getModulesByLifecycle('legacy');

  return (
    <div className="space-y-5">
      <SectionHeader
        eyebrow="Intelligence"
        title="Hub de inteligencia del workspace"
        description="Plan, riesgo y ejecución en una sola capa para decidir rápido y sin duplicar pantallas."
        icon={<BrainCircuit className="h-5 w-5" />}
        actions={
          <>
            <Link href={reportsPrintRoute('intelligence')} target="_blank">
              <Button>PDF</Button>
            </Link>
            <Link href="/app/workspace">
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
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">{card.icon}</span>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="bg-[linear-gradient(135deg,#082f49_0%,#0f766e_54%,#0f172a_100%)] text-white shadow-[0_24px_60px_rgba(15,23,42,0.22)]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">Foundation</p>
              <h2 className="mt-2 text-3xl font-bold">Una sola capa para leer el negocio</h2>
              <p className="mt-2 text-sm text-cyan-100/90">En v5.9 esta vista pasa a ser el punto oficial de entrada para inteligencia. Workspace sigue siendo el home operativo y aquí se ordenan módulos core, soporte y legacy sin duplicidad.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[26px] bg-white/10 px-4 py-3 ring-1 ring-white/10">
                <p className="text-xs uppercase tracking-[0.16em] text-cyan-100/80">Señales activas</p>
                <p className="mt-2 text-3xl font-bold">{workspace.kpis.activeSignals}</p>
              </div>
              <div className="rounded-[26px] bg-white/10 px-4 py-3 ring-1 ring-white/10">
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
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 ring-1 ring-slate-200">
              <Telescope className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-5 space-y-3">
            {[...workspace.recommendations, ...risk.recommendations].slice(0, 4).map((item) => (
              <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">{item}</div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <ModuleMap
          title="Módulos core"
          description="Estos son los módulos que sí forman parte de la lectura consolidada del producto."
          modules={coreModules}
        />
        <div className="space-y-4">
          <ModuleMap
            title="Módulos de soporte"
            description="Se mantienen disponibles para lecturas tácticas o ejecutivas puntuales, pero ya no compiten con el hub principal."
            modules={supportModules}
          />
          <ModuleMap
            title="Vistas legacy"
            description="Se preservan por compatibilidad para no romper la base anterior mientras termina la migración al hub."
            modules={legacyModules}
          />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Estado del workspace</h3>
              <p className="mt-1 text-sm text-slate-500">Lo que falta para que el workspace esté más completo.</p>
            </div>
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
              <Sparkles className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-5 space-y-3">
            {(onboarding?.steps ?? []).slice(0, 4).map((step) => (
              <div key={step.id} className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
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
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-700 ring-1 ring-rose-100">
              <ShieldAlert className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-5 space-y-3">
            {risk.hotspots.slice(0, 4).map((item) => (
              <div key={item.name} className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
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
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
              <CalendarRange className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-5 space-y-3">
            {planning.weeklyFocus.slice(0, 4).map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
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
    </div>
  );
}
