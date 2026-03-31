export const dynamic = 'force-dynamic';

import { RiskRadar } from '@/components/risk/risk-radar';
import { getRiskRadarSummary } from '@/lib/queries/risk-radar';
import { safeServerCall } from '@/lib/runtime/safe-server';

export default async function RiskRadarPage() {
  const summary = await safeServerCall('getRiskRadarSummary', () => getRiskRadarSummary(), null);
  return summary ? <RiskRadar summary={summary} /> : null;
}
