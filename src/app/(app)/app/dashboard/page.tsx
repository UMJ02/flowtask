import { BoardOverview } from '@/components/dashboard/board-overview';
import { ClientMetrics } from '@/components/dashboard/client-metrics';
import { CollaborationMetrics } from '@/components/dashboard/collaboration-metrics';
import { DashboardHero } from '@/components/dashboard/dashboard-hero';
import { DepartmentMetrics } from '@/components/dashboard/department-metrics';
import { FocusPanel } from '@/components/dashboard/focus-panel';
import { InteractiveDashboardBoard } from '@/components/dashboard/interactive-dashboard-board';
import { ProjectHealth } from '@/components/dashboard/project-health';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { UrgentProjects } from '@/components/dashboard/urgent-projects';
import { UserWorkload } from '@/components/dashboard/user-workload';
import { WorkspaceQuickActions } from '@/components/workspace/quick-actions';
import { getRecentActivitySummary } from '@/lib/queries/activity';
import { getDashboardData } from '@/lib/queries/dashboard';
import { safeServerCall } from '@/lib/runtime/safe-server';

export default async function DashboardPage() {
  const [summary, activitySummary] = await Promise.all([
    safeServerCall('getDashboardData', () => getDashboardData(), null),
    safeServerCall('getRecentActivitySummary', () => getRecentActivitySummary(12), null),
  ]);

  return (
    <div className="space-y-5 lg:space-y-6">
      <DashboardHero
        activeTasks={summary?.activeTasks ?? 0}
        activeProjects={summary?.activeProjects ?? 0}
        waitingTasks={summary?.waitingTasks ?? 0}
        overdueTasks={summary?.overdueTasks ?? 0}
        dueSoonTasks={summary?.dueSoonTasks ?? 0}
      />

      <WorkspaceQuickActions />

      <BoardOverview
        activeTasks={summary?.activeTasks ?? 0}
        activeProjects={summary?.activeProjects ?? 0}
        completedTasks={summary?.completedTasks ?? 0}
      />

      <FocusPanel />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.85fr)]">
        <InteractiveDashboardBoard />
        <div className="space-y-5">
          <ProjectHealth
            activeProjects={summary?.activeProjects ?? 0}
            completedProjects={summary?.completedProjects ?? 0}
            collaborativeProjects={summary?.collaborativeProjects ?? 0}
          />
          <UrgentProjects items={summary?.urgentProjects ?? []} />
          <RecentActivity summary={activitySummary} />
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <DepartmentMetrics items={summary?.departmentMetrics ?? []} />
        <ClientMetrics items={summary?.clientMetrics ?? []} />
        <UserWorkload items={summary?.userWorkload ?? []} />
        <CollaborationMetrics items={summary?.collaborationMetrics ?? []} />
      </div>
    </div>
  );
}
