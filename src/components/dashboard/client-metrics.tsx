import { Card } from "@/components/ui/card";

interface ClientMetric {
  name: string;
  total: number;
  tasks?: number;
  projects?: number;
  completed?: number;
}

export function ClientMetrics({ items }: { items: ClientMetric[] }) {
  return (
    <Card className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Lectura por cliente</h2>
        <p className="text-sm text-slate-500">Combina tareas y proyectos para detectar clientes con mayor carga y seguimiento.</p>
      </div>
      <div className="space-y-3">
        {items.length ? (
          items.map((item, index) => (
            <div key={`${item.name}-${index}`} className="rounded-2xl bg-slate-50 px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-900">{item.name}</p>
                  <p className="text-xs text-slate-500">{item.tasks ?? 0} tareas · {item.projects ?? 0} proyectos</p>
                </div>
                <div className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-900 ring-1 ring-slate-200">
                  {item.total}
                </div>
              </div>
              <p className="mt-2 text-xs text-slate-500">Elementos cerrados: {item.completed ?? 0}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500">Aún no hay suficientes clientes activos para mostrar un ranking.</p>
        )}
      </div>
    </Card>
  );
}
