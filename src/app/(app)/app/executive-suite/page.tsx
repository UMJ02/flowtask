import { Gem } from 'lucide-react';
import { ExecutiveSuite } from '@/components/executive/executive-suite';
import { ErrorState } from '@/components/ui/error-state';
import { SectionHeader } from '@/components/ui/section-header';
import { ModuleConsolidationBanner } from '@/components/intelligence/module-consolidation-banner';
import { getIntelligenceModule } from '@/lib/intelligence/module-registry';
import { intelligenceRoute, reportsPrintRoute } from '@/lib/navigation/routes';
import { getExecutiveSuiteSummary } from '@/lib/queries/executive-suite';

export default async function ExecutiveSuitePage() {
  const summary = await getExecutiveSuiteSummary();
  const moduleDefinition = getIntelligenceModule('executive-suite');

  if (!summary) {
    return (
      <ErrorState
        title="No pudimos preparar el executive suite"
        description="Hace falta contexto del workspace para unir operating score, ejecución, riesgo e intelligence."
      />
    );
  }

  return (
    <div className="space-y-4">
      <SectionHeader
        eyebrow="Executive layer"
        title="Executive Suite"
        description="La capa de gobierno semanal para revisar prioridades, watchlist y decisiones sin saltar entre módulos."
        icon={<Gem className="h-5 w-5" />}
      />
      <ModuleConsolidationBanner
        module={moduleDefinition}
        title="Executive Suite se mantiene como capa de soporte ejecutivo"
        description="Sirve para reuniones de seguimiento y gobierno semanal, pero ya no compite con el punto de entrada principal de intelligence."
        primaryHref={intelligenceRoute()}
        primaryLabel="Abrir Intelligence Hub"
        secondaryHref={reportsPrintRoute('executive-suite')}
        secondaryLabel="Abrir PDF"
      />

      <ExecutiveSuite summary={summary} />
    </div>
  );
}
