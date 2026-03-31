import { ExecutiveSuite } from '@/components/executive/executive-suite';
import { getExecutiveSuiteSummary } from '@/lib/queries/executive-suite';
import { safeServerCall } from '@/lib/runtime/safe-server';

export default async function ExecutiveSuitePage() {
  const summary = await safeServerCall('getExecutiveSuiteSummary', () => getExecutiveSuiteSummary(), null);
  return summary ? <ExecutiveSuite summary={summary} /> : null;
}
