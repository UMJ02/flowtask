import Link from "next/link";
import { Card } from "@/components/ui/card";
import type { ClientListItem } from "@/types/client";

const statusStyles = {
  activo: "bg-emerald-50 text-emerald-700",
  en_pausa: "bg-amber-50 text-amber-700",
  cerrado: "bg-slate-100 text-slate-600",
};

export function ClientListPanel({ items, search = "" }: { items: ClientListItem[]; search?: string }) {
  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Clientes</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Espacios de trabajo por cliente</h1>
          <p className="mt-2 text-sm text-slate-600">Cada cliente agrupa proyectos, tareas y actividad por organización.</p>
        </div>
        <form className="flex items-center gap-2" action="/app/clients">
          <input name="q" defaultValue={search} placeholder="Buscar cliente" className="rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none" />
          <button className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Buscar</button>
        </form>
      </div>
      <div className="mt-4 grid gap-3">
        {items.length ? items.map((item) => (
          <Link key={item.id} href={`/app/clients/${item.id}`} className="rounded-2xl border border-slate-100 p-4 transition hover:border-slate-200 hover:bg-slate-50">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-slate-900">{item.name}</h2>
                <p className="mt-1 text-xs text-slate-500">Creado: {item.createdAtLabel}</p>
              </div>
              <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[item.status]}`}>{item.status.replace('_', ' ')}</span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Proyectos</p>
                <p className="mt-2 text-xl font-bold text-slate-900">{item.projectsCount}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Tareas abiertas</p>
                <p className="mt-2 text-xl font-bold text-slate-900">{item.openTasksCount}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Completadas</p>
                <p className="mt-2 text-xl font-bold text-slate-900">{item.completedTasksCount}</p>
              </div>
            </div>
          </Link>
        )) : <p className="rounded-2xl border border-dashed border-slate-200 p-5 text-sm text-slate-500">No hay clientes para mostrar con este filtro.</p>}
      </div>
    </Card>
  );
}
