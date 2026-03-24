'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { BookmarkPlus, RotateCcw, Star, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { asRoute, type AppRoute } from '@/lib/navigation/routes';

type SavedFilterView = {
  id: string;
  label: string;
  query: string;
  createdAt: string;
};

function readViews(storageKey: string): SavedFilterView[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is SavedFilterView => typeof item?.id === 'string' && typeof item?.label === 'string' && typeof item?.query === 'string');
  } catch {
    return [];
  }
}

function writeViews(storageKey: string, views: SavedFilterView[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(storageKey, JSON.stringify(views.slice(0, 6)));
  window.dispatchEvent(new CustomEvent('flowtask-filter-views-updated', { detail: { storageKey } }));
}

export function FilterPresets({
  storageKey,
  basePath,
  currentQuery,
  title = 'Búsquedas guardadas',
  emptyLabel = 'Guarda tus búsquedas favoritas para volver con un clic.',
}: {
  storageKey: string;
  basePath: AppRoute;
  currentQuery: string;
  title?: string;
  emptyLabel?: string;
}) {
  const [views, setViews] = useState<SavedFilterView[]>([]);

  useEffect(() => {
    const load = () => setViews(readViews(storageKey));
    load();
    const onUpdate = (event: Event) => {
      const detail = (event as CustomEvent<{ storageKey?: string }>).detail;
      if (!detail?.storageKey || detail.storageKey === storageKey) load();
    };
    window.addEventListener('flowtask-filter-views-updated', onUpdate as EventListener);
    return () => window.removeEventListener('flowtask-filter-views-updated', onUpdate as EventListener);
  }, [storageKey]);

  const currentHref = useMemo(() => asRoute(currentQuery ? `${String(basePath)}?${currentQuery}` : String(basePath)), [basePath, currentQuery]);
  const hasActiveFilters = currentQuery.trim().length > 0;

  const saveCurrentView = () => {
    if (!hasActiveFilters) return;
    const label = window.prompt('Ponle un nombre corto a esta búsqueda');
    if (!label?.trim()) return;

    const nextView: SavedFilterView = {
      id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}`,
      label: label.trim().slice(0, 32),
      query: currentQuery,
      createdAt: new Date().toISOString(),
    };

    const deduped = readViews(storageKey).filter((item) => item.query !== currentQuery && item.label !== nextView.label);
    writeViews(storageKey, [nextView, ...deduped]);
    setViews([nextView, ...deduped].slice(0, 6));
  };

  const removeView = (id: string) => {
    const next = views.filter((item) => item.id !== id);
    setViews(next);
    writeViews(storageKey, next);
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-slate-900">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-slate-600">
              <Star className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold">{title}</h3>
              <p className="text-sm text-slate-500">{emptyLabel}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={basePath}>
            <Button type="button" variant="secondary">
              <RotateCcw className="h-4 w-4" /> Limpiar
            </Button>
          </Link>
          <Button type="button" onClick={saveCurrentView} disabled={!hasActiveFilters}>
            <BookmarkPlus className="h-4 w-4" /> Guardar búsqueda
          </Button>
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {hasActiveFilters ? (
          <div className="min-w-0 rounded-md border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
            Búsqueda activa:{' '}
            <Link href={currentHref} className="font-semibold underline decoration-emerald-300 underline-offset-4">
              {currentQuery}
            </Link>
          </div>
        ) : (
          <div className="text-sm text-slate-500">Aplica filtros para guardar esta búsqueda.</div>
        )}

        {views.length ? (
          <div className="flex flex-wrap gap-2">
            {views.map((view) => {
              const href = asRoute(view.query ? `${String(basePath)}?${view.query}` : String(basePath));
              const isActive = view.query === currentQuery;
              return (
                <div key={view.id} className={`group flex items-center gap-1 rounded-md border px-3 py-2 text-sm ${isActive ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-slate-200 bg-white text-slate-700'}`}>
                  <Link href={href} className="font-medium">
                    {view.label}
                  </Link>
                  <button
                    type="button"
                    className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    aria-label={`Eliminar vista ${view.label}`}
                    onClick={() => removeView(view.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-sm text-slate-500">Todavía no tienes búsquedas guardadas en este módulo.</div>
        )}
      </div>
    </div>
  );
}
