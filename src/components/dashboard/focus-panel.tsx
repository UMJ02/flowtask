use client';

import Link from 'next/link';
import { Clock3, Pin, Star } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useWorkspaceMemory } from '@/hooks/use-workspace-memory';

function EntityList({ items, emptyLabel }: { items: Array<{ id: string; href: string; title: string; subtitle?: string | null }>; emptyLabel: string }) {
  if (!items.length) {
    return <p className="text-sm text-slate-500">{emptyLabel}</p>;
  }

  return (
    <div className="space-y-2">
      {items.slice(0, 3).map((item) => (
        <Link key={item.id} href={item.href} className="block rounded-2xl border border-slate-100 bg-slate-50 px-3 py-3 transition hover:border-emerald-200 hover:bg-emerald-50/60">
          <p className="line-clamp-1 text-sm font-semibold text-slate-800">{item.title}</p>
          <p className="mt-1 line-clamp-1 text-xs text-slate-500">{item.subtitle || 'Acceso rápido guardado por ti.'}</p>
        </Link>
      ))}
    </div>
  );
}

function FocusCard({ icon: Icon, title, subtitle, items, emptyLabel, tint }: { icon: any; title: string; subtitle: string; items: Array<{ id: string; href: string; title: string; subtitle?: string | null }>; emptyLabel: string; tint: string }) {
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center gap-3">
        <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${tint}`}>
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
      </div>
      <div className="mt-4">
        <EntityList items={items} emptyLabel={emptyLabel} />
      </div>
    </Card>
  );
}

export function FocusPanel() {
  const { favorites, pinned, recent } = useWorkspaceMemory();

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <FocusCard
        icon={Star}
        title="Favoritos"
        subtitle="Lo que consultas más seguido"
        items={favorites}
        emptyLabel="Marca una tarea o proyecto como favorito para verlo aquí."
        tint="bg-amber-50 text-amber-600"
      />
      <FocusCard
        icon={Pin}
        title="Fijados"
        subtitle="Tus accesos del día"
        items={pinned}
        emptyLabel="Fija algo importante y lo tendrás siempre a mano."
        tint="bg-sky-50 text-sky-600"
      />
      <FocusCard
        icon={Clock3}
        title="Recientes"
        subtitle="Lo último que abriste"
        items={recent}
        emptyLabel="Cuando abras una tarea o proyecto, aparecerá aquí."
        tint="bg-emerald-50 text-emerald-600"
      />
    </div>
  );
}
