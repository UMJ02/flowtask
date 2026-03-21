import { BoardOverview } from "@/components/dashboard/board-overview";
import { CollaborationMetrics } from "@/components/dashboard/collaboration-metrics";
import { DeadlineLanes } from "@/components/dashboard/deadline-lanes";
import { ClientMetrics } from "@/components/dashboard/client-metrics";
import { DepartmentMetrics } from "@/components/dashboard/department-metrics";
import { ClientPortfolio } from "@/components/dashboard/client-portfolio";
import { ProjectHealth } from "@/components/dashboard/project-health";
import { OrganizationOverview } from "@/components/dashboard/organization-overview";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { StickyBoard } from "@/components/dashboard/sticky-board";
import { UrgentProjects } from "@/components/dashboard/urgent-projects";
import { UpcomingItems } from "@/components/dashboard/upcoming-items";
import { UserWorkload } from "@/components/dashboard/user-workload";
import { getDashboardData } from "@/lib/queries/dashboard";
import { getOrganizationContext } from "@/lib/queries/organization";
import { getClientDashboardItems } from "@/lib/queries/clients";

export default async function DashboardPage() {
  const [data, organizationContext, clientItems] = await Promise.all([getDashboardData(), getOrganizationContext(), getClientDashboardItems()]);

  return (
    <div className="space-y-4">
      <BoardOverview
        activeProjects={data?.activeProjects ?? 0}
        activeTasks={data?.activeTasks ?? 0}
        completedTasks={data?.completedTasks ?? 0}
      />
      <OrganizationOverview activeOrganization={organizationContext?.activeOrganization ?? null} organizations={organizationContext?.organizations ?? []} clientPermissions={organizationContext?.clientPermissions ?? []} />
      <DeadlineLanes
        overdueTasks={data?.overdueTasks ?? 0}
        dueSoonTasks={data?.dueSoonTasks ?? 0}
        waitingTasks={data?.waitingTasks ?? 0}
      />
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <DepartmentMetrics items={data?.departmentMetrics ?? []} />
        <ProjectHealth
          activeProjects={data?.activeProjects ?? 0}
          completedProjects={data?.completedProjects ?? 0}
          collaborativeProjects={data?.collaborativeProjects ?? 0}
        />
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <ClientMetrics items={data?.clientMetrics ?? []} />
        <UserWorkload items={data?.userWorkload ?? []} />
        <CollaborationMetrics items={data?.collaborationMetrics ?? []} />
      </div>
      <UrgentProjects items={data?.urgentProjects ?? []} />
      <ClientPortfolio items={clientItems} />
      <StickyBoard
        recentTasks={data?.recentTasks ?? []}
        recentProjects={data?.recentProjects ?? []}
        reminders={data?.reminders ?? []}
      />
      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <QuickActions />
          <RecentActivity />
        </div>
        <UpcomingItems />
      </div>
    </div>
  );
}
