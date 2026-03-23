import { ShieldAlert } from 'lucide-react';
import { RiskRadar } from '@/components/risk/risk-radar';
import { SectionHeader } from '@/components/ui/section-header';
import { getRiskRadarSummary } from '@/lib/queries/risk-radar';

export default async function RiskRadarPage() {
  const summary = await getRiskRadarSummary();

  return (
    <div className="space-y-4">
      <SectionHeader
        eyebrow="Workspace"
        title="Risk Radar"
        description="Una capa ejecutiva para ver dónde hay más exposición operativa: vencimientos, bloqueos, clientes bajo presión y departamentos con sobrecarga cercana."
        icon={<ShieldAlert className="h-5 w-5" />}
      />

      <RiskRadar summary={summary} />
    </div>
  );
}
