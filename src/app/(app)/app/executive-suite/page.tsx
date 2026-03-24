import { Gem } from 'lucide-react';
import { ExecutiveSuite } from '@/components/executive/executive-suite';
import { ErrorState } from '@/components/ui/error-state';
import { SectionHeader } from '@/components/ui/section-header';
import { getExecutiveSuiteSummary } from '@/lib/queries/executive-suite';

export default async function ExecutiveSuitePage() {
  const summary = await getExecutiveSuiteSummary();

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
      <ExecutiveSuite summary={summary} />
    </div>
  );
}
