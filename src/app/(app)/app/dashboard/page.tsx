import { BoardOverview } from "@/components/dashboard/board-overview";
import { CollaborationMetrics } from "@/components/dashboard/collaboration-metrics";
import { DeadlineLanes } from "@/components/dashboard/deadline-lanes";
import { ClientMetrics } from "@/components/dashboard/client-metrics";
import { DepartmentMetrics } from "@/components/dashboard/department-metrics";
import { ProjectHealth } from "@/components/dashboard/project-health";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { StickyBoard } from "@/components/dashboard/sticky-board";
import { UrgentProjects } from "@/components/dashboard/urgent-projects";
import { UpcomingItems } from "@/components/dashboard/upcoming-items";
import { UserWorkload } from "@/components/dashboard/user-workload";
import { getDashboardData } from "@/lib/queries/dashboard";

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-4">
      <BoardOverview
        activeProjects={data?.activeProjects ?? 0}
        activeTasks={data?.activeTasks ?? 0}
        completedTasks={data?.completedTasks ?? 0}
      />
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
