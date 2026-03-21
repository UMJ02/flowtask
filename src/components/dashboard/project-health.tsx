import { Card } from "@/components/ui/card";

export function ProjectHealth({ activeProjects, completedProjects, collaborativeProjects }: { activeProjects: number; completedProjects: number; collaborativeProjects: number; }) {
  const total = activeProjects + completedProjects;
  const completionRate = total ? Math.round((completedProjects / total) * 100) : 0;

  return (
    <Card className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Salud de proyectos</h2>
        <p className="text-sm text-slate-500">Progreso general y carga colaborativa del tablero.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Activos</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{activeProjects}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Completados</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{completedProjects}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Colaborativos</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{collaborativeProjects}</p>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">Tasa de cierre</span>
          <span className="font-semibold text-slate-900">{completionRate}%</span>
        </div>
        <div className="h-3 rounded-full bg-slate-100">
          <div className="h-3 rounded-full bg-slate-900" style={{ width: `${completionRate}%` }} />
        </div>
      </div>
    </Card>
  );
}
