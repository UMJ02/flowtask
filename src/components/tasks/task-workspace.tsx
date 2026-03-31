'use client';

import { useMemo } from 'react';
import { LayoutGrid, Rows3 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { TaskKanbanBoard, type TaskItem } from '@/components/tasks/task-kanban-board';
import { TaskList } from '@/components/tasks/task-list';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { taskListRoute } from '@/lib/navigation/routes';

type ViewMode = 'kanban' | 'list' | 'both';

const options: Array<{ value: Exclude<ViewMode, 'both'>; label: string; icon: typeof LayoutGrid }> = [
  { value: 'kanban', label: 'Pizarra', icon: LayoutGrid },
  { value: 'list', label: 'Lista', icon: Rows3 },
];

export function TaskWorkspace({
  tasks,
  filters,
  currentView,
}: {
  tasks: TaskItem[];
  filters?: { q?: string; status?: string; department?: string; due?: string; view?: string };
  currentView?: string;
}) {
  const router = useRouter();

  const view: Exclude<ViewMode, 'both'> = useMemo(() => {
    const candidate = currentView ?? filters?.view ?? 'kanban';
    return candidate === 'list' ? 'list' : 'kanban';
  }, [currentView, filters?.view]);

  const updateView = (next: Exclude<ViewMode, 'both'>) => {
    const params = new URLSearchParams();
    if (filters?.q) params.set('q', filters.q);
    if (filters?.status) params.set('status', filters.status);
    if (filters?.department) params.set('department', filters.department);
    if (filters?.due) params.set('due', filters.due);
    if (next === 'list') params.set('view', 'list');
    router.replace(taskListRoute(params.toString()), { scroll: false });
  };

  return (
    <div className="space-y-5">
      <Card className="rounded-[28px] border border-slate-200/90 p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)] md:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Zona de trabajo</p>
            <h2 className="mt-2 text-[1.35rem] font-bold tracking-tight text-slate-900 md:text-[1.5rem]">Elige tu vista</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">Usa pizarra para mover tareas de forma visual o lista para revisar todo más rápido.</p>
          </div>

          <div className="grid grid-cols-2 gap-3 xl:min-w-[360px]">
            {options.map((option) => {
              const Icon = option.icon;
              const active = view === option.value;
              return (
                <Button
                  key={option.value}
                  type="button"
                  variant={active ? 'primary' : 'secondary'}
                  onClick={() => updateView(option.value)}
                  className="h-auto min-h-[82px] justify-center rounded-[22px] px-4 py-4 text-center shadow-none"
                >
                  <span className="flex flex-col items-center gap-2">
                    <span className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl ${active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'}`}><Icon className="h-5 w-5" /></span>
                    <span className="text-sm font-semibold">{option.label}</span>
                  </span>
                </Button>
              );
            })}
          </div>
        </div>
      </Card>

      {view === 'kanban' ? (
        <TaskKanbanBoard tasks={tasks} />
      ) : (
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
