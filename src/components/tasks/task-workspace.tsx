"use client";

import { useMemo } from 'react';
import { LayoutGrid, Rows3 } from 'lucide-react';
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
    const candidate = filters?.view ?? searchParams.get('view') ?? 'kanban';
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
      <Card className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Zona de trabajo</h2>
          <p className="text-sm text-slate-500">Cambia entre pizarra y lista según lo que necesites en el momento.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant={view === 'kanban' ? 'primary' : 'secondary'} onClick={() => updateView('kanban')}>
            <LayoutGrid className="h-4 w-4" /> Pizarra
          </Button>
          <Button type="button" variant={view === 'list' ? 'primary' : 'secondary'} onClick={() => updateView('list')}>
            <Rows3 className="h-4 w-4" /> Lista
          </Button>
          <Button type="button" variant={view === 'both' ? 'primary' : 'secondary'} onClick={() => updateView('both')}>
            Ambas
          </Button>
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
