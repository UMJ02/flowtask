
'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Building2, Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { getClientWorkspaceContext } from '@/lib/supabase/workspace-client';
import type { ClientListItem, ClientStatus } from '@/types/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/ui/empty-state';

type Draft = {
  id?: string;
  name: string;
  status: ClientStatus;
  notes: string;
};

const EMPTY_DRAFT: Draft = {
  name: '',
  status: 'activo',
  notes: '',
};

export function ClientManagerPanel({ items, initialQuery = '' }: { items: ClientListItem[]; initialQuery?: string }) {
  const [list, setList] = useState(items);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const stats = useMemo(() => ({
    total: list.length,
    active: list.filter((item) => item.status === 'activo').length,
    paused: list.filter((item) => item.status === 'en_pausa').length,
  }), [list]);

  const resetDraft = () => {
    setDraft(EMPTY_DRAFT);
    setMode('create');
    setError(null);
    setMessage(null);
  };

  const startEdit = (item: ClientListItem) => {
    setDraft({
      id: item.id,
      name: item.name,
      status: item.status,
      notes: item.notes ?? '',
    });
    setMode('edit');
    setError(null);
    setMessage(null);
  };

  const saveClient = async () => {
    setError(null);
    setMessage(null);
    if (!draft.name.trim()) {
      setError('El nombre del cliente es obligatorio.');
      return;
    }

    setSaving(true);
    const workspace = await getClientWorkspaceContext();
    if (!workspace.user) {
      setError('No encontramos una sesión activa para guardar este cliente.');
      setSaving(false);
      return;
    }

    const supabase = workspace.supabase;
    const payload = {
      organization_id: workspace.activeOrganizationId,
      account_owner_id: workspace.activeOrganizationId ? null : workspace.user.id,
      name: draft.name.trim(),
      status: draft.status,
      notes: draft.notes.trim() || null,
    };

    if (mode === 'edit' && draft.id) {
      const { error: updateError } = await supabase.from('clients').update(payload).eq('id', draft.id);
      if (updateError) {
        setError(updateError.message);
        setSaving(false);
        return;
      }
      setList((current) => current.map((item) => item.id === draft.id ? { ...item, ...payload } : item));
      setMessage('Cliente actualizado correctamente.');
      setSaving(false);
      resetDraft()
      return;
    }

    const { data, error: insertError } = await supabase
      .from('clients')
      .insert(payload)
      .select('id,name,status,notes,created_at')
      .single();

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }

    setList((current) => [{
      id: data.id,
      name: data.name,
      status: data.status,
      notes: data.notes ?? null,
      createdAtLabel: 'Hoy',
      projectsCount: 0,
      openTasksCount: 0,
      completedTasksCount: 0,
      overdueTasksCount: 0,
    }, ...current]);
    setMessage('Cliente creado correctamente.');
    setSaving(false);
    resetDraft()
  };

  const deleteClient = async (clientId: string) => {
    const ok = window.confirm('¿Deseas eliminar este cliente? Los proyectos o tareas relacionados deben quedar desvinculados según la base de datos.');
    if (!ok) return;

    setDeletingId(clientId);
    setError(null);
    const workspace = await getClientWorkspaceContext();
    const supabase = workspace.supabase;
    const target = list.find((item) => item.id === clientId) ?? null;
    const { error: deleteError } = await supabase.from('clients').delete().eq('id', clientId);

    if (deleteError) {
      setDeletingId(null);
      setError(deleteError.message);
      return;
    }
    setList((current) => current.filter((item) => item.id !== clientId));
    if (draft.id === clientId) resetDraft();
    setDeletingId(null);
  };

  return (
    <div className="space-y-4">
      <Card className="rounded-[28px] border border-slate-200/90 bg-white/[0.92] p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Clientes</p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">Clientes activos del workspace</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">Administra clientes, revisa su carga actual y entra al detalle para ver proyectos y tareas relacionados.</p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            <span className="rounded-2xl border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-700">Total: {stats.total}</span>
            <span className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 font-semibold text-emerald-700">Activos: {stats.active}</span>
            <span className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2 font-semibold text-amber-700">En pausa: {stats.paused}</span>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="space-y-5 rounded-[28px] border border-slate-200/90 bg-white/[0.92] p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Listado de clientes</h2>
              <p className="text-sm text-slate-500">Resultado actual {initialQuery ? `para “${initialQuery}”` : 'de la organización activa'}.</p>
            </div>
            <button
              type="button"
              onClick={resetDraft}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <Plus className="h-4 w-4" />
              Nuevo
            </button>
          </div>

          <div className="grid gap-3">
            {list.length ? list.map((item) => (
              <div key={item.id} className="rounded-[24px] border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:bg-slate-50/60">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge value={item.status} />
                      <span className="text-xs text-slate-500">Creado: {item.createdAtLabel}</span>
                    </div>
                    <h3 className="mt-3 text-lg font-semibold text-slate-900">{item.name}</h3>
                    <p className="mt-1 text-sm text-slate-500">{item.notes || 'Cliente listo para agrupar proyectos, tareas y actividad del workspace o de tu cuenta personal.'}</p>
                  </div>
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                    <Building2 className="h-5 w-5" />
                  </span>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Proyectos</p>
                    <p className="mt-2 text-xl font-bold text-slate-900">{item.projectsCount}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Tareas abiertas</p>
                    <p className="mt-2 text-xl font-bold text-slate-900">{item.openTasksCount}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Completadas</p>
                    <p className="mt-2 text-xl font-bold text-slate-900">{item.completedTasksCount}</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Link href={`/app/clients/${item.id}`} className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                    Ver detalle
                  </Link>
                  <button type="button" onClick={() => startEdit(item)} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                    <Pencil className="h-4 w-4" />
                    Editar
                  </button>
                  <button type="button" onClick={() => deleteClient(item.id)} disabled={deletingId === item.id} className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-60">
                    <Trash2 className="h-4 w-4" />
                    {deletingId === item.id ? 'Borrando...' : 'Borrar'}
                  </button>
                </div>
              </div>
            )) : (
              <EmptyState
                icon={<Building2 className="h-6 w-6" />}
                title="No hay clientes para mostrar"
                description="Crea el primer cliente para empezar a relacionar proyectos y tareas con cuentas reales."
              />
            )}
          </div>
        </Card>

        <Card className="rounded-[28px] border border-slate-200/90 bg-white/[0.92] p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{mode === 'edit' ? 'Editar cliente' : 'Nuevo cliente'}</p>
              <h2 className="mt-2 text-lg font-semibold text-slate-900">{mode === 'edit' ? draft.name || 'Editar cliente' : 'Crear cliente'}</h2>
            </div>
            {mode === 'edit' ? (
              <button type="button" onClick={resetDraft} className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50">
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          <div className="mt-5 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Nombre</label>
              <Input value={draft.name} onChange={(e) => setDraft((cur) => ({ ...cur, name: e.target.value }))} placeholder="Nombre del cliente" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Estado</label>
              <select value={draft.status} onChange={(e) => setDraft((cur) => ({ ...cur, status: e.target.value as ClientStatus }))} className="flex h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100">
                <option value="activo">Activo</option>
                <option value="en_pausa">En pausa</option>
                <option value="cerrado">Cerrado</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Notas</label>
              <Textarea value={draft.notes} onChange={(e) => setDraft((cur) => ({ ...cur, notes: e.target.value }))} placeholder="Contexto del cliente, acuerdos o notas clave." />
            </div>

            {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</div> : null}
            {message ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{message}</div> : null}

            <div className="flex flex-wrap gap-3">
              <Button type="button" loading={saving} onClick={saveClient}>
                <Save className="h-4 w-4" />
                {mode === 'edit' ? 'Guardar cambios' : 'Crear cliente'}
              </Button>
              <Button type="button" variant="secondary" onClick={resetDraft}>
                Restablecer
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
