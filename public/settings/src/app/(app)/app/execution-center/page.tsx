export const dynamic = 'force-dynamic';

import { ExecutionCenter } from '@/components/execution/execution-center';
import { getExecutionCenterSummary } from '@/lib/queries/execution-center';
import { safeServerCall } from '@/lib/runtime/safe-server';

export default async function ExecutionCenterPage() {
  const summary = await safeServerCall('getExecutionCenterSummary', () => getExecutionCenterSummary(), null);
  return summary ? <ExecutionCenter summary={summary} /> : null;
}
