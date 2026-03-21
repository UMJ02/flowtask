import { Card } from "@/components/ui/card";

interface ProjectClientMetric {
  name: string;
  total: number;
  completed: number;
  active: number;
}

export function ProjectClientMetrics({ items }: { items: ProjectClientMetric[] }) {
  return (
    <Card>
      <h3 className="text-lg font-semibold text-slate-900">Métricas por cliente</h3>
      <p className="mt-1 text-sm text-slate-500">Carga de tareas dentro de este proyecto agrupada por cliente.</p>
      <div className="mt-4 space-y-3">
        {items.length ? items.map((item) => (
          <div key={item.name} className="rounded-2xl bg-slate-50 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-slate-900">{item.name}</p>
                <p className="text-xs text-slate-500">{item.total} tareas registradas</p>
              </div>
              <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                {item.active} activas / {item.completed} concluidas
              </div>
            </div>
          </div>
        )) : (
          <p className="text-sm text-slate-500">Aún no hay suficientes tareas con cliente para mostrar métricas.</p>
        )}
      </div>
    </Card>
  );
}
