import { Card } from "@/components/ui/card";

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
    { label: "Tareas activas", value: activeTasks },
    { label: "Proyectos activos", value: activeProjects },
    { label: "Tareas concluidas", value: completedTasks },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {items.map((item) => (
        <Card key={item.label}>
          <p className="text-sm text-slate-500">{item.label}</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">{item.value}</p>
        </Card>
      ))}
    </div>
  );
}
