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
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { StickyBoard } from '@/components/dashboard/sticky-board';
import { UrgentProjects } from '@/components/dashboard/urgent-projects';
import { UpcomingItems } from '@/components/dashboard/upcoming-items';
import { UserWorkload } from '@/components/dashboard/user-workload';
import { Card } from '@/components/ui/card';
import { getDashboardData } from '@/lib/queries/dashboard';
import { getOrganizationContext } from '@/lib/queries/organization';
import { getClientDashboardItems } from '@/lib/queries/clients';
import { getOrganizationBillingSummary } from '@/lib/queries/billing';

export default async function DashboardPage() {
  const [data, organizationContext, clientItems, billingSummary] = await Promise.all([getDashboardData(), getOrganizationContext(), getClientDashboardItems(), getOrganizationBillingSummary()]);

  return (
    <div className="space-y-4">
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
              <p className="mt-2 text-3xl font-bold">{data?.activeTasks ?? 0}</p>
            </div>
            <div className="rounded-[26px] bg-white/10 px-4 py-3 ring-1 ring-white/10">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-300">Proyectos</p>
              <p className="mt-2 text-3xl font-bold">{data?.activeProjects ?? 0}</p>
            </div>
          </div>
        </div>
      </Card>
      <BoardOverview activeProjects={data?.activeProjects ?? 0} activeTasks={data?.activeTasks ?? 0} completedTasks={data?.completedTasks ?? 0} />
      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <QuickActions />
        <DeadlineLanes overdueTasks={data?.overdueTasks ?? 0} dueSoonTasks={data?.dueSoonTasks ?? 0} waitingTasks={data?.waitingTasks ?? 0} />
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <OrganizationOverview activeOrganization={organizationContext?.activeOrganization ?? null} organizations={organizationContext?.organizations ?? []} clientPermissions={organizationContext?.clientPermissions ?? []} />
        <OrganizationPlanWidget summary={billingSummary} />
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <DepartmentMetrics items={data?.departmentMetrics ?? []} />
        <ProjectHealth activeProjects={data?.activeProjects ?? 0} completedProjects={data?.completedProjects ?? 0} collaborativeProjects={data?.collaborativeProjects ?? 0} />
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <ClientMetrics items={data?.clientMetrics ?? []} />
        <UserWorkload items={data?.userWorkload ?? []} />
        <CollaborationMetrics items={data?.collaborationMetrics ?? []} />
      </div>
      <UrgentProjects items={data?.urgentProjects ?? []} />
      <ClientPortfolio items={clientItems} />
      <StickyBoard recentTasks={data?.recentTasks ?? []} recentProjects={data?.recentProjects ?? []} reminders={data?.reminders ?? []} />
      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <RecentActivity />
        <UpcomingItems />
      </div>
    </div>
  );
}
