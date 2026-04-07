'use client';

import { ChangeEvent, useMemo, useState } from 'react';
import Link from 'next/link';
import { Building2, FileSpreadsheet, Mail, Pencil, Plus, Save, Trash2, UploadCloud, X } from 'lucide-react';
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
  contactEmail: string;
  status: ClientStatus;
  notes: string;
};

type ImportRow = {
  name: string;
  contactEmail: string | null;
  status: ClientStatus;
  notes: string | null;
};

const EMPTY_DRAFT: Draft = {
  name: '',
  contactEmail: '',
  status: 'activo',
  notes: '',
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function normalizeHeader(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function normalizeStatus(value?: string | null): ClientStatus {
  const safe = (value ?? '').toLowerCase().trim();
  if (safe === 'en pausa' || safe === 'en_pausa' || safe === 'pause') return 'en_pausa';
  if (safe === 'cerrado' || safe === 'closed') return 'cerrado';
  return 'activo';
}

function parseDelimited(text: string): ImportRow[] {
  const safeText = text.replace(/\r/g, '').trim();
  if (!safeText) return [];
  const lines = safeText.split('\n').map((line) => line.trim()).filter(Boolean);
  if (!lines.length) return [];

  const delimiter = lines[0].includes('\t') ? '\t' : ';';
  const primaryDelimiter = delimiter === ';' ? ';' : '\t';
  const fallbackDelimiter = primaryDelimiter === ';' ? ',' : primaryDelimiter;

  const splitRow = (line: string) => {
    const picked = line.includes(primaryDelimiter) ? primaryDelimiter : fallbackDelimiter;
    return line.split(picked).map((cell) => cell.trim().replace(/^"|"$/g, ''));
  };

  const rawHeader = splitRow(lines[0]);
  const headerMap = rawHeader.map(normalizeHeader);
  const hasHeader = headerMap.some((cell) => ['nombre', 'name', 'cliente', 'correo', 'email', 'estado', 'status', 'notas', 'notes'].includes(cell));
  const dataLines = hasHeader ? lines.slice(1) : lines;

  return dataLines
    .map((line) => splitRow(line))
    .map((cells) => {
      const fromHeader = (keys: string[], fallbackIndex: number) => {
        const index = headerMap.findIndex((cell) => keys.includes(cell));
        if (index >= 0) return cells[index] ?? '';
        return cells[fallbackIndex] ?? '';
      };

      const name = hasHeader ? fromHeader(['nombre', 'name', 'cliente'], 0) : cells[0] ?? '';
      const contactEmail = hasHeader ? fromHeader(['correo', 'email', 'mail'], 1) : cells[1] ?? '';
      const status = hasHeader ? fromHeader(['estado', 'status'], 2) : cells[2] ?? '';
      const notes = hasHeader ? fromHeader(['notas', 'notes', 'detalle'], 3) : cells[3] ?? '';

      return {
        name: name.trim(),
        contactEmail: contactEmail.trim() || null,
        status: normalizeStatus(status),
        notes: notes.trim() || null,
      };
    })
    .filter((row) => row.name);
}

export function ClientManagerPanel({ items, initialQuery = '' }: { items: ClientListItem[]; initialQuery?: string }) {
  const [list, setList] = useState(items);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [importText, setImportText] = useState('');

  const stats = useMemo(() => ({
    total: list.length,
    active: list.filter((item) => item.status === 'activo').length,
    paused: list.filter((item) => item.status === 'en_pausa').length,
  }), [list]);

  const resetDraft = (clearFeedback = true) => {
    setDraft(EMPTY_DRAFT);
    setMode('create');
    if (clearFeedback) {
      setError(null);
      setMessage(null);
    }
  };

  const startEdit = (item: ClientListItem) => {
    setDraft({
      id: item.id,
      name: item.name,
      contactEmail: item.contactEmail ?? '',
      status: item.status,
      notes: item.notes ?? '',
    });
    setMode('edit');
    setError(null);
    setMessage(null);
  };

  const buildPayload = async () => {
    const workspace = await getClientWorkspaceContext();
    if (!workspace.user) {
      throw new Error('No encontramos una sesión activa para guardar este cliente.');
    }

    return {
      workspace,
      payload: {
        organization_id: workspace.activeOrganizationId,
        account_owner_id: workspace.activeOrganizationId ? null : workspace.user.id,
        name: draft.name.trim(),
        contact_email: draft.contactEmail.trim() || null,
        status: draft.status,
        notes: draft.notes.trim() || null,
      },
    };
  };

  const saveClient = async () => {
    setError(null);
    setMessage(null);
    if (!draft.name.trim()) {
      setError('El nombre del cliente es obligatorio.');
      return;
    }
    if (draft.contactEmail.trim() && !isValidEmail(draft.contactEmail)) {
      setError('El correo del cliente no tiene un formato válido.');
      return;
    }

    setSaving(true);

    try {
      const { workspace, payload } = await buildPayload();
      const supabase = workspace.supabase;

      if (mode === 'edit' && draft.id) {
        const { error: updateError } = await supabase.from('clients').update(payload).eq('id', draft.id);
        if (updateError) throw updateError;
        setList((current) => current.map((item) => item.id === draft.id ? { ...item, ...payload, contactEmail: payload.contact_email } : item));
        setMessage('Cliente actualizado correctamente.');
        resetDraft(false);
        return;
      }

      const { data, error: insertError } = await supabase
        .from('clients')
        .insert(payload)
        .select('id,name,status,notes,contact_email,created_at')
        .single();

      if (insertError) throw insertError;

      setList((current) => [{
        id: data.id,
        name: data.name,
        status: data.status,
        notes: data.notes ?? null,
        contactEmail: data.contact_email ?? null,
        createdAtLabel: 'Hoy',
        projectsCount: 0,
        openTasksCount: 0,
        completedTasksCount: 0,
        overdueTasksCount: 0,
      }, ...current]);
      setMessage('Cliente creado correctamente.');
      resetDraft(false);
    } catch (err: any) {
      setError(err?.message ?? 'No pudimos guardar el cliente.');
    } finally {
      setSaving(false);
    }
  };

  const deleteClient = async (clientId: string) => {
    const ok = window.confirm('¿Deseas eliminar este cliente? Los proyectos o tareas relacionados deben quedar desvinculados según la base de datos.');
    if (!ok) return;

    setDeletingId(clientId);
    setError(null);
    try {
      const workspace = await getClientWorkspaceContext();
      const supabase = workspace.supabase;
      const { error: deleteError } = await supabase.from('clients').delete().eq('id', clientId);
      if (deleteError) throw deleteError;
      setList((current) => current.filter((item) => item.id !== clientId));
      if (draft.id === clientId) resetDraft();
    } catch (err: any) {
      setError(err?.message ?? 'No pudimos eliminar el cliente.');
    } finally {
      setDeletingId(null);
    }
  };

  const processImportRows = async (rows: ImportRow[]) => {
    if (!rows.length) {
      setError('No encontramos filas válidas para importar. Usa columnas nombre, correo, estado y notas.');
      return;
    }

    const invalid = rows.find((row) => row.contactEmail && !isValidEmail(row.contactEmail));
    if (invalid) {
      setError(`El correo ${invalid.contactEmail} no tiene formato válido.`);
      return;
    }

    setImporting(true);
    setError(null);
    setMessage(null);

    try {
      const workspace = await getClientWorkspaceContext();
      if (!workspace.user && !workspace.activeOrganizationId) throw new Error('No encontramos una sesión activa para importar clientes.');
      const supabase = workspace.supabase;
      const accountOwnerId = workspace.activeOrganizationId ? null : workspace.user?.id ?? null;
      const payload = rows.map((row) => ({
        organization_id: workspace.activeOrganizationId,
        account_owner_id: accountOwnerId,
        name: row.name,
        contact_email: row.contactEmail,
        status: row.status,
        notes: row.notes,
      }));

      const { data, error: insertError } = await supabase
        .from('clients')
        .insert(payload)
        .select('id,name,status,notes,contact_email,created_at');

      if (insertError) throw insertError;

      const mapped = (data ?? []).map((row: any) => ({
        id: row.id as string,
        name: row.name as string,
        status: row.status as ClientStatus,
        notes: (row.notes as string | null | undefined) ?? null,
        contactEmail: (row.contact_email as string | null | undefined) ?? null,
        createdAtLabel: 'Hoy',
        projectsCount: 0,
        openTasksCount: 0,
        completedTasksCount: 0,
        overdueTasksCount: 0,
      }));

      setList((current) => [...mapped, ...current]);
      setImportText('');
      setMessage(`${mapped.length} cliente(s) importado(s) correctamente.`);
    } catch (err: any) {
      setError(err?.message ?? 'No pudimos importar el archivo de clientes.');
    } finally {
      setImporting(false);
    }
  };

  const handleImportFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      await processImportRows(parseDelimited(text));
    } finally {
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <Card className="rounded-[28px] border border-slate-200/90 bg-white/[0.92] p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Clientes</p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">Clientes activos del workspace</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">Administra clientes uno a uno o acelera la carga importando un archivo CSV o TSV exportado desde Google Sheets o Excel.</p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            <span className="rounded-2xl border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-700">Total: {stats.total}</span>
            <span className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 font-semibold text-emerald-700">Activos: {stats.active}</span>
            <span className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2 font-semibold text-amber-700">En pausa: {stats.paused}</span>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Card className="space-y-5 rounded-[28px] border border-slate-200/90 bg-white/[0.92] p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Listado de clientes</h2>
              <p className="text-sm text-slate-500">Resultado actual {initialQuery ? `para “${initialQuery}”` : 'de la organización activa'}.</p>
            </div>
            <button
              type="button"
              onClick={() => resetDraft()}
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
                    {item.contactEmail ? (
                      <p className="mt-2 inline-flex items-center gap-2 text-sm text-slate-600">
                        <Mail className="h-4 w-4 text-slate-400" />
                        {item.contactEmail}
                      </p>
                    ) : null}
                    <p className="mt-1 text-sm text-slate-500">{item.notes || 'Cliente listo para agrupar proyectos, tareas, actividad y notificaciones del workspace o de tu cuenta personal.'}</p>
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
                description="Crea el primer cliente o importa un documento para empezar a relacionar proyectos y tareas con cuentas reales."
              />
            )}
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="rounded-[28px] border border-slate-200/90 bg-white/[0.92] p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{mode === 'edit' ? 'Editar cliente' : 'Nuevo cliente'}</p>
                <h2 className="mt-2 text-lg font-semibold text-slate-900">{mode === 'edit' ? draft.name || 'Editar cliente' : 'Crear cliente'}</h2>
              </div>
              {mode === 'edit' ? (
                <button type="button" onClick={() => resetDraft()} className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50">
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
                <label className="text-sm font-medium text-slate-700">Correo de contacto</label>
                <Input type="email" value={draft.contactEmail} onChange={(e) => setDraft((cur) => ({ ...cur, contactEmail: e.target.value }))} placeholder="cliente@empresa.com" />
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
                <Button type="button" variant="secondary" onClick={() => resetDraft()}>
                  Restablecer
                </Button>
              </div>
            </div>
          </Card>

          <Card className="rounded-[28px] border border-slate-200/90 bg-white/[0.92] p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <FileSpreadsheet className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Carga masiva</p>
                <h2 className="mt-2 text-lg font-semibold text-slate-900">Importar clientes desde documento</h2>
                <p className="mt-2 text-sm text-slate-500">Acepta archivos CSV o TSV exportados desde Google Sheets, Excel o cualquier documento tabular. Columnas sugeridas: nombre, correo, estado y notas.</p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50/60">
                <UploadCloud className="h-4 w-4" />
                Subir archivo exportado
                <input type="file" accept=".csv,.tsv,.txt,text/csv,text/tab-separated-values" className="hidden" onChange={handleImportFile} />
              </label>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">O pega los datos aquí</label>
                <Textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder={"nombre,correo,estado,notas\nAcme,contacto@acme.com,activo,Cuenta principal\nNova,nova@empresa.com,en_pausa,Esperando reactivación"}
                  className="min-h-[140px]"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <Button type="button" variant="secondary" loading={importing} onClick={() => processImportRows(parseDelimited(importText))}>
                  Importar registros
                </Button>
                <span className="text-xs text-slate-500">Tip: si exportas desde Google Sheets, descarga en CSV y súbelo aquí.</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
