import { PlayCircle } from 'lucide-react';
import { ExecutionCenter } from '@/components/execution/execution-center';
import { SectionHeader } from '@/components/ui/section-header';
import { getExecutionCenterSummary } from '@/lib/queries/execution-center';

export default async function ExecutionCenterPage() {
  const summary = await getExecutionCenterSummary();

  return (
    <div className="space-y-4">
      <SectionHeader
        eyebrow="Execution layer"
        title="Execution Center"
        description="La vista que transforma señales, riesgo y planeación en un frente accionable para ejecutar con claridad."
        icon={<PlayCircle className="h-5 w-5" />}
      />

      <ExecutionCenter summary={summary} />
    </div>
  );
}
