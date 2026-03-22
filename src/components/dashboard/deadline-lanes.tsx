import { AlertTriangle, Clock3, KanbanSquare } from "lucide-react";

export function DeadlineLanes({
  overdueTasks,
  dueSoonTasks,
  waitingTasks,
}: {
  overdueTasks: number;
  dueSoonTasks: number;
  waitingTasks: number;
}) {
  const items = [
    {
      title: "Vencidas",
      value: overdueTasks,
      icon: AlertTriangle,
      description: "Ya vencidas",
      tint: 'bg-rose-50 text-rose-600'
    },
    {
      title: "Por vencer",
      value: dueSoonTasks,
      icon: Clock3,
      description: "Próximos 3 días",
      tint: 'bg-amber-50 text-amber-600'
    },
    {
      title: "En espera",
      value: waitingTasks,
      icon: KanbanSquare,
      description: "Pausadas o bloqueadas",
      tint: 'bg-slate-100 text-slate-700'
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.title} className="rounded-[24px] border border-slate-100 bg-slate-50 px-4 py-4 text-center">
            <div className={`mx-auto inline-flex h-11 w-11 items-center justify-center rounded-2xl ${item.tint}`}>
              <Icon className="h-5 w-5" />
            </div>
            <p className="mt-3 text-sm font-semibold text-slate-700">{item.title}</p>
            <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">{item.value}</p>
            <p className="mt-1 text-xs text-slate-500">{item.description}</p>
          </div>
        );
      })}
    </div>
  );
}
