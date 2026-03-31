'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Eye, PencilLine, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { projectDetailRoute, projectEditRoute } from '@/lib/navigation/routes';
import { createClient } from '@/lib/supabase/client';
import type { ProjectSummary } from '@/types/project';

type EditableProjectRow = Pick<ProjectSummary, 'id' | 'title' | 'status' | 'due_date' | 'client_name' | 'departmentCode'>;

type DepartmentOption = {
  id: number;
  code: string;
  name: string;
};

const PROJECT_STATUS_OPTIONS = [
  { value: 'activo', label: 'Activo' },
  { value: 'en_pausa', label: 'En pausa' },
  { value: 'completado', label: 'Completado' },
  { value: 'vencido', label: 'Vencido' },
] as const;

export function ProjectEditableList({
  projects,
  departments,
}: {
  projects: EditableProjectRow[];
  departments: DepartmentOption[];
}) {
  const [rows, setRows] = useState(projects);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [message, setMessage] = useState<Record<string, string>>({});
  const emptyState = useMemo(() => !rows.length, [rows.length]);

  const updateRow = (id: string, key: keyof EditableProjectRow, value: string) => {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, [key]: value } : row)));
  };

  const saveRow = async (row: EditableProjectRow) => {
    setSavingId(row.id);
    setMessage((current) => ({ ...current, [row.id]: '' }));
    const supabase = createClient();
    const departmentId = departments.find((department) => department.code === (row.departmentCode ?? ''))?.id ?? null;
    const { error } = await supabase
      .from('projects')
      .update({
        title: row.title,
        status: row.status,
        due_date: row.due_date || null,
        client_name: row.client_name || null,
        department_id: departmentId,
      })
      .eq('id', row.id);

    setSavingId(null);
    setMessage((current) => ({
      ...current,
      [row.id]: error ? error.message : 'Guardado',
    }));
  };

  if (emptyState) {
    return (
      <Card>
        <p className="text-sm text-slate-500">No encontramos proyectos con este filtro.</p>
      </Card>
    );
  }

  return (
    <Card className="p-0">
      <div className="overflow-x-auto">
        <div className="min-w-[1020px]">
          <div className="grid grid-cols-[minmax(240px,2fr)_160px_160px_180px_180px_150px] gap-3 border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            <div>Nombre</div>
            <div>Status</div>
            <div>Deadline</div>
            <div>Área</div>
            <div>Cliente</div>
            <div>Acciones</div>
          </div>

          {rows.map((row) => (
            <div key={row.id} className="grid grid-cols-[minmax(240px,2fr)_160px_160px_180px_180px_150px] gap-3 border-b border-slate-100 px-5 py-4 last:border-b-0">
              <input
                value={row.title}
                onChange={(event) => updateRow(row.id, 'title', event.target.value)}
                className="h-11 rounded-2xl border border-slate-200 px-3 text-sm text-slate-900 outline-none transition focus:border-emerald-300"
              />
              <select
                value={row.status}
                onChange={(event) => updateRow(row.id, 'status', event.target.value)}
                className="h-11 rounded-2xl border border-slate-200 px-3 text-sm text-slate-900 outline-none transition focus:border-emerald-300"
              >
                {PROJECT_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <input
                type="date"
                value={row.due_date ?? ''}
                onChange={(event) => updateRow(row.id, 'due_date', event.target.value)}
                className="h-11 rounded-2xl border border-slate-200 px-3 text-sm text-slate-900 outline-none transition focus:border-emerald-300"
              />
              <select
                value={row.departmentCode ?? ''}
                onChange={(event) => updateRow(row.id, 'departmentCode', event.target.value)}
                className="h-11 rounded-2xl border border-slate-200 px-3 text-sm text-slate-900 outline-none transition focus:border-emerald-300"
              >
                <option value="">Sin área</option>
                {departments.map((department) => (
                  <option key={department.id} value={department.code}>{department.name}</option>
                ))}
              </select>
              <input
                value={row.client_name ?? ''}
                onChange={(event) => updateRow(row.id, 'client_name', event.target.value)}
                className="h-11 rounded-2xl border border-slate-200 px-3 text-sm text-slate-900 outline-none transition focus:border-emerald-300"
                placeholder="Sin cliente"
              />
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Link href={projectDetailRoute(row.id)} className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700" aria-label="Ver detalle">
                    <Eye className="h-4 w-4" />
                  </Link>
                  <Link href={projectEditRoute(row.id)} className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700" aria-label="Editar proyecto">
                    <PencilLine className="h-4 w-4" />
                  </Link>
                  <Button type="button" className="h-11 rounded-2xl px-3" onClick={() => saveRow(row)} loading={savingId === row.id}>
                    <Save className="h-4 w-4" />
                    Guardar
                  </Button>
                </div>
                {message[row.id] ? <p className="text-xs text-slate-500">{message[row.id]}</p> : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
