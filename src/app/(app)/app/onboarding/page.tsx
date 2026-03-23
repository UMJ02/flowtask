import { Rocket } from "lucide-react";
import { WorkspaceOnboarding } from "@/components/onboarding/workspace-onboarding";
import { ErrorState } from "@/components/ui/error-state";
import { SectionHeader } from "@/components/ui/section-header";
import { getWorkspaceOnboardingSummary } from "@/lib/queries/onboarding";

export default async function OnboardingPage() {
  const summary = await getWorkspaceOnboardingSummary();

  if (!summary) {
    return (
      <ErrorState
        title="No pudimos preparar el centro de onboarding"
        description="Necesitamos una sesión activa y un contexto de workspace válido para mostrar este panel."
      />
    );
  }

  return (
    <div className="space-y-4">
      <SectionHeader
        eyebrow="Launchpad"
        title="Onboarding"
        description="Centro de arranque para cerrar estructura, operación y automatización del workspace sin improvisar."
        icon={<Rocket className="h-5 w-5" />}
      />
      <WorkspaceOnboarding summary={summary} />
    </div>
  );
}
