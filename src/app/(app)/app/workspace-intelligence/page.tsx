import { BrainCircuit } from 'lucide-react';
import { ModuleConsolidationBanner } from '@/components/intelligence/module-consolidation-banner';
import { WorkspaceIntelligence } from '@/components/intelligence/workspace-intelligence';
import { SectionHeader } from '@/components/ui/section-header';
import { getIntelligenceModule } from '@/lib/intelligence/module-registry';
import { intelligenceRoute, reportsPrintRoute } from '@/lib/navigation/routes';
import { getWorkspaceIntelligenceSummary } from '@/lib/queries/workspace-intelligence';

export default async function WorkspaceIntelligencePage() {
  const summary = await getWorkspaceIntelligenceSummary();
  const moduleDefinition = getIntelligenceModule('workspace-intelligence');

  return (
    <div className="space-y-4">
      <SectionHeader
        eyebrow="Executive layer"
        title="Workspace Intelligence"
        description="La vista que cruza onboarding, planning, control tower, risk radar y reportes para ayudarte a decidir con más contexto."
        icon={<BrainCircuit className="h-5 w-5" />}
      />

      <ModuleConsolidationBanner
        module={moduleDefinition}
        title="Esta vista sigue disponible, pero ya no es la entrada principal"
        description="Para la lectura consolidada usa Intelligence Hub. Esta pantalla se conserva por compatibilidad mientras termina la migración del flujo ejecutivo."
        primaryHref={intelligenceRoute()}
        primaryLabel="Abrir Intelligence Hub"
        secondaryHref={reportsPrintRoute('intelligence')}
        secondaryLabel="Abrir PDF"
      />

      <WorkspaceIntelligence summary={summary} />
    </div>
  );
}
