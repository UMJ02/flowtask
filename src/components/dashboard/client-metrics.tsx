import { Card } from "@/components/ui/card";

interface ClientMetric {
  name: string;
  total: number;
}

export function ClientMetrics({ items }: { items: ClientMetric[] }) {
  return (
    <Card className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Clientes con más carga</h2>
        <p className="text-sm text-slate-500">Tareas activas agrupadas por cliente para priorizar seguimiento.</p>
      </div>
      <div className="space-y-3">
        {items.length ? (
          items.map((item, index) => (
            <div key={`${item.name}-${index}`} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
              <div>
                <p className="font-medium text-slate-900">{item.name}</p>
                <p className="text-xs text-slate-500">Tareas activas</p>
              </div>
              <div className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-900 ring-1 ring-slate-200">
                {item.total}
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500">Aún no hay suficientes clientes activos para mostrar un ranking.</p>
        )}
      </div>
    </Card>
  );
}
