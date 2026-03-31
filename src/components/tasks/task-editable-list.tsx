'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { CalendarDays, ExternalLink, FolderKanban, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { createClient } from '@/lib/supabase/client';
import { taskDetailRoute, taskEditRoute } from '@/lib/navigation/routes';
import { DEPARTMENTS } from '@/lib/constants/departments';
import { TASK_STATUSES } from '@/lib/constants/task-status';

export type TaskEditableRow = {
  id: string;
  title: string;
  status: string;
  priority?: string | null;
  client_name?: string | null;
  due_date?: string | null;
  departmentCode?: string | null;
  project_id?: string | null;
};

function sameValue(a: unknown, b: unknown) {
  return (a ?? '') === (b ?? '');
}

export function TaskEditableList({
  tasks,
  projectOptions,
}: {
  tasks: TaskEditableRow[];
  projectOptions: Array<{ id: string; title: string }>;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [rows, setRows] = useState(tasks);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const updateField = (taskId: string, field: keyof TaskEditableRow, value: string) => {
    setRows((current) => current.map((row) => (row.id === taskId ? { ...row, [field]: value || null } : row)));
  };

  const saveRow = async (taskId: string) => {
    const row = rows.find((item) => item.id === taskId);
    const original = tasks.find((item) => item.id === taskId);
    if (!row || !original) return;

    const payload: Record<string, string | null> = {};
    if (!sameValue(row.title, original.title)) payload.title = row.title;
    if (!sameValue(row.client_name, original.client_name)) payload.client_name = row.client_name || null;
    if (!sameValue(row.status, original.status)) payload.status = row.status;
    if (!sameValue(row.priority, original.priority)) payload.priority = row.priority || 'media';
    if (!sameValue(row.due_date, original.due_date)) payload.due_date = row.due_date || null;
    if (!sameValue(row.project_id, original.project_id)) payload.project_id = row.project_id || null;

    if (!sameValue(row.departmentCode, original.departmentCode)) {
      if (row.departmentCode) {
        const { data: department } = await supabase.from('departments').select('id').eq('code', row.departmentCode).maybeSingle();
        payload.department_id = department?.id ? String(department.id) : null;
      } else {
        payload.department_id = null;
      }
    }

    if (!Object.keys(payload).length) {
      setMessage('No hay cambios pendientes en la fila.');
      return;
    }

    setSavingId(taskId);
    setMessage(null);
    const { error } = await supabase.from('tasks').update(payload).eq('id', taskId);
    setSavingId(null);

    if (error) {
      setMessage(`No pudimos guardar la tarea: ${error.message}`);
      return;
    }

    setMessage('Cambios guardados en tareas.');
  };

  return (
    <Card className="rounded-[30px] border border-slate-200 bg-white p-4 shadow-[0_16px_40px_rgba(15,23,42,0.05)] md:p-5">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Tareas</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">Lista editable del workspace</h2>
          <p className="mt-2 text-sm text-slate-500">Edita cada columna y guarda la fila sin salir del módulo.</p>
        </div>
        {message ? <p className="text-sm text-slate-500">{message}</p> : null}
      </div>

      <div className="mt-5 overflow-x-auto">
        <div className="min-w-[1120px] space-y-3">
          <div className="grid grid-cols-[minmax(240px,1.9fr)_minmax(160px,1.2fr)_160px_150px_170px_180px_110px] gap-3 px-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            <span>Nombre</span>
            <span>Cliente</span>
            <span>Estado</span>
            <span>Prioridad</span>
            <span>Deadline</span>
            <span>Proyecto / Área</span>
            <span>Acciones</span>
          </div>

          {rows.length ? rows.map((task) => (
            <div key={task.id} className="grid grid-cols-[minmax(240px,1.9fr)_minmax(160px,1.2fr)_160px_150px_170px_180px_110px] gap-3 rounded-[24px] border border-slate-200 bg-slate-50/80 p-3">
              <Input value={task.title} onChange={(event) => updateField(task.id, 'title', event.target.value)} className="h-12 rounded-[18px] bg-white" />
              <Input value={task.client_name ?? ''} onChange={(event) => updateField(task.id, 'client_name', event.target.value)} className="h-12 rounded-[18px] bg-white" placeholder="Sin cliente" />
              <Select value={task.status} onChange={(event) => updateField(task.id, 'status', event.target.value)} className="h-12 rounded-[18px] bg-white">
                {TASK_STATUSES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </Select>
              <Select value={task.priority ?? 'media'} onChange={(event) => updateField(task.id, 'priority', event.target.value)} className="h-12 rounded-[18px] bg-white">
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
              </Select>
              <label className="relative">
                <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input type="date" value={task.due_date ?? ''} onChange={(event) => updateField(task.id, 'due_date', event.target.value)} className="h-12 rounded-[18px] bg-white pl-11" />
              </label>
              <div className="grid gap-3">
                <Select value={task.project_id ?? ''} onChange={(event) => updateField(task.id, 'project_id', event.target.value)} className="h-12 rounded-[18px] bg-white">
                  <option value="">Sin proyecto</option>
                  {projectOptions.map((project) => <option key={project.id} value={project.id}>{project.title}</option>)}
                </Select>
                <Select value={task.departmentCode ?? ''} onChange={(event) => updateField(task.id, 'departmentCode', event.target.value)} className="h-12 rounded-[18px] bg-white">
                  <option value="">Sin área</option>
                  {DEPARTMENTS.map((department) => <option key={department.code} value={department.code}>{department.label}</option>)}
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Button type="button" variant="secondary" onClick={() => saveRow(task.id)} className="h-12 w-12 rounded-[18px] px-0" disabled={savingId === task.id}>
                  {savingId === task.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                </Button>
                <Link href={taskDetailRoute(task.id)} className="inline-flex h-12 w-12 items-center justify-center rounded-[18px] border border-slate-200 bg-white text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700">
                  <ExternalLink className="h-4 w-4" />
                </Link>
                <Link href={taskEditRoute(task.id)} className="inline-flex h-12 w-12 items-center justify-center rounded-[18px] border border-slate-200 bg-white text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700">
                  <FolderKanban className="h-4 w-4" />
                </Link>
              </div>
            </div>
          )) : (
            <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">No encontramos tareas con este filtro.</div>
          )}
        </div>
      </div>
    </Card>
  );
}
