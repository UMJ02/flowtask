import { WorkspaceIntelligence } from '@/components/intelligence/workspace-intelligence';
import { getWorkspaceIntelligenceSummary } from '@/lib/queries/workspace-intelligence';
import { safeServerCall } from '@/lib/runtime/safe-server';

export default async function IntelligencePage() {
  const summary = await safeServerCall('getWorkspaceIntelligenceSummary', () => getWorkspaceIntelligenceSummary(), null);
  return summary ? <WorkspaceIntelligence summary={summary} /> : null;
}
