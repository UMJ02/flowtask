"use client";

import { useMemo } from 'react';
import { LayoutGrid, Rows3, SquareSplitHorizontal } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { TaskKanbanBoard } from '@/components/tasks/task-kanban-board';
import { TaskList } from '@/components/tasks/task-list';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { buildRouteWithQuery } from '@/lib/navigation/routes';

type TaskItem = {
  id: string;
  title: string;
  status: string;
  client_name?: string | null;
  due_date?: string | null;
};

type ViewMode = 'kanban' | 'list' | 'both';

const options: Array<{ value: ViewMode; label: string; icon: typeof LayoutGrid }> = [
  { value: 'kanban', label: 'Pizarra', icon: LayoutGrid },
  { value: 'list', label: 'Lista', icon: Rows3 },
  { value: 'both', label: 'Ambas', icon: SquareSplitHorizontal },
];

export function TaskWorkspace({
  tasks,
  filters,
}: {
  tasks: TaskItem[];
  filters?: { q?: string; status?: string; department?: string; due?: string; view?: string };
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const view: ViewMode = useMemo(() => {
    const fromQuery = searchParams.get('view');
    const candidate = fromQuery ?? filters?.view ?? 'kanban';
    return candidate === 'kanban' || candidate === 'list' || candidate === 'both' ? candidate : 'kanban';
  }, [filters?.view, searchParams]);

  const updateView = (next: ViewMode) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next === 'kanban') {
      params.delete('view');
    } else {
      params.set('view', next);
    }
    router.replace(buildRouteWithQuery(pathname, params));
  };

  return (
    <div className="space-y-5">
      <Card className="rounded-[28px] border border-slate-200/90 p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)] md:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Zona de trabajo</p>
            <h2 className="mt-2 text-[1.55rem] font-bold tracking-tight text-slate-900">Elige cómo quieres operar</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">Cambia entre pizarra y lista según lo que necesites en el momento. La pizarra prioriza movimiento visual y la lista lectura rápida.</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[520px]">
            {options.map((option) => {
              const Icon = option.icon;
              const active = view === option.value;
              return (
                <Button
                  key={option.value}
                  type="button"
                  variant={active ? 'primary' : 'secondary'}
                  onClick={() => updateView(option.value)}
                  className="h-auto min-h-[88px] justify-center rounded-[24px] px-4 py-4 text-center shadow-none"
                >
                  <span className="flex flex-col items-center gap-2.5">
                    <span className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl ${active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'}`}><Icon className="h-5 w-5" /></span>
                    <span className="text-sm font-semibold">{option.label}</span>
                  </span>
                </Button>
              );
            })}
          </div>
        </div>
      </Card>

      {(view === 'kanban' || view === 'both') && <TaskKanbanBoard tasks={tasks} />}

      {(view === 'list' || view === 'both') && (
        <div className="space-y-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Lista rápida</h2>
            <p className="text-sm text-slate-500">Abre detalle, revisa fechas y usa acciones directas.</p>
          </div>
          <TaskList tasks={tasks} />
        </div>
      )}
    </div>
  );
}
