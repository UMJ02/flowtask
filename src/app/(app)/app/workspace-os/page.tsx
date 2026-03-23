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
        description="Hace falta contexto del workspace para unificar onboarding, planning, execution e intelligence."
      />
    );
  }

  return (
    <div className="space-y-4">
      <SectionHeader
        eyebrow="Workspace suite"
        title="Workspace OS"
        description="La capa ejecutiva que amarra base, planeación, ejecución y riesgo para operar el workspace como un solo sistema."
        icon={<Cpu className="h-5 w-5" />}
        badge={{
          label: `${summary.kpis.operatingScore}% operating score`,
          tone: summary.kpis.operatingScore >= 75 ? 'success' : summary.kpis.operatingScore >= 55 ? 'warning' : 'danger',
        }}
      />
      <WorkspaceOperatingSystem summary={summary} />
    </div>
  );
}
