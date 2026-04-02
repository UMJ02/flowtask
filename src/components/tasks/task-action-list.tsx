'use client';

import { memo, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Eye, Pencil, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { taskDetailRoute, taskEditRoute } from '@/lib/navigation/routes';

type TaskRow = {
  id: string;
  title: string;
  status: string;
  priority?: string | null;
  client_name?: string | null;
  due_date?: string | null;
  project_id?: string | null;
};

function formatDeadline(value?: string | null) {
  if (!value) return 'Sin deadline';
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return value;
  const [, year, month, day] = match;
  return `${day}/${month}/${year}`;
}

function TaskActionListComponent({ tasks, currentQuery = '' }: { tasks: TaskRow[]; currentQuery?: string }) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [items, setItems] = useState(tasks);
  const [closingId, setClosingId] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);

  useEffect(() => {
    setItems(tasks);
  }, [tasks]);

  const pendingItems = useMemo(
    () => items.filter((item) => item.status !== 'concluido'),
    [items]
  );
  const completedItems = useMemo(
    () => items.filter((item) => item.status === 'concluido'),
    [items]
  );

  const markComplete = async (taskId: string) => {
    setClosingId(taskId);
    window.setTimeout(async () => {
      setItems((current) =>
        current.map((item) => (item.id === taskId ? { ...item, status: 'concluido' } : item))
      );
      setClosingId(null);

      const { error } = await supabase.from('tasks').update({ status: 'concluido' }).eq('id', taskId);
      if (error) {
        router.refresh();
      }
    }, 260);
  };

  const deleteTask = async (taskId: string) => {
    const ok = window.confirm('¿Deseas eliminar esta tarea? Esta acción no se puede deshacer.');
    if (!ok) return;

    const current = items;
    setItems((list) => list.filter((item) => item.id !== taskId));

    const { error } = await supabase.from('tasks').delete().eq('id', taskId);
    if (error) {
      setItems(current);
      window.alert('No se pudo eliminar la tarea.');
    }
  };

  const renderItem = (task: TaskRow, completed = false) => {
    const isClosing = closingId === task.id;

    return (
      <div
        key={task.id}
        className={[
          'rounded-[24px] border border-slate-200 bg-white px-4 py-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)] transition-all duration-300',
          completed ? 'bg-slate-50/80' : 'hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(15,23,42,0.08)]',
          isClosing ? 'scale-[0.98] opacity-0 translate-x-3' : 'opacity-100'
        ].join(' ')}
      >
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge value={completed ? 'concluido' : task.status} />
              {task.client_name ? (
                <span className="rounded-full bg-sky-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-sky-700 ring-1 ring-sky-100">
                  {task.client_name}
                </span>
              ) : null}
              {task.priority ? (
                <span className="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-amber-700 ring-1 ring-amber-100">
                  {task.priority}
                </span>
              ) : null}
            </div>

            <h3 className="mt-3 text-xl font-bold text-slate-900">{task.title}</h3>

            <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-500">
              <span className="rounded-full bg-slate-100 px-3 py-1.5 font-medium text-slate-600">
                Deadline: {formatDeadline(task.due_date)}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1.5 font-medium text-slate-600">
                {task.project_id ? 'Con proyecto' : 'Sin proyecto'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 xl:justify-end">
            {!completed ? (
              <button
                type="button"
                onClick={() => markComplete(task.id)}
                className="inline-flex h-11 items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100"
              >
                <CheckCircle2 className="h-4 w-4" />
                Finalizar
              </button>
            ) : null}

            <Link href={taskDetailRoute(task.id, currentQuery)}>
              <Button type="button" variant="secondary" className="h-11 rounded-2xl">
                <Eye className="h-4 w-4" />
                Ver
              </Button>
            </Link>

            {!completed ? (
              <Link href={taskEditRoute(task.id, currentQuery)}>
                <Button type="button" variant="secondary" className="h-11 rounded-2xl">
                  <Pencil className="h-4 w-4" />
                  Editar
                </Button>
              </Link>
            ) : null}

            <Button type="button" variant="secondary" className="h-11 rounded-2xl" onClick={() => deleteTask(task.id)}>
              <Trash2 className="h-4 w-4" />
              Borrar
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <Card className="rounded-[28px] border border-slate-200/90 p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)] md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Lista de tareas</p>
            <h2 className="mt-2 text-[1.45rem] font-bold tracking-tight text-slate-900">Todo lo que sigue, en una sola vista</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Revisa tareas, abre detalle, edita, borra o márcalas como finalizadas sin cambiar de pantalla.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowCompleted((value) => !value)}
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            {showCompleted ? 'Ocultar concluidas' : `Ver tareas concluidas (${completedItems.length})`}
          </button>
        </div>
      </Card>

      <div className="space-y-3">
        {pendingItems.length ? pendingItems.map((task) => renderItem(task, false)) : (
          <Card className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-6 text-sm text-slate-500">
            No hay tareas activas en esta vista.
          </Card>
        )}
      </div>

      <div
        className={[
          'grid overflow-hidden transition-all duration-300',
          showCompleted ? 'mt-6 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        ].join(' ')}
      >
        <div className="min-h-0">
          <Card className="rounded-[28px] border border-slate-200/90 bg-[linear-gradient(180deg,rgba(248,250,252,0.96),rgba(255,255,255,0.98))] p-5 md:p-6">
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Tareas finalizadas</p>
              <h3 className="mt-2 text-lg font-bold text-slate-900">Historial reciente</h3>
            </div>

            <div className="space-y-3">
              {completedItems.length ? completedItems.map((task) => renderItem(task, true)) : (
                <div className="rounded-[22px] border border-slate-200 bg-white px-4 py-4 text-sm text-slate-500">
                  Aún no hay tareas concluidas para mostrar.
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}


export const TaskActionList = memo(TaskActionListComponent);
