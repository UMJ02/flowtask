import { Card } from "@/components/ui/card";

export function ProjectHealth({ activeProjects, completedProjects, collaborativeProjects }: { activeProjects: number; completedProjects: number; collaborativeProjects: number; }) {
  const total = activeProjects + completedProjects;
  const completionRate = total ? Math.round((completedProjects / total) * 100) : 0;

  const stats = [
    { label: "Activos", value: activeProjects },
    { label: "Completados", value: completedProjects },
    { label: "Colaborativos", value: collaborativeProjects },
  ];

  return (
    <Card className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Salud de proyectos</h2>
        <p className="text-sm text-slate-500">Una lectura rápida para saber cómo va el trabajo del equipo.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {stats.map((item) => (
          <div key={item.label} className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-500">{item.label}</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{item.value}</p>
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="text-slate-600">Tasa de cierre</span>
          <span className="font-semibold text-slate-900">{completionRate}%</span>
        </div>
        <div className="h-3 rounded-full bg-slate-100">
          <div className="h-3 rounded-full bg-slate-900 transition-all" style={{ width: `${completionRate}%` }} />
        </div>
      </div>
    </Card>
  );
}
