import { AlertTriangle, Clock3, KanbanSquare } from "lucide-react";
import { Card } from "@/components/ui/card";

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
      description: "Tareas con deadline ya superado y todavía abiertas.",
    },
    {
      title: "Por vencer",
      value: dueSoonTasks,
      icon: Clock3,
      description: "Tareas que requieren revisión en los próximos 3 días.",
    },
    {
      title: "En espera",
      value: waitingTasks,
      icon: KanbanSquare,
      description: "Pendientes bloqueados o esperando respuesta.",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.title} className="border border-slate-100">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{item.title}</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{item.value}</p>
                <p className="mt-2 text-sm text-slate-600">{item.description}</p>
              </div>
              <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
