import { InteractiveDashboardBoard } from '@/components/dashboard/interactive-dashboard-board';
import { Card } from '@/components/ui/card';

export default function PizarraPage() {
  return (
    <div className="space-y-5 lg:space-y-6">
      <Card className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">Modo pizarra</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Pizarra interactiva</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-500">
            Abre tu tablero visual en una vista dedicada para mover tareas, revisar notas rápidas y enfocarte en el flujo del día.
          </p>
        </div>
      </Card>

      <InteractiveDashboardBoard />
    </div>
  );
}
