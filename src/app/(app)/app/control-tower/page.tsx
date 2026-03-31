import { ControlTower } from '@/components/control-tower/control-tower';
import { getControlTowerSummary } from '@/lib/queries/control-tower';
import { safeServerCall } from '@/lib/runtime/safe-server';

export default async function ControlTowerPage() {
  const summary = await safeServerCall('getControlTowerSummary', () => getControlTowerSummary(), null);
  return summary ? <ControlTower summary={summary} /> : null;
}
