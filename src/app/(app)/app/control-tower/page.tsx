import { Radar } from 'lucide-react';
import { SectionHeader } from '@/components/ui/section-header';
import { ControlTower } from '@/components/control-tower/control-tower';
import { ModuleConsolidationBanner } from '@/components/intelligence/module-consolidation-banner';
import { getIntelligenceModule } from '@/lib/intelligence/module-registry';
import { intelligenceRoute } from '@/lib/navigation/routes';
import { getControlTowerSummary } from '@/lib/queries/control-tower';

export default async function ControlTowerPage() {
  const summary = await getControlTowerSummary();
  const moduleDefinition = getIntelligenceModule('control-tower');

  return (
    <div className="space-y-4">
      <SectionHeader
        eyebrow="Workspace"
        title="Control Tower"
        description="Tu centro de control operativo para decidir rápido qué mover primero, qué cliente revisar y dónde hay más presión de ejecución."
        icon={<Radar className="h-5 w-5" />}
      />

      <ModuleConsolidationBanner
        module={moduleDefinition}
        title="Control Tower queda como lectura táctica complementaria"
        description="Úsalo cuando necesites una vista táctica específica. Para la lectura consolidada del producto entra por Intelligence Hub."
        primaryHref={intelligenceRoute()}
        primaryLabel="Abrir Intelligence Hub"
      />

      <ControlTower summary={summary} />
    </div>
  );
}
