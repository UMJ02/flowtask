import { Radar } from 'lucide-react';
import { SectionHeader } from '@/components/ui/section-header';
import { ControlTower } from '@/components/control-tower/control-tower';
import { getControlTowerSummary } from '@/lib/queries/control-tower';

export default async function ControlTowerPage() {
  const summary = await getControlTowerSummary();

  return (
    <div className="space-y-4">
      <SectionHeader
        eyebrow="Workspace"
        title="Control Tower"
        description="Tu centro de control operativo para decidir rápido qué mover primero, qué cliente revisar y dónde hay más presión de ejecución."
        icon={<Radar className="h-5 w-5" />}
      />

      <ControlTower summary={summary} />
    </div>
  );
}
