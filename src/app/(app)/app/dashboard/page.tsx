import Link from 'next/link';
import { CalendarDays, LayoutGrid } from 'lucide-react';
import { BoardOverview } from '@/components/dashboard/board-overview';
import { CollaborationMetrics } from '@/components/dashboard/collaboration-metrics';
import { DeadlineLanes } from '@/components/dashboard/deadline-lanes';
import { ClientMetrics } from '@/components/dashboard/client-metrics';
import { DepartmentMetrics } from '@/components/dashboard/department-metrics';
import { ClientPortfolio } from '@/components/dashboard/client-portfolio';
import { ProjectHealth } from '@/components/dashboard/project-health';
import { OrganizationOverview } from '@/components/dashboard/organization-overview';
import { OrganizationPlanWidget } from '@/components/dashboard/organization-plan-widget';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { FocusPanel } from '@/components/dashboard/focus-panel';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { StickyBoard } from '@/components/dashboard/sticky-board';
import { UrgentProjects } from '@/components/dashboard/urgent-projects';
import { UpcomingItems } from '@/components/dashboard/upcoming-items';
import { UserWorkload } from '@/components/dashboard/user-workload';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ErrorState } from '@/components/ui/error-state';
import { SectionHeader } from '@/components/ui/section-header';
import { getDashboardData } from '@/lib/queries/dashboard';
import { getOrganizationContext } from '@/lib/queries/organization';
import { getClientDashboardItems } from '@/lib/queries/clients';
import { getOrganizationBillingSummary } from '@/lib/queries/billing';
import { getRecentActivitySummary } from '@/lib/queries/activity';
import { getWorkspaceOnboardingSummary } from '@/lib/queries/onboarding';
import { WorkspaceOnboarding } from '@/components/onboarding/workspace-onboarding';
import { PlanningCenter } from '@/components/planning/planning-center';
import { ControlTower } from '@/components/control-tower/control-tower';
import { getPlanningOverview } from '@/lib/queries/planning';
import { getControlTowerSummary } from '@/lib/queries/control-tower';

export default async function DashboardPage() {
  const [data, organizationContext, clientItems, billingSummary, activitySummary, onboardingSummary, planningSummary, controlTowerSummary] = await Promise.all([
    getDashboardData(),
    getOrganizationContext(),
    getClientDashboardItems(),
    getOrganizationBillingSummary(),
    getRecentActivitySummary(10),
    getWorkspaceOnboardingSummary(),
    getPlanningOverview(),
    getControlTowerSummary(),
  ]);

  if (!data) {
    return (
      <ErrorState
        title="No pudimos preparar tu dashboard"
        description="No encontramos el contexto de trabajo necesario para cargar tu resumen. Revisa tu sesión o vuelve a intentarlo más tarde."
        action={
          <Link href="/login">
            <Button>Ir al acceso</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-5">
      <SectionHeader
        eyebrow="Workspace"
        title="Dashboard"
        description="Tu vista principal para pendientes, proyectos, clientes y actividad reciente. Todo queda agrupado para decidir rápido qué atender primero."
        icon={<LayoutGrid className="h-5 w-5" />}
        actions={
          <>
            <Link href="/app/reports">
              <Button variant="secondary">Ver reportes</Button>
            </Link>
            <Link href="/app/calendar">
              <Button>Abrir calendario</Button>
            </Link>
          </>
        }
      />

      <Card className="bg-[linear-gradient(135deg,#06291d_0%,#0f172a_60%,#0f172a_100%)] text-white shadow-[0_24px_60px_rgba(15,23,42,0.25)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">Resumen rápido</p>
            <h2 className="mt-2 text-3xl font-bold">Todo lo importante en una sola vista</h2>
            <p className="mt-2 text-sm text-slate-300">Revisa pendientes, clientes y proyectos sin entrar a módulos complejos. La idea es que encuentres todo rápido.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[26px] bg-white/10 px-4 py-3 ring-1 ring-white/10">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-300">Pendientes</p>
              <p className="mt-2 text-3xl font-bold">{data.activeTasks ?? 0}</p>
            </div>
            <div className="rounded-[26px] bg-white/10 px-4 py-3 ring-1 ring-white/10">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-300">Proyectos</p>
              <p className="mt-2 text-3xl font-bold">{data.activeProjects ?? 0}</p>
            </div>
          </div>
        </div>
      </Card>

      {onboardingSummary ? <WorkspaceOnboarding summary={onboardingSummary} compact /> : null}
      <PlanningCenter summary={planningSummary} compact />
      <ControlTower summary={controlTowerSummary} compact />
      <BoardOverview activeProjects={data.activeProjects ?? 0} activeTasks={data.activeTasks ?? 0} completedTasks={data.completedTasks ?? 0} />
      <QuickActions />
      <Card className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700"><CalendarDays className="h-5 w-5" /></span>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Agenda semanal</h3>
            <p className="mt-1 text-sm text-slate-500">Abre un vistazo rápido por fechas para priorizar sin entrar al módulo de tareas.</p>
          </div>
        </div>
        <Link href="/app/calendar" className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">Abrir calendario</Link>
      </Card>
      <FocusPanel />
      <DeadlineLanes overdueTasks={data.overdueTasks ?? 0} dueSoonTasks={data.dueSoonTasks ?? 0} waitingTasks={data.waitingTasks ?? 0} />
      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <OrganizationOverview activeOrganization={organizationContext?.activeOrganization ?? null} organizations={organizationContext?.organizations ?? []} clientPermissions={organizationContext?.clientPermissions ?? []} />
        <OrganizationPlanWidget summary={billingSummary} />
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <DepartmentMetrics items={data.departmentMetrics ?? []} />
        <ProjectHealth activeProjects={data.activeProjects ?? 0} completedProjects={data.completedProjects ?? 0} collaborativeProjects={data.collaborativeProjects ?? 0} />
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <ClientMetrics items={data.clientMetrics ?? []} />
        <UserWorkload items={data.userWorkload ?? []} />
        <CollaborationMetrics items={data.collaborationMetrics ?? []} />
      </div>
      <UrgentProjects items={data.urgentProjects ?? []} />
      <ClientPortfolio items={clientItems} />
      <StickyBoard recentTasks={data.recentTasks ?? []} recentProjects={data.recentProjects ?? []} reminders={data.reminders ?? []} />
      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <RecentActivity summary={activitySummary} />
        <UpcomingItems />
      </div>
    </div>
  );
}
