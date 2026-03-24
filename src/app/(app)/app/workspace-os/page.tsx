import { Cpu } from 'lucide-react';
import { SectionHeader } from '@/components/ui/section-header';
import { WorkspaceOperatingSystem } from '@/components/os/workspace-operating-system';
import { ModuleConsolidationBanner } from '@/components/intelligence/module-consolidation-banner';
import { getIntelligenceModule } from '@/lib/intelligence/module-registry';
import { intelligenceRoute, reportsPrintRoute } from '@/lib/navigation/routes';
import { getWorkspaceOperatingSystemSummary } from '@/lib/queries/workspace-operating-system';
import { ErrorState } from '@/components/ui/error-state';

export default async function WorkspaceOperatingSystemPage() {
  const summary = await getWorkspaceOperatingSystemSummary();
  const moduleDefinition = getIntelligenceModule('workspace-os');

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
      <ModuleConsolidationBanner
        module={moduleDefinition}
        title="Workspace OS queda como compatibilidad, no como flujo principal"
        description="La lectura principal ahora vive en Intelligence Hub. Conservamos esta vista para no romper accesos anteriores mientras cerramos la migración."
        primaryHref={intelligenceRoute()}
        primaryLabel="Abrir Intelligence Hub"
        secondaryHref={reportsPrintRoute('executive-suite')}
        secondaryLabel="Abrir Executive PDF"
      />

      <WorkspaceOperatingSystem summary={summary} />
    </div>
  );
}
