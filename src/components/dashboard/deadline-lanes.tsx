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
      description: "Pendientes con fecha ya vencida.",
    },
    {
      title: "Por vencer",
      value: dueSoonTasks,
      icon: Clock3,
      description: "Requieren atención en los próximos 3 días.",
    },
    {
      title: "En espera",
      value: waitingTasks,
      icon: KanbanSquare,
      description: "Quedaron pausadas o esperan respuesta.",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.title} className="border border-slate-100 p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-700">{item.title}</p>
                  <div className="shrink-0 rounded-2xl bg-slate-100 p-2.5 text-slate-700">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <p className="mt-3 text-4xl font-bold tracking-tight text-slate-900">{item.value}</p>
                <p className="mt-2 max-w-[22ch] text-sm leading-6 text-slate-600">{item.description}</p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
