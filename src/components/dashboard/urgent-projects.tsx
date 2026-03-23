import Link from "next/link";
import { Card } from "@/components/ui/card";

interface UrgentProjectItem {
  id: string;
  title: string;
  status: string;
  due_date: string | null;
  client_name: string | null;
}

export function UrgentProjects({ items }: { items: UrgentProjectItem[] }) {
  return (
    <Card className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Proyectos a vigilar</h2>
        <p className="text-sm text-slate-500">Activos con deadline dentro de la próxima semana.</p>
      </div>
      <div className="space-y-3">
        {items.length ? (
          items.map((item) => (
            <Link key={item.id} href={`/app/projects/${item.id}`} className="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition hover:border-slate-300 hover:bg-white">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-900">{item.title}</p>
                  <p className="mt-1 text-xs text-slate-500">{item.client_name || "Sin cliente"} · {item.status}</p>
                </div>
                <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 ring-1 ring-slate-200">
                  {item.due_date || "Sin fecha"}
                </span>
              </div>
            </Link>
          ))
        ) : (
          <p className="text-sm text-slate-500">No hay proyectos urgentes para los próximos 7 días.</p>
        )}
      </div>
    </Card>
  );
}
