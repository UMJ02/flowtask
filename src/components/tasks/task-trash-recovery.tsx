'use client';

import { useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { ArchiveRestore, CheckCircle2, Trash2, AlertCircle, ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils/dates';
import type { TaskSummary } from '@/types/task';

type Notice = { tone: 'success' | 'error' | 'info'; message: string } | null;
type PendingAction = { type: 'restore' | 'purge'; taskId: string; title: string } | null;

function isMissingRpc(error?: { code?: string; message?: string } | null) {
  const normalized = `${error?.code ?? ''} ${error?.message ?? ''}`.toLowerCase();
  return error?.code === '42883' || error?.code === 'PGRST202' || normalized.includes('schema cache') || normalized.includes('could not find the function');
}

export function TaskTrashRecovery({ tasks }: { tasks: TaskSummary[] }) {
  const supabase = useMemo(() => createClient(), []);
  const [items, setItems] = useState(tasks);
  const [notice, setNotice] = useState<Notice>(null);
  const [pending, setPending] = useState<PendingAction>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const showNotice = (message: string, tone: 'success' | 'error' | 'info' = 'info') => {
    setNotice({ message, tone });
    window.setTimeout(() => setNotice(null), 3600);
  };

  const restoreTask = async (taskId: string) => {
    const previous = items;
    setBusyId(taskId);
    const rpc = await supabase.rpc('restore_deleted_task', { p_task_id: taskId });
    if (rpc.error && isMissingRpc(rpc.error)) {
      const fallback = await supabase
        .from('tasks')
        .update({ deleted_at: null, deleted_by: null, delete_reason: null })
        .eq('id', taskId)
        .select('id')
        .maybeSingle();
      if (fallback.error || !fallback.data) {
        setBusyId(null);
        showNotice(fallback.error?.message ?? 'No se pudo restaurar la tarea.', 'error');
        return;
      }
    } else if (rpc.error) {
      setBusyId(null);
      showNotice(rpc.error.message, 'error');
      return;
    }

    setItems((current) => current.filter((task) => task.id !== taskId));
    setBusyId(null);
    showNotice('Tarea restaurada.', 'success');
    startTransition(() => window.location.reload());
  };

  const purgeTask = async (taskId: string) => {
    setBusyId(taskId);
    const rpc = await supabase.rpc('purge_deleted_task', { p_task_id: taskId });
    if (rpc.error && isMissingRpc(rpc.error)) {
      const fallback = await supabase.from('tasks').delete().eq('id', taskId).not('deleted_at', 'is', null).select('id');
      if (fallback.error || !fallback.data?.length) {
        setBusyId(null);
        showNotice(fallback.error?.message ?? 'No se pudo eliminar definitivamente la tarea.', 'error');
        return;
      }
    } else if (rpc.error) {
      setBusyId(null);
      showNotice(rpc.error.message, 'error');
      return;
    }

    setItems((current) => current.filter((task) => task.id !== taskId));
    setBusyId(null);
    showNotice('Tarea eliminada definitivamente.', 'success');
  };

  const confirmPending = async () => {
    const action = pending;
    setPending(null);
    if (!action) return;
    if (action.type === 'restore') await restoreTask(action.taskId);
    if (action.type === 'purge') await purgeTask(action.taskId);
  };

  return (
    <div className="ft-governed-screen ft-app-bg rounded-3xl p-1">
      <Card className="ft-apple-panel p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <Link href="/app/tasks" className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900">
              <ArrowLeft className="h-4 w-4" />
              Volver a tareas
            </Link>
            <h1 className="ft-page-title">Papelera de tareas</h1>
            <p className="ft-page-subtitle">Restaura tareas eliminadas o elimínalas definitivamente cuando ya no se necesitan.</p>
          </div>
          <div className="ft-apple-chip">
            {items.length} eliminada{items.length === 1 ? '' : 's'}
          </div>
        </div>

        {notice ? (
          <div className={`mt-5 rounded-2xl border px-4 py-3 text-sm font-semibold ${
            notice.tone === 'error'
              ? 'border-rose-200 bg-rose-50 text-rose-700'
              : notice.tone === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-slate-200 bg-slate-50 text-slate-700'
          }`}>
            <span className="inline-flex items-center gap-2">
              {notice.tone === 'error' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
              {notice.message}
            </span>
          </div>
        ) : null}

        {pending ? (
          <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-900">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-bold">
                  {pending.type === 'restore' ? `¿Restaurar “${pending.title}”?` : `¿Eliminar definitivamente “${pending.title}”?`}
                </p>
                <p className="mt-1 text-xs font-semibold text-rose-700">
                  {pending.type === 'restore' ? 'La tarea volverá a la lista activa.' : 'Esta acción no se puede deshacer.'}
                </p>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="secondary" onClick={() => setPending(null)} className="h-10 rounded-xl px-4">Cancelar</Button>
                <Button type="button" onClick={() => void confirmPending()} className="h-10 rounded-xl bg-rose-600 px-4 text-white hover:bg-rose-700">
                  Confirmar
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        <div className="mt-6 overflow-hidden rounded-2xl border ft-border bg-white">
          {items.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-base font-bold ft-text-main">No hay tareas eliminadas.</p>
              <p className="mt-2 text-sm ft-text-muted">Cuando elimines una tarea, aparecerá aquí para recuperación.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {items.map((task) => (
                <div key={task.id} className="grid gap-3 px-5 py-4 md:grid-cols-[minmax(240px,1fr)_160px_220px] md:items-center">
                  <div>
                    <p className="text-sm font-bold ft-text-main">{task.title}</p>
                    <p className="mt-1 text-xs font-semibold ft-text-muted">{task.client_name || 'Sin cliente'} · {task.status}</p>
                  </div>
                  <div className="text-xs font-semibold text-slate-500">
                    Eliminada: {task.deleted_at ? formatDate(task.deleted_at) : 'Sin fecha'}
                  </div>
                  <div className="flex justify-start gap-2 md:justify-end">
                    <Button type="button" disabled={busyId === task.id} onClick={() => setPending({ type: 'restore', taskId: task.id, title: task.title })} className="h-10 rounded-xl bg-emerald-600 px-3 text-white hover:bg-emerald-700">
                      <ArchiveRestore className="h-4 w-4" />
                      Restaurar
                    </Button>
                    <Button type="button" disabled={busyId === task.id} onClick={() => setPending({ type: 'purge', taskId: task.id, title: task.title })} className="h-10 rounded-xl bg-rose-600 px-3 text-white hover:bg-rose-700">
                      <Trash2 className="h-4 w-4" />
                      Definitivo
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
