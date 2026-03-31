'use client';

import { useMemo, useState, useTransition } from 'react';
import { Check, Loader2, PencilLine, Save } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';

const statusOptions = [
  { value: 'activo', label: 'Activo' },
  { value: 'en_pausa', label: 'En pausa' },
  { value: 'completado', label: 'Completado' },
  { value: 'vencido', label: 'Vencido' },
];

const modeOptions = [
  { value: 'false', label: 'Solo' },
  { value: 'true', label: 'Colaborativo' },
];

type ProjectRow = {
  id: string;
  title: string;
  status: string;
  due_date?: string | null;
  client_name?: string | null;
  is_collaborative?: boolean | null;
};

export function ProjectEditableTable({ initialProjects }: { initialProjects: ProjectRow[] }) {
  const [rows, setRows] = useState<ProjectRow[]>(initialProjects);
  const [dirtyRows, setDirtyRows] = useState<Record<string, boolean>>({});
  const [savedRows, setSavedRows] = useState<Record<string, boolean>>({});
  const [isPending, startTransition] = useTransition();
  const supabase = useMemo(() => createClient(), []);

  const updateRow = (id: string, key: keyof ProjectRow, value: string | boolean) => {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, [key]: value } : row)));
    setDirtyRows((current) => ({ ...current, [id]: true }));
    setSavedRows((current) => ({ ...current, [id]: false }));
  };

  const saveRow = (row: ProjectRow) => {
    startTransition(async () => {
      const { error } = await supabase
        .from('projects')
        .update({
          title: row.title,
          status: row.status,
          due_date: row.due_date || null,
          client_name: row.client_name || null,
          is_collaborative: !!row.is_collaborative,
        })
        .eq('id', row.id);

      if (!error) {
        setDirtyRows((current) => ({ ...current, [row.id]: false }));
        setSavedRows((current) => ({ ...current, [row.id]: true }));
        setTimeout(() => {
          setSavedRows((current) => ({ ...current, [row.id]: false }));
        }, 1600);
      }
    });
  };

  if (!rows.length) {
    return (
      <Card>
        <p className="text-sm text-slate-500">Todavía no hay proyectos para mostrar.</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <div className="min-w-[920px]">
          <div className="grid grid-cols-[2.2fr_1.2fr_1.2fr_1.2fr_1.4fr_108px] gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            <span>Nombre</span>
            <span>Status</span>
            <span>Deadline</span>
            <span>Modalidad</span>
            <span>Cliente</span>
            <span className="text-right">Acciones</span>
          </div>

          <div className="divide-y divide-slate-100">
            {rows.map((row) => {
              const dirty = !!dirtyRows[row.id];
              const saved = !!savedRows[row.id];
              return (
                <div key={row.id} className="grid grid-cols-[2.2fr_1.2fr_1.2fr_1.2fr_1.4fr_108px] gap-3 px-4 py-3 text-sm text-slate-700">
                  <input value={row.title} onChange={(e) => updateRow(row.id, 'title', e.target.value)} className="min-h-11 rounded-xl border border-slate-200 px-3 outline-none focus:border-emerald-300" />
                  <select value={row.status} onChange={(e) => updateRow(row.id, 'status', e.target.value)} className="min-h-11 rounded-xl border border-slate-200 px-3 outline-none focus:border-emerald-300">
                    {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                  <input type="date" value={row.due_date ?? ''} onChange={(e) => updateRow(row.id, 'due_date', e.target.value)} className="min-h-11 rounded-xl border border-slate-200 px-3 outline-none focus:border-emerald-300" />
                  <select value={String(!!row.is_collaborative)} onChange={(e) => updateRow(row.id, 'is_collaborative', e.target.value === 'true')} className="min-h-11 rounded-xl border border-slate-200 px-3 outline-none focus:border-emerald-300">
                    {modeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                  <input value={row.client_name ?? ''} onChange={(e) => updateRow(row.id, 'client_name', e.target.value)} className="min-h-11 rounded-xl border border-slate-200 px-3 outline-none focus:border-emerald-300" />
                  <div className="flex items-center justify-end gap-2">
                    {saved ? <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><Check className="h-4 w-4" /></span> : <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500"><PencilLine className="h-4 w-4" /></span>}
                    <button type="button" disabled={!dirty || isPending} onClick={() => saveRow(row)} className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400">
                      {isPending && dirty ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
}
