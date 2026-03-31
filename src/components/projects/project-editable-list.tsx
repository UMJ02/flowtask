'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { CalendarDays, ExternalLink, Loader2, PencilLine, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { createClient } from '@/lib/supabase/client';
import { DEPARTMENTS } from '@/lib/constants/departments';
import { PROJECT_STATUSES } from '@/lib/constants/project-status';
import { projectDetailRoute, projectEditRoute } from '@/lib/navigation/routes';

export type ProjectEditableRow = {
  id: string;
  title: string;
  status: string;
  client_name?: string | null;
  due_date?: string | null;
  departmentCode?: string | null;
  is_collaborative?: boolean;
};

function sameValue(a: unknown, b: unknown) {
  return (a ?? '') === (b ?? '');
}

export function ProjectEditableList({ projects }: { projects: ProjectEditableRow[] }) {
  const supabase = useMemo(() => createClient(), []);
  const [rows, setRows] = useState(projects);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const updateField = (projectId: string, field: keyof ProjectEditableRow, value: string | boolean) => {
    setRows((current) => current.map((row) => (row.id === projectId ? { ...row, [field]: value } : row)));
  };

  const saveRow = async (projectId: string) => {
    const row = rows.find((item) => item.id === projectId);
    const original = projects.find((item) => item.id === projectId);
    if (!row || !original) return;

    const payload: Record<string, string | boolean | null> = {};
    if (!sameValue(row.title, original.title)) payload.title = row.title;
    if (!sameValue(row.client_name, original.client_name)) payload.client_name = row.client_name || null;
    if (!sameValue(row.status, original.status)) payload.status = row.status;
    if (!sameValue(row.due_date, original.due_date)) payload.due_date = row.due_date || null;
    if (!sameValue(row.is_collaborative, original.is_collaborative)) payload.is_collaborative = Boolean(row.is_collaborative);

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

    setSavingId(projectId);
    setMessage(null);
    const { error } = await supabase.from('projects').update(payload).eq('id', projectId);
    setSavingId(null);

    if (error) {
      setMessage(`No pudimos guardar el proyecto: ${error.message}`);
      return;
    }

    setMessage('Cambios guardados en proyectos.');
  };

  return (
    <Card className="rounded-[30px] border border-slate-200 bg-white p-4 shadow-[0_16px_40px_rgba(15,23,42,0.05)] md:p-5">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Proyectos</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">Lista editable del pipeline</h2>
          <p className="mt-2 text-sm text-slate-500">Ajusta nombre, estado, fecha y área en una sola tarjeta vertical.</p>
        </div>
        {message ? <p className="text-sm text-slate-500">{message}</p> : null}
      </div>

      <div className="mt-5 overflow-x-auto">
        <div className="min-w-[1040px] space-y-3">
          <div className="grid grid-cols-[minmax(240px,1.9fr)_minmax(170px,1.2fr)_160px_170px_180px_160px_110px] gap-3 px-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            <span>Nombre</span>
            <span>Cliente</span>
            <span>Estado</span>
            <span>Deadline</span>
            <span>Área</span>
            <span>Modalidad</span>
            <span>Acciones</span>
          </div>

          {rows.length ? rows.map((project) => (
            <div key={project.id} className="grid grid-cols-[minmax(240px,1.9fr)_minmax(170px,1.2fr)_160px_170px_180px_160px_110px] gap-3 rounded-[24px] border border-slate-200 bg-slate-50/80 p-3">
              <Input value={project.title} onChange={(event) => updateField(project.id, 'title', event.target.value)} className="h-12 rounded-[18px] bg-white" />
              <Input value={project.client_name ?? ''} onChange={(event) => updateField(project.id, 'client_name', event.target.value)} className="h-12 rounded-[18px] bg-white" placeholder="Sin cliente" />
              <Select value={project.status} onChange={(event) => updateField(project.id, 'status', event.target.value)} className="h-12 rounded-[18px] bg-white">
                {PROJECT_STATUSES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </Select>
              <label className="relative">
                <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input type="date" value={project.due_date ?? ''} onChange={(event) => updateField(project.id, 'due_date', event.target.value)} className="h-12 rounded-[18px] bg-white pl-11" />
              </label>
              <Select value={project.departmentCode ?? ''} onChange={(event) => updateField(project.id, 'departmentCode', event.target.value)} className="h-12 rounded-[18px] bg-white">
                <option value="">Sin área</option>
                {DEPARTMENTS.map((department) => <option key={department.code} value={department.code}>{department.label}</option>)}
              </Select>
              <Select value={project.is_collaborative ? 'collaborative' : 'solo'} onChange={(event) => updateField(project.id, 'is_collaborative', event.target.value === 'collaborative')} className="h-12 rounded-[18px] bg-white">
                <option value="solo">Solo owner</option>
                <option value="collaborative">Colaborativo</option>
              </Select>
              <div className="flex items-center gap-2">
                <Button type="button" variant="secondary" onClick={() => saveRow(project.id)} className="h-12 w-12 rounded-[18px] px-0" disabled={savingId === project.id}>
                  {savingId === project.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                </Button>
                <Link href={projectDetailRoute(project.id)} className="inline-flex h-12 w-12 items-center justify-center rounded-[18px] border border-slate-200 bg-white text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700">
                  <ExternalLink className="h-4 w-4" />
                </Link>
                <Link href={projectEditRoute(project.id)} className="inline-flex h-12 w-12 items-center justify-center rounded-[18px] border border-slate-200 bg-white text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700">
                  <PencilLine className="h-4 w-4" />
                </Link>
              </div>
            </div>
          )) : (
            <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">No encontramos proyectos con este filtro.</div>
          )}
        </div>
      </div>
    </Card>
  );
}
