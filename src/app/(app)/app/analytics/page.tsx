export const dynamic = 'force-dynamic';

import { AnalyticsOverview } from '@/components/analytics/analytics-overview';
import { getWorkspaceAnalyticsSummary } from '@/lib/queries/analytics';
import { safeServerCall } from '@/lib/runtime/safe-server';

export default async function AnalyticsPage() {
  const summary = await safeServerCall('getWorkspaceAnalyticsSummary', () => getWorkspaceAnalyticsSummary(), null);

  return summary ? <AnalyticsOverview summary={summary} /> : null;
}
