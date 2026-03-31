import { CheckCircle2, ClipboardList, FolderKanban } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function BoardOverview({
  activeTasks,
  activeProjects,
  completedTasks,
}: {
  activeTasks: number;
  activeProjects: number;
  completedTasks: number;
}) {
  const items = [
    { label: 'Tareas por atender', description: 'Lo que sigue pendiente hoy.', value: activeTasks, icon: ClipboardList },
    { label: 'Proyectos en marcha', description: 'Trabajo activo del equipo.', value: activeProjects, icon: FolderKanban },
    { label: 'Tareas resueltas', description: 'Lo que ya quedó listo.', value: completedTasks, icon: CheckCircle2 },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.label} className="overflow-hidden">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                <p className="mt-1 text-sm text-slate-500">{item.description}</p>
              </div>
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <Icon className="h-5 w-5" />
              </span>
            </div>
            <p className="mt-5 text-4xl font-bold tracking-tight text-slate-900">{item.value}</p>
          </Card>
        );
      })}
    </div>
  );
}
