export const dynamic = 'force-dynamic';

import { WorkspaceOperatingSystem } from '@/components/os/workspace-operating-system';
import { getWorkspaceOperatingSystemSummary } from '@/lib/queries/workspace-operating-system';
import { safeServerCall } from '@/lib/runtime/safe-server';

export default async function WorkspaceOSPage() {
  const summary = await safeServerCall('getWorkspaceOperatingSystemSummary', () => getWorkspaceOperatingSystemSummary(), null);
  return summary ? <WorkspaceOperatingSystem summary={summary} /> : null;
}
