import { Card } from "@/components/ui/card";

interface DepartmentMetric {
  code: string;
  name: string;
  total: number;
}

export function DepartmentMetrics({ items }: { items: DepartmentMetric[] }) {
  return (
    <Card className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Carga por departamento</h2>
        <p className="text-sm text-slate-500">Resumen de tareas activas agrupadas para lectura de jefatura.</p>
      </div>
      <div className="space-y-3">
        {items.length ? (
          items.map((item) => (
            <div key={item.code} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">{item.name}</span>
                <span className="text-slate-500">{item.total}</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-slate-900"
                  style={{ width: `${Math.max(8, Math.min(100, item.total * 12))}%` }}
                />
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500">Aún no hay datos suficientes para mostrar métricas.</p>
        )}
      </div>
    </Card>
  );
}
