import { BrainCircuit } from 'lucide-react';
import { WorkspaceIntelligence } from '@/components/intelligence/workspace-intelligence';
import { SectionHeader } from '@/components/ui/section-header';
import { getWorkspaceIntelligenceSummary } from '@/lib/queries/workspace-intelligence';

export default async function WorkspaceIntelligencePage() {
  const summary = await getWorkspaceIntelligenceSummary();

  return (
    <div className="space-y-4">
      <SectionHeader
        eyebrow="Executive layer"
        title="Workspace Intelligence"
        description="La vista que cruza onboarding, planning, control tower, risk radar y reportes para ayudarte a decidir con más contexto."
        icon={<BrainCircuit className="h-5 w-5" />}
      />

      <WorkspaceIntelligence summary={summary} />
    </div>
  );
}
