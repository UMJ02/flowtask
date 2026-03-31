export const dynamic = 'force-dynamic';

import { OperationsOverview } from '@/components/reports/operations-overview';
import { getReportsOverview } from '@/lib/queries/reports';
import { safeServerCall } from '@/lib/runtime/safe-server';

export default async function ReportsPage() {
  const summary = await safeServerCall('getReportsOverview', () => getReportsOverview(), null);
  return summary ? <OperationsOverview summary={summary} /> : null;
}
