import { Card } from "@/components/ui/card";

interface UserWorkloadItem {
  name: string;
  total: number;
}

export function UserWorkload({ items }: { items: UserWorkloadItem[] }) {
  return (
    <Card className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Carga por responsable</h2>
        <p className="text-sm text-slate-500">Responsables con más tareas activas asignadas en este momento.</p>
      </div>
      <div className="space-y-3">
        {items.length ? (
          items.map((item, index) => (
            <div key={`${item.name}-${index}`} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
              <div>
                <p className="font-medium text-slate-900">{item.name}</p>
                <p className="text-xs text-slate-500">Tareas asignadas activas</p>
              </div>
              <div className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-900 ring-1 ring-slate-200">
                {item.total}
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500">Todavía no hay suficientes responsables asignados para mostrar métricas.</p>
        )}
      </div>
    </Card>
  );
}
