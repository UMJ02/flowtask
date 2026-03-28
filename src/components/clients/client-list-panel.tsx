import Link from 'next/link';
import { Building2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusBadge } from '@/components/ui/status-badge';
import type { ClientListItem } from '@/types/client';

export function ClientListPanel({ items }: { items: ClientListItem[] }) {
  return (
    <Card className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Clientes</p>
        <h2 className="mt-1 text-2xl font-bold text-slate-900">Espacios de trabajo por cliente</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Cada cliente agrupa proyectos, tareas y actividad por organización con una lectura clara de estado, carga y seguimiento.</p>
      </div>

      <div className="grid gap-3">
        {items.length ? (
          items.map((item) => (
            <Link key={item.id} href={`/app/clients/${item.id}`} className="rounded-lg border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:bg-slate-50/60">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge value={item.status} />
                    <span className="text-xs text-slate-500">Creado: {item.createdAtLabel}</span>
                  </div>
                  <h3 className="mt-3 text-lg font-semibold text-slate-900">{item.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">Abre el detalle para revisar proyectos, tareas y actividad reciente de este cliente.</p>
                </div>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                  <Building2 className="h-5 w-5" />
                </span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Proyectos</p>
                  <p className="mt-2 text-xl font-bold text-slate-900">{item.projectsCount}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Tareas abiertas</p>
                  <p className="mt-2 text-xl font-bold text-slate-900">{item.openTasksCount}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Completadas</p>
                  <p className="mt-2 text-xl font-bold text-slate-900">{item.completedTasksCount}</p>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <EmptyState
            icon={<Building2 className="h-6 w-6" />}
            title="No hay clientes para mostrar"
            description="No encontramos resultados con este filtro. Prueba otra búsqueda o cambia de organización para ver más espacios."
          />
        )}
      </div>
    </Card>
  );
}
