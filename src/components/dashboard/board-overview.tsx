import { ArrowUpRight, CheckCircle2, ClipboardList, FolderKanban } from 'lucide-react';
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
    {
      label: 'Tareas por atender',
      description: 'Lo que sigue pendiente hoy.',
      value: activeTasks,
      icon: ClipboardList,
      accent: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
      helper: activeTasks > 0 ? 'flujo activo' : 'bandeja limpia',
    },
    {
      label: 'Proyectos en marcha',
      description: 'Trabajo activo del equipo.',
      value: activeProjects,
      icon: FolderKanban,
      accent: 'bg-sky-50 text-sky-700 ring-sky-100',
      helper: activeProjects > 0 ? 'seguimiento en curso' : 'sin frentes abiertos',
    },
    {
      label: 'Tareas resueltas',
      description: 'Lo que ya quedó listo.',
      value: completedTasks,
      icon: CheckCircle2,
      accent: 'bg-violet-50 text-violet-700 ring-violet-100',
      helper: completedTasks > 0 ? 'avance acumulado' : 'aún sin cierres',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.label} className="rounded-[24px] border border-slate-200/85 p-5 shadow-[0_14px_30px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(15,23,42,0.08)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 ring-1 ring-slate-200">
                  {item.helper}
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-900">{item.label}</p>
                <p className="mt-1 text-sm text-slate-500">{item.description}</p>
              </div>
              <span className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ring-1 ${item.accent}`}>
                <Icon className="h-5 w-5" />
              </span>
            </div>
            <div className="mt-5 flex items-end justify-between gap-3">
              <p className="text-4xl font-bold tracking-tight text-slate-900">{item.value}</p>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500">
                visión rápida
                <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
