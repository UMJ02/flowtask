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
    <div className="space-y-4">
      <Card className="rounded-[28px] p-5 md:p-6">
        <div className="space-y-5">
          <div className="max-w-2xl">
            <h2 className="text-[1.55rem] font-bold tracking-tight text-slate-900">Zona de trabajo</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">Cambia entre pizarra y lista según lo que necesites en el momento.</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {options.map((option) => {
              const Icon = option.icon;
              const active = view === option.value;
              return (
                <Button
                  key={option.value}
                  type="button"
                  variant={active ? 'primary' : 'secondary'}
                  onClick={() => updateView(option.value)}
                  className="h-auto min-h-[78px] justify-center rounded-2xl px-4 py-4 text-center"
                >
                  <span className="flex flex-col items-center gap-2">
                    <Icon className="h-5 w-5" />
                    <span>{option.label}</span>
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
