import { PlanningCenter } from '@/components/planning/planning-center';
import { getPlanningOverview } from '@/lib/queries/planning';
import { safeServerCall } from '@/lib/runtime/safe-server';

export default async function PlanningPage() {
  const summary = await safeServerCall('getPlanningOverview', () => getPlanningOverview(), null);
  return summary ? <PlanningCenter summary={summary} /> : null;
}
