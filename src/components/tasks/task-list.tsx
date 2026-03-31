import Link from 'next/link';
import { ArrowUpRight, CalendarClock, CircleCheckBig, FolderKanban, Layers3, Plus, Sparkles } from 'lucide-react';
import { EntityMemoryActions } from '@/components/entities/entity-memory-actions';
import { TaskInlineActions } from '@/components/tasks/task-inline-actions';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusBadge } from '@/components/ui/status-badge';
import { taskDetailRoute, taskNewRoute } from '@/lib/navigation/routes';
import { formatDate } from '@/lib/utils/dates';

function priorityTone(priority?: string | null) {
  if (priority === 'alta') return 'bg-rose-50 text-rose-700 ring-rose-100';
  if (priority === 'baja') return 'bg-sky-50 text-sky-700 ring-sky-100';
  return 'bg-violet-50 text-violet-700 ring-violet-100';
}

export function TaskList({ tasks, currentQuery }: { tasks: Array<{ id: string; title: string; status: string; priority?: string | null; client_name?: string | null; due_date?: string | null; project_id?: string | null; updated_at?: string | null; created_at?: string | null }>; currentQuery?: string }) {
  if (!tasks.length) {
    return (
      <EmptyState
        icon={<CircleCheckBig className="h-6 w-6" />}
        title="No hay tareas en esta vista"
        description="Todavía no hay resultados para esta combinación de filtros. Crea una tarea nueva o limpia la vista para volver a ver lo pendiente."
        action={
          <Link href={taskNewRoute(currentQuery)}>
            <Button>
              <Plus className="h-4 w-4" />
              Crear tarea
            </Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="grid gap-4">
      {tasks.map((task) => (
        <Card key={task.id} className="space-y-4 rounded-[28px] border border-slate-200/90 p-5 shadow-[0_16px_34px_rgba(15,23,42,0.06)] md:p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge value={task.status} />
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${priorityTone(task.priority)}`}>Prioridad {task.priority || 'media'}</span>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">{task.client_name || 'Sin cliente'}</span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{task.project_id ? 'Con proyecto' : 'Independiente'}</span>
              </div>

              <Link href={taskDetailRoute(task.id, currentQuery)} className="mt-3 block">
                <h3 className="line-clamp-2 text-lg font-semibold tracking-tight text-slate-900 transition hover:text-emerald-700">{task.title}</h3>
              </Link>

              <p className="mt-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                <Sparkles className="h-3.5 w-3.5" />
                Resumen operativo
              </p>

              <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-500">
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1.5">
                  <CalendarClock className="h-4 w-4" />
                  {task.due_date ? formatDate(task.due_date) : 'Sin fecha definida'}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1.5">
                  <Layers3 className="h-4 w-4" />
                  {task.project_id ? 'Vinculada a proyecto' : 'Tarea suelta'}
                </span>
                <Link href={taskDetailRoute(task.id, currentQuery)} className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 font-medium text-emerald-700 transition hover:bg-emerald-100 hover:text-emerald-800">
                  Abrir detalle
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <EntityMemoryActions
                entity={{
                  id: task.id,
                  type: 'task',
                  title: task.title,
                  subtitle: task.client_name || 'Tarea',
                  href: taskDetailRoute(task.id, currentQuery),
                  updatedAt: task.updated_at || task.created_at || task.due_date || '1970-01-01T00:00:00.000Z',
                }}
                compact
              />
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-100 bg-[linear-gradient(180deg,#f8fafc_0%,#f1f5f9_100%)] px-4 py-4">
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
