import { InteractiveDashboardBoard } from '@/components/dashboard/interactive-dashboard-board';
import { BoardOverview } from '@/components/dashboard/board-overview';
import { WorkspaceQuickActions } from '@/components/workspace/quick-actions';
import { safeServerCall } from '@/lib/runtime/safe-server';
import { getDashboardData } from '@/lib/queries/dashboard';

export default async function DashboardPage() {
  const summary = await safeServerCall('getDashboardData', () => getDashboardData(), null);

  return (
    <div className="space-y-4">
      <WorkspaceQuickActions />
      <BoardOverview
        activeTasks={summary?.activeTasks ?? 0}
        activeProjects={summary?.activeProjects ?? 0}
        completedTasks={summary?.completedTasks ?? 0}
      />
      <InteractiveDashboardBoard />
    </div>
  );
}
