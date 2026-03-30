import { WorkspaceOnboarding } from '@/components/onboarding/workspace-onboarding';
import { getWorkspaceOnboardingSummary } from '@/lib/queries/onboarding';
import { safeServerCall } from '@/lib/runtime/safe-server';

export default async function OnboardingPage() {
  const summary = await safeServerCall('getWorkspaceOnboardingSummary', () => getWorkspaceOnboardingSummary(), null);
  return summary ? <WorkspaceOnboarding summary={summary} /> : null;
}
