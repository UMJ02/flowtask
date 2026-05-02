export const dynamic = 'force-dynamic';

import { WorkspaceOnboarding } from '@/components/onboarding/workspace-onboarding';
import { getWorkspaceOnboardingSummary } from '@/lib/queries/onboarding';
import { safeServerCall } from '@/lib/runtime/safe-server';
import { EmptyState } from '@/components/ui/empty-state';
import { Rocket } from 'lucide-react';

export default async function OnboardingPage() {
  const summary = await safeServerCall('getWorkspaceOnboardingSummary', () => getWorkspaceOnboardingSummary(), null);

  if (!summary) {
    return (
      <EmptyState
        title="Iniciá sesión para configurar Flowtask"
        description="El centro de arranque necesita una cuenta individual activa para detectar si estás en modo personal u organización."
        icon={<Rocket className="h-7 w-7" />}
      />
    );
  }

  return <WorkspaceOnboarding summary={summary} />;
}
