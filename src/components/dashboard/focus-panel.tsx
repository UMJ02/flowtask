'use client';

import Link from 'next/link';
import { Clock3, FolderHeart, Pin, Star } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useWorkspaceMemory } from '@/hooks/use-workspace-memory';

function EntityList({ items, emptyLabel }: { items: Array<{ id: string; href: string; title: string; subtitle?: string | null }>; emptyLabel: string }) {
  if (!items.length) {
    return <p className="text-sm text-slate-500">{emptyLabel}</p>;
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <Link key={item.id} href={item.href} className="block rounded-2xl border border-slate-100 bg-slate-50 px-3 py-3 transition hover:border-emerald-200 hover:bg-emerald-50/60">
          <p className="line-clamp-1 text-sm font-semibold text-slate-800">{item.title}</p>
          <p className="mt-1 line-clamp-1 text-xs text-slate-500">{item.subtitle || 'Acceso rápido guardado por ti.'}</p>
        </Link>
      ))}
    </div>
  );
}

export function FocusPanel() {
  const { favorites, pinned, recent } = useWorkspaceMemory();

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <Card>
        <div className="flex items-center gap-2">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
            <Star className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-base font-semibold text-slate-900">Favoritos</h3>
            <p className="text-sm text-slate-500">Guarda lo que consultas más seguido.</p>
          </div>
        </div>
        <div className="mt-4">
          <EntityList items={favorites} emptyLabel="Marca tareas o proyectos como favoritos para verlos aquí." />
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
            <Pin className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-base font-semibold text-slate-900">Fijados</h3>
            <p className="text-sm text-slate-500">Mantén visibles tus prioridades del día.</p>
          </div>
        </div>
        <div className="mt-4">
          <EntityList items={pinned} emptyLabel="Fija tareas o proyectos importantes para tenerlos siempre a mano." />
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <Clock3 className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-base font-semibold text-slate-900">Recientes</h3>
            <p className="text-sm text-slate-500">Retoma en segundos lo último que abriste.</p>
          </div>
        </div>
        <div className="mt-4">
          <EntityList items={recent} emptyLabel="Cuando abras una tarea o proyecto, aparecerá aquí." />
        </div>
      </Card>
    </div>
  );
}
