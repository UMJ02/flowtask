import Link from 'next/link';
import { ArrowUpRight, CalendarClock, CircleCheckBig, FolderKanban } from 'lucide-react';
import { EntityMemoryActions } from '@/components/entities/entity-memory-actions';
import { TaskInlineActions } from '@/components/tasks/task-inline-actions';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusBadge } from '@/components/ui/status-badge';
import { taskDetailRoute } from '@/lib/navigation/routes';

export function TaskList({ tasks }: { tasks: Array<{ id: string; title: string; status: string; priority?: string | null; client_name?: string | null; due_date?: string | null }> }) {
  if (!tasks.length) {
    return (
      <EmptyState
        icon={<CircleCheckBig className="h-6 w-6" />}
        title="No hay tareas por aquí"
        description="Crea tu primera tarea o ajusta los filtros para ver otros pendientes."
      />
    );
  }

  return (
    <div className="grid gap-4">
      {tasks.map((task) => (
        <Card key={task.id} className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge value={task.status} />
                <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">Prioridad {task.priority || 'media'}</span>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">{task.client_name || 'Sin cliente'}</span>
              </div>
              <Link href={taskDetailRoute(task.id)} className="mt-3 block">
                <h3 className="line-clamp-2 text-base font-semibold text-slate-900 transition hover:text-emerald-700">{task.title}</h3>
              </Link>
              <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-500">
                <span className="inline-flex items-center gap-2">
                  <CalendarClock className="h-4 w-4" />
                  {task.due_date || 'Sin fecha definida'}
                </span>
                <Link href={taskDetailRoute(task.id)} className="inline-flex items-center gap-2 font-medium text-emerald-700 transition hover:text-emerald-800">
                  Abrir detalle
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <EntityMemoryActions
              entity={{
                id: task.id,
                type: 'task',
                title: task.title,
                subtitle: task.client_name || 'Tarea',
                href: taskDetailRoute(task.id),
                updatedAt: new Date().toISOString(),
              }}
              compact
            />
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50 px-3 py-3">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              <FolderKanban className="h-3.5 w-3.5" />
              Acciones rápidas
            </div>
            <TaskInlineActions taskId={task.id} status={task.status} />
          </div>
        </Card>
      ))}
    </div>
  );
}
