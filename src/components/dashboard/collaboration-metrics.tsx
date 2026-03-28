import { Card } from "@/components/ui/card";

interface CollaborationMetricItem {
  name: string;
  total: number;
}

export function CollaborationMetrics({ items }: { items: CollaborationMetricItem[] }) {
  return (
    <Card className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Colaboradores más activos</h2>
        <p className="text-sm text-slate-500">Participación en proyectos colaborativos donde eres owner.</p>
      </div>
      <div className="space-y-3">
        {items.length ? (
          items.map((item, index) => (
            <div key={`${item.name}-${index}`} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
              <div>
                <p className="font-medium text-slate-900">{item.name}</p>
                <p className="text-xs text-slate-500">Proyectos compartidos</p>
              </div>
              <div className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-900 ring-1 ring-slate-200">
                {item.total}
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500">Aún no hay colaboradores suficientes para un ranking.</p>
        )}
      </div>
    </Card>
  );
}
