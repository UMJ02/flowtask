import { Compass } from 'lucide-react';
import { PlanningCenter } from '@/components/planning/planning-center';
import { SectionHeader } from '@/components/ui/section-header';
import { getPlanningOverview } from '@/lib/queries/planning';

export default async function PlanningPage() {
  const summary = await getPlanningOverview();

  return (
    <div className="space-y-4">
      <SectionHeader
        eyebrow="Planning"
        title="Centro de planificación"
        description="Una lectura simple para anticiparte a vencimientos, balancear carga y decidir dónde poner foco en los próximos 14 días."
        icon={<Compass className="h-5 w-5" />}
      />
      <PlanningCenter summary={summary} />
    </div>
  );
}
