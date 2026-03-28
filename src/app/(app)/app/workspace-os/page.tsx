import { Cpu } from 'lucide-react';
import { SectionHeader } from '@/components/ui/section-header';
import { WorkspaceOperatingSystem } from '@/components/os/workspace-operating-system';
import { getWorkspaceOperatingSystemSummary } from '@/lib/queries/workspace-operating-system';
import { ErrorState } from '@/components/ui/error-state';

export default async function WorkspaceOperatingSystemPage() {
  const summary = await getWorkspaceOperatingSystemSummary();

  if (!summary) {
    return (
      <ErrorState
        title="No pudimos armar el workspace OS"
        description="Hace falta contexto del workspace para unificar base, planeación, ejecución e insights."
      />
    );
  }

  return (
    <div className="space-y-4">
      <SectionHeader
        eyebrow="Legacy"
        title="Workspace OS"
        description="Vista heredada de operación consolidada. Puedes usar Insights para una lectura más simple."
        icon={<Cpu className="h-5 w-5" />}
      />
      <WorkspaceOperatingSystem summary={summary} />
    </div>
  );
}
