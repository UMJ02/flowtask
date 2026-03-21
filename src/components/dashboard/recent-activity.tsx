import { Card } from "@/components/ui/card";

export function RecentActivity() {
  const events = [
    "Comentario agregado a tarea de mercadeo",
    "Proyecto compartido por link con jefatura",
    "Tarea concluida y movida a finalizadas",
  ];

  return (
    <Card>
      <h2 className="text-lg font-semibold text-slate-900">Actividad reciente</h2>
      <div className="mt-4 space-y-3">
        {events.map((event) => (
          <div key={event} className="rounded-2xl border border-slate-100 px-4 py-3 text-sm text-slate-600">
            {event}
          </div>
        ))}
      </div>
    </Card>
  );
}
