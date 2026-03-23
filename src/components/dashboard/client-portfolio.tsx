import Link from "next/link";
import { Card } from "@/components/ui/card";
import type { ClientDashboardItem } from "@/types/client";

export function ClientPortfolio({ items }: { items: ClientDashboardItem[] }) {
  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Clientes</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900">Lectura por cliente y organización</h2>
        </div>
        <Link href="/app/clients" className="text-sm font-semibold text-slate-700">Ver clientes</Link>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {items.length ? items.map((item) => (
          <div key={item.id} className="rounded-2xl border border-slate-100 p-4">
            <p className="font-semibold text-slate-900">{item.name}</p>
            <div className="mt-3 space-y-1 text-sm text-slate-600">
              <p>Proyectos abiertos: <strong>{item.openProjects}</strong></p>
              <p>Tareas abiertas: <strong>{item.openTasks}</strong></p>
              <p>Vencidas: <strong>{item.overdueTasks}</strong></p>
            </div>
          </div>
        )) : <p className="text-sm text-slate-500">Sin clientes para mostrar.</p>}
      </div>
    </Card>
  );
}
