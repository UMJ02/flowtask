import { Card } from "@/components/ui/card";

export function ProjectHealthStrip({ tasks }: { tasks: Array<{ status?: string | null; due_date?: string | null }> }) {
  const today = new Date().toISOString().slice(0, 10);
  const total = tasks.length;
  const completed = tasks.filter((item) => item.status === "concluido").length;
  const active = tasks.filter((item) => item.status !== "concluido").length;
  const overdue = tasks.filter((item) => Boolean(item.due_date && item.due_date < today && item.status !== "concluido")).length;

  const cards = [
    { label: "Tareas totales", value: total },
    { label: "Activas", value: active },
    { label: "Completadas", value: completed },
    { label: "Vencidas", value: overdue },
  ];

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label} className="rounded-[24px] border border-slate-200 bg-white px-4 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{card.label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{card.value}</p>
        </Card>
      ))}
    </div>
  );
}
