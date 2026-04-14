export const dynamic = 'force-dynamic';

import { DashboardHero } from '@/components/dashboard/dashboard-hero';
import { ProjectHealth } from '@/components/dashboard/project-health';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { UrgentProjects } from '@/components/dashboard/urgent-projects';
import { IntelligentAttentionAssistant } from '@/components/dashboard/intelligent-attention-assistant';
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
      {summary ? (
        <IntelligentAttentionAssistant
          workspaceKey={summary.workspaceKey}
          workspaceLabel={summary.workspaceKey.startsWith('organization:') ? 'workspace de organización' : 'workspace personal'}
          signals={summary.intelligentSignals}
        />
      ) : null}

      <DashboardHero
        activeTasks={summary?.activeTasks ?? 0}
        activeProjects={summary?.activeProjects ?? 0}
        waitingTasks={summary?.waitingTasks ?? 0}
        overdueTasks={summary?.overdueTasks ?? 0}
        dueSoonTasks={summary?.dueSoonTasks ?? 0}
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(340px,0.65fr)]">
        <ProjectHealth
          activeProjects={summary?.activeProjects ?? 0}
          completedProjects={summary?.completedProjects ?? 0}
          collaborativeProjects={summary?.collaborativeProjects ?? 0}
        />

        <UrgentProjects items={summary?.urgentProjects ?? []} />
      </div>

      <RecentActivity summary={activitySummary} />
    </div>
  );
}
