'use client';

import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Building2, FileSpreadsheet, Globe2, Mail, Pencil, Plus, Save, Tags, Trash2, UploadCloud, Users, X } from 'lucide-react';
import { getClientWorkspaceContext, slugifyWorkspaceValue, fetchWorkspaceCountries, fetchWorkspaceDepartments } from '@/lib/supabase/workspace-client';
import type { ClientListItem, ClientStatus } from '@/types/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/ui/empty-state';

type TabKey = 'clients' | 'departments' | 'countries';

type Draft = {
  id?: string;
  name: string;
  contactEmail: string;
  status: ClientStatus;
  notes: string;
};

type DepartmentItem = {
  id: string;
  code: string;
  name: string;
  phone?: string | null;
  isSystem?: boolean;
};

type CountryItem = {
  id: string;
  code: string;
  name: string;
  isSystem?: boolean;
};

type DepartmentDraft = { id?: string; name: string; phone: string };

type CountryDraft = { id?: string; name: string };

type ImportRow = {
  name: string;
  contactEmail: string | null;
  status: ClientStatus;
  notes: string | null;
};

const EMPTY_DRAFT: Draft = { name: '', contactEmail: '', status: 'activo', notes: '' };
const EMPTY_DEPARTMENT_DRAFT: DepartmentDraft = { name: '', phone: '' };
const EMPTY_COUNTRY_DRAFT: CountryDraft = { name: '' };

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function normalizeHeader(value: string) {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

function normalizeCatalogName(value: string) {
  return value.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
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
  const [activeTab, setActiveTab] = useState<TabKey>('clients');
  const [list, setList] = useState(items);
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [countries, setCountries] = useState<CountryItem[]>([]);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [departmentDraft, setDepartmentDraft] = useState<DepartmentDraft>(EMPTY_DEPARTMENT_DRAFT);
  const [countryDraft, setCountryDraft] = useState<CountryDraft>(EMPTY_COUNTRY_DRAFT);
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  const [departmentMode, setDepartmentMode] = useState<'create' | 'edit'>('create');
  const [countryMode, setCountryMode] = useState<'create' | 'edit'>('create');
  const [saving, setSaving] = useState(false);
  const [savingDepartment, setSavingDepartment] = useState(false);
  const [savingCountry, setSavingCountry] = useState(false);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingDepartmentId, setDeletingDepartmentId] = useState<string | null>(null);
  const [deletingCountryId, setDeletingCountryId] = useState<string | null>(null);
  const [importText, setImportText] = useState('');

  useEffect(() => {
    let active = true;
    const loadCatalogs = async () => {
      const workspace = await getClientWorkspaceContext();
      if (!workspace.user) return;
      const userId = workspace.user.id;
      const [departmentRows, countryRows] = await Promise.all([
        fetchWorkspaceDepartments(workspace.supabase, userId, workspace.activeOrganizationId),
        fetchWorkspaceCountries(workspace.supabase, userId, workspace.activeOrganizationId),
      ]);
      if (!active) return;
      setDepartments(departmentRows);
      setCountries(countryRows);
    };
    void loadCatalogs();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    setError(null);
    setMessage(null);
  }, [activeTab]);

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
  const resetDepartmentDraft = (clearFeedback = true) => {
    setDepartmentDraft(EMPTY_DEPARTMENT_DRAFT);
    setDepartmentMode('create');
    if (clearFeedback) {
      setError(null);
      setMessage(null);
    }
  };
  const resetCountryDraft = (clearFeedback = true) => {
    setCountryDraft(EMPTY_COUNTRY_DRAFT);
    setCountryMode('create');
    if (clearFeedback) {
      setError(null);
      setMessage(null);
    }
  };

  const startEdit = (item: ClientListItem) => {
    setDraft({ id: item.id, name: item.name, contactEmail: item.contactEmail ?? '', status: item.status, notes: item.notes ?? '' });
    setMode('edit');
    setActiveTab('clients');
    setError(null);
    setMessage(null);
  };
  const startDepartmentEdit = (item: DepartmentItem) => {
    setDepartmentDraft({ id: item.id, name: item.name, phone: item.phone ?? '' });
    setDepartmentMode('edit');
    setActiveTab('departments');
    setError(null);
    setMessage(null);
  };
  const startCountryEdit = (item: CountryItem) => {
    setCountryDraft({ id: item.id, name: item.name });
    setCountryMode('edit');
    setActiveTab('countries');
    setError(null);
    setMessage(null);
  };

  const saveClient = async () => {
    setError(null);
    setMessage(null);
    if (!draft.name.trim()) return setError('El nombre del registro es obligatorio.');
    if (draft.contactEmail.trim() && !isValidEmail(draft.contactEmail)) return setError('El correo del registro no tiene un formato válido.');
    setSaving(true);
    try {
      const workspace = await getClientWorkspaceContext();
      if (!workspace.user) throw new Error('No encontramos una sesión activa para guardar este registro.');
      const normalizedClientName = draft.name.trim();
      const duplicate = list.find((item) => item.id !== draft.id && normalizeCatalogName(item.name) === normalizeCatalogName(normalizedClientName));
      if (duplicate) throw new Error('Ya existe un registro con ese nombre dentro de este workspace.');
      const payload = {
        organization_id: workspace.activeOrganizationId,
        account_owner_id: workspace.activeOrganizationId ? null : workspace.user.id,
        name: normalizedClientName,
        contact_email: draft.contactEmail.trim() || null,
        status: draft.status,
        notes: draft.notes.trim() || null,
      };
      if (mode === 'edit' && draft.id) {
        const { error: updateError } = await workspace.supabase.from('clients').update(payload).eq('id', draft.id);
        if (updateError) throw updateError;
        setList((current) => current.map((item) => item.id === draft.id ? { ...item, ...payload, contactEmail: payload.contact_email } : item));
        setMessage('Registro actualizado correctamente.');
        resetDraft(false);
        return;
      }
      const { data, error: insertError } = await workspace.supabase.from('clients').insert(payload).select('id,name,status,notes,contact_email').single();
      if (insertError) throw insertError;
      setList((current) => [{ id: data.id, name: data.name, status: data.status, notes: data.notes ?? null, contactEmail: data.contact_email ?? null, createdAtLabel: 'Hoy', projectsCount: 0, openTasksCount: 0, completedTasksCount: 0, overdueTasksCount: 0 }, ...current]);
      setMessage('Registro creado correctamente.');
      resetDraft(false);
    } catch (err: any) {
      setError(err?.message ?? 'No pudimos guardar el registro.');
    } finally {
      setSaving(false);
    }
  };

  const saveDepartment = async () => {
    setError(null); setMessage(null);
    if (!departmentDraft.name.trim()) return setError('El nombre del departamento es obligatorio.');
    setSavingDepartment(true);
    try {
      const workspace = await getClientWorkspaceContext();
      if (!workspace.user) throw new Error('No encontramos una sesión activa para guardar el departamento.');
      const normalizedName = departmentDraft.name.trim();
      const duplicateDepartment = departments.find((item) => item.id !== departmentDraft.id && normalizeCatalogName(item.name) === normalizeCatalogName(normalizedName));
      if (duplicateDepartment) throw new Error('Ya existe un departamento con ese nombre dentro de este workspace.');
      const payload = {
        name: normalizedName,
        phone: departmentDraft.phone.trim() || null,
        organization_id: workspace.activeOrganizationId,
        account_owner_id: workspace.activeOrganizationId ? null : workspace.user.id,
        code: `${slugifyWorkspaceValue(normalizedName)}-${Math.random().toString(36).slice(2, 8)}`,
      };
      if (departmentMode === 'edit' && departmentDraft.id) {
        const { error: updateError } = await workspace.supabase.from('departments').update({ name: normalizedName, phone: payload.phone }).eq('id', departmentDraft.id);
        if (updateError) throw updateError;
        setDepartments((current) => current.map((item) => item.id === departmentDraft.id ? { ...item, name: normalizedName, phone: payload.phone } : item));
        setMessage('Departamento actualizado correctamente.');
        resetDepartmentDraft(false);
        return;
      }
      const { data, error: insertError } = await workspace.supabase.from('departments').insert(payload).select('id,code,name,phone').single();
      if (insertError) throw insertError;
      setDepartments((current) => [{ id: String(data.id), code: String(data.code), name: String(data.name), phone: (data.phone as string | null | undefined) ?? null, isSystem: false }, ...current]);
      setMessage('Departamento creado correctamente.');
      resetDepartmentDraft(false);
    } catch (err: any) {
      const rawMessage = err?.message ?? 'No pudimos guardar el departamento.';
      if (/departments_name_key|departments_scope_name_unique|duplicate key/i.test(rawMessage)) {
        setError('Ya existe un departamento con ese nombre dentro de este workspace.');
      } else {
        setError(rawMessage);
      }
    } finally { setSavingDepartment(false); }
  };

  const saveCountry = async () => {
    setError(null); setMessage(null);
    if (!countryDraft.name.trim()) return setError('El nombre del país es obligatorio.');
    setSavingCountry(true);
    try {
      const workspace = await getClientWorkspaceContext();
      if (!workspace.user) throw new Error('No encontramos una sesión activa para guardar el país.');
      const normalizedName = countryDraft.name.trim();
      const duplicateCountry = countries.find((item) => item.id !== countryDraft.id && normalizeCatalogName(item.name) === normalizeCatalogName(normalizedName));
      if (duplicateCountry) throw new Error('Ya existe un país con ese nombre dentro de este workspace.');
      const payload = {
        name: normalizedName,
        organization_id: workspace.activeOrganizationId,
        account_owner_id: workspace.activeOrganizationId ? null : workspace.user.id,
        code: `${slugifyWorkspaceValue(normalizedName)}-${Math.random().toString(36).slice(2, 8)}`,
      };
      if (countryMode === 'edit' && countryDraft.id) {
        const { error: updateError } = await workspace.supabase.from('countries').update({ name: normalizedName }).eq('id', countryDraft.id);
        if (updateError) throw updateError;
        setCountries((current) => current.map((item) => item.id === countryDraft.id ? { ...item, name: normalizedName } : item));
        setMessage('País actualizado correctamente.');
        resetCountryDraft(false);
        return;
      }
      const { data, error: insertError } = await workspace.supabase.from('countries').insert(payload).select('id,code,name').single();
      if (insertError) throw insertError;
      setCountries((current) => [{ id: String(data.id), code: String(data.code), name: String(data.name), isSystem: false }, ...current]);
      setMessage('País creado correctamente.');
      resetCountryDraft(false);
    } catch (err: any) {
      const rawMessage = err?.message ?? 'No pudimos guardar el país.';
      if (/countries_name_key|countries_scope_name_unique|duplicate key/i.test(rawMessage)) {
        setError('Ya existe un país con ese nombre dentro de este workspace.');
      } else {
        setError(rawMessage);
      }
    } finally { setSavingCountry(false); }
  };

  const deleteClient = async (clientId: string) => {
    if (!window.confirm('¿Deseas eliminar este registro?')) return;
    setDeletingId(clientId); setError(null);
    try {
      const workspace = await getClientWorkspaceContext();
      const { data: rpcData, error: rpcError } = await workspace.supabase.rpc('delete_workspace_client', { p_client_id: clientId });
      if (rpcError) {
        const { error: deleteError } = await workspace.supabase.from('clients').delete().eq('id', clientId);
        if (deleteError) throw deleteError;
      } else if (rpcData && typeof rpcData === 'object' && 'ok' in rpcData && !(rpcData as any).ok) {
        throw new Error(String((rpcData as any).error ?? 'No pudimos eliminar el registro.'));
      }
      setList((current) => current.filter((item) => item.id !== clientId));
      if (draft.id === clientId) resetDraft();
    } catch (err: any) { setError(err?.message ?? 'No pudimos eliminar el registro.'); }
    finally { setDeletingId(null); }
  };

  const deleteDepartment = async (departmentId: string) => {
    const target = departments.find((item) => item.id === departmentId) ?? null;
    if (target?.isSystem) { setError('Este departamento pertenece al catálogo base. Crea uno propio para editarlo o eliminarlo.'); return; }
    if (!window.confirm('¿Deseas eliminar este departamento?')) return;
    setDeletingDepartmentId(departmentId); setError(null); setMessage(null);
    try {
      const workspace = await getClientWorkspaceContext();
      const scopedDepartmentId = Number(departmentId);
      const [taskCleanup, projectCleanup] = await Promise.all([
        workspace.supabase.from('tasks').update({ department_id: null }).eq('department_id', scopedDepartmentId),
        workspace.supabase.from('projects').update({ department_id: null }).eq('department_id', scopedDepartmentId),
      ]);
      if (taskCleanup.error) throw taskCleanup.error;
      if (projectCleanup.error) throw projectCleanup.error;
      const { error: deleteError } = await workspace.supabase.from('departments').delete().eq('id', departmentId);
      if (deleteError) throw deleteError;
      setDepartments((current) => current.filter((item) => item.id !== departmentId));
      if (departmentDraft.id === departmentId) resetDepartmentDraft(false);
      setMessage('Departamento eliminado correctamente.');
    } catch (err: any) {
      setError(err?.message ?? 'No pudimos eliminar el departamento.');
    } finally {
      setDeletingDepartmentId(null);
    }
  };

  const deleteCountry = async (countryId: string) => {
    const target = countries.find((item) => item.id === countryId) ?? null;
    if (target?.isSystem) { setError('Este país pertenece al catálogo base. Crea uno propio para editarlo o eliminarlo.'); return; }
    if (!window.confirm('¿Deseas eliminar este país?')) return;
    setDeletingCountryId(countryId); setError(null); setMessage(null);
    try {
      const workspace = await getClientWorkspaceContext();
      const { error: deleteError } = await workspace.supabase.from('countries').delete().eq('id', countryId);
      if (deleteError) throw deleteError;
      setCountries((current) => current.filter((item) => item.id !== countryId));
      if (countryDraft.id === countryId) resetCountryDraft(false);
      setMessage(target ? `País ${target.name} eliminado correctamente.` : 'País eliminado correctamente.');
    } catch (err: any) {
      setError(err?.message ?? 'No pudimos eliminar el país.');
    } finally {
      setDeletingCountryId(null);
    }
  };

  const processImportRows = async (rows: ImportRow[]) => {
    if (!rows.length) return setError('No encontramos filas válidas para importar. Usa columnas nombre, correo, estado y notas.');
    const invalid = rows.find((row) => row.contactEmail && !isValidEmail(row.contactEmail));
    if (invalid) return setError(`El correo ${invalid.contactEmail} no tiene formato válido.`);
    setImporting(true); setError(null); setMessage(null);
    try {
      const workspace = await getClientWorkspaceContext();
      if (!workspace.user && !workspace.activeOrganizationId) throw new Error('No encontramos una sesión activa para importar registros.');
      const payload = rows.map((row) => ({ organization_id: workspace.activeOrganizationId, account_owner_id: workspace.activeOrganizationId ? null : workspace.user?.id ?? null, name: row.name, contact_email: row.contactEmail, status: row.status, notes: row.notes }));
      const { data, error: insertError } = await workspace.supabase.from('clients').insert(payload).select('id,name,status,notes,contact_email');
      if (insertError) throw insertError;
      const mapped = (data ?? []).map((row: any) => ({ id: row.id as string, name: row.name as string, status: row.status as ClientStatus, notes: (row.notes as string | null | undefined) ?? null, contactEmail: (row.contact_email as string | null | undefined) ?? null, createdAtLabel: 'Hoy', projectsCount: 0, openTasksCount: 0, completedTasksCount: 0, overdueTasksCount: 0 }));
      setList((current) => [...mapped, ...current]);
      setImportText('');
      setMessage(`${mapped.length} registro(s) importado(s) correctamente.`);
    } catch (err: any) { setError(err?.message ?? 'No pudimos importar el archivo de registros.'); }
    finally { setImporting(false); }
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

  const tabs: Array<{ key: TabKey; label: string; helper: string; icon: React.ReactNode }> = [
    { key: 'clients', label: 'Clientes', helper: 'Registro de cuentas y contactos', icon: <Users className="h-4 w-4" /> },
    { key: 'departments', label: 'Departamentos', helper: 'Catálogo para tareas y proyectos', icon: <Tags className="h-4 w-4" /> },
    { key: 'countries', label: 'Países', helper: 'Lista desplegable personalizable', icon: <Globe2 className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-4">
      <Card className="rounded-[28px] border border-slate-200/90 bg-white/[0.92] p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Registros</p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">Catálogos del workspace para proyectos y tareas</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-500">Centraliza registros de clientes, departamentos y países para que después aparezcan en las listas desplegables de tareas y proyectos.</p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            <span className="rounded-2xl border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-700">Registros: {stats.total}</span>
            <span className="rounded-2xl border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-700">Departamentos: {departments.length}</span>
            <span className="rounded-2xl border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-700">Países: {countries.length}</span>
          </div>
        </div>
      </Card>

      <Card className="rounded-[28px] border border-slate-200/90 bg-white/[0.92] p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-4">
          {tabs.map((tab) => {
            const isActive = tab.key === activeTab;
            return (
              <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key)} className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition ${isActive ? 'bg-slate-950 text-white shadow-[0_10px_24px_rgba(15,23,42,0.18)]' : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}>
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-sm text-slate-500">{tabs.find((tab) => tab.key === activeTab)?.helper}</p>

        {error ? <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</div> : null}
        {message ? <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{message}</div> : null}

        {activeTab === 'clients' ? (
          <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Listado de registros</h2>
                  <p className="text-sm text-slate-500">Resultado actual {initialQuery ? `para “${initialQuery}”` : 'de la organización activa'}.</p>
                </div>
                <button type="button" onClick={() => resetDraft()} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"><Plus className="h-4 w-4" />Nuevo</button>
              </div>
              <div className="grid gap-3">
                {list.length ? list.map((item) => (
                  <div key={item.id} className="rounded-[24px] border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:bg-slate-50/60">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2"><StatusBadge value={item.status} /><span className="text-xs text-slate-500">Creado: {item.createdAtLabel}</span></div>
                        <h3 className="mt-3 text-lg font-semibold text-slate-900">{item.name}</h3>
                        {item.contactEmail ? <p className="mt-2 inline-flex items-center gap-2 text-sm text-slate-600"><Mail className="h-4 w-4 text-slate-400" />{item.contactEmail}</p> : null}
                        <p className="mt-1 text-sm text-slate-500">{item.notes || 'Registro listo para relacionar proyectos y tareas del workspace.'}</p>
                      </div>
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-600"><Building2 className="h-5 w-5" /></span>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3"><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Proyectos</p><p className="mt-2 text-xl font-bold text-slate-900">{item.projectsCount}</p></div>
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3"><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Tareas abiertas</p><p className="mt-2 text-xl font-bold text-slate-900">{item.openTasksCount}</p></div>
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3"><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Completadas</p><p className="mt-2 text-xl font-bold text-slate-900">{item.completedTasksCount}</p></div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link href={`/app/clients/${item.id}`} className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Ver detalle</Link>
                      <button type="button" onClick={() => startEdit(item)} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"><Pencil className="h-4 w-4" />Editar</button>
                      <button type="button" onClick={() => deleteClient(item.id)} disabled={deletingId === item.id} className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-60"><Trash2 className="h-4 w-4" />{deletingId === item.id ? 'Borrando...' : 'Borrar'}</button>
                    </div>
                  </div>
                )) : <EmptyState icon={<Building2 className="h-6 w-6" />} title="No hay registros para mostrar" description="Crea el primer cliente para empezar a relacionar proyectos y tareas." />}
              </div>
            </div>
            <div className="space-y-4">
              <Card className="rounded-[28px] border border-slate-200/90 bg-white/[0.92] p-5 shadow-none">
                <div className="flex items-center justify-between gap-3">
                  <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{mode === 'edit' ? 'Editar registro' : 'Nuevo registro'}</p><h2 className="mt-2 text-lg font-semibold text-slate-900">{mode === 'edit' ? draft.name || 'Editar registro' : 'Crear cliente'}</h2></div>
                  {mode === 'edit' ? <button type="button" onClick={() => resetDraft()} className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"><X className="h-4 w-4" /></button> : null}
                </div>
                <div className="mt-5 space-y-4">
                  <div className="space-y-2"><label className="text-sm font-medium text-slate-700">Nombre</label><Input value={draft.name} onChange={(e) => setDraft((cur) => ({ ...cur, name: e.target.value }))} placeholder="Nombre del cliente" /></div>
                  <div className="space-y-2"><label className="text-sm font-medium text-slate-700">Correo de contacto</label><Input type="email" value={draft.contactEmail} onChange={(e) => setDraft((cur) => ({ ...cur, contactEmail: e.target.value }))} placeholder="cliente@empresa.com" /></div>
                  <div className="space-y-2"><label className="text-sm font-medium text-slate-700">Estado</label><select value={draft.status} onChange={(e) => setDraft((cur) => ({ ...cur, status: e.target.value as ClientStatus }))} className="flex h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"><option value="activo">Activo</option><option value="en_pausa">En pausa</option><option value="cerrado">Cerrado</option></select></div>
                  <div className="space-y-2"><label className="text-sm font-medium text-slate-700">Notas</label><Textarea value={draft.notes} onChange={(e) => setDraft((cur) => ({ ...cur, notes: e.target.value }))} placeholder="Contexto del cliente, acuerdos o notas clave." /></div>
                  <div className="flex flex-wrap gap-3"><Button type="button" loading={saving} onClick={saveClient}><Save className="h-4 w-4" />{mode === 'edit' ? 'Guardar cambios' : 'Crear cliente'}</Button><Button type="button" variant="secondary" onClick={() => resetDraft()}>Restablecer</Button></div>
                </div>
              </Card>
              <Card className="rounded-[28px] border border-slate-200/90 bg-white/[0.92] p-5 shadow-none">
                <div className="flex items-start gap-3"><span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"><FileSpreadsheet className="h-5 w-5" /></span><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Carga masiva</p><h2 className="mt-2 text-lg font-semibold text-slate-900">Importar registros desde documento</h2><p className="mt-2 text-sm text-slate-500">Acepta archivos CSV o TSV. Columnas sugeridas: nombre, correo, estado y notas.</p></div></div>
                <div className="mt-5 space-y-4">
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50/60"><UploadCloud className="h-4 w-4" />Subir archivo exportado<input type="file" accept=".csv,.tsv,.txt,text/csv,text/tab-separated-values" className="hidden" onChange={handleImportFile} /></label>
                  <div className="space-y-2"><label className="text-sm font-medium text-slate-700">O pega los datos aquí</label><Textarea value={importText} onChange={(e) => setImportText(e.target.value)} placeholder={"nombre,correo,estado,notas\nAcme,contacto@acme.com,activo,Cuenta principal"} className="min-h-[140px]" /></div>
                  <div className="flex flex-wrap gap-3"><Button type="button" variant="secondary" loading={importing} onClick={() => processImportRows(parseDelimited(importText))}>Importar registros</Button><span className="text-xs text-slate-500">Tip: exporta desde Google Sheets en CSV.</span></div>
                </div>
              </Card>
            </div>
          </div>
        ) : null}

        {activeTab === 'departments' ? (
          <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-3">
              <div><h2 className="text-lg font-semibold text-slate-900">Departamentos disponibles</h2><p className="text-sm text-slate-500">Se usarán luego en los formularios de tareas y proyectos.</p></div>
              {departments.length ? departments.map((item) => (
                <div key={item.id} className="rounded-[22px] border border-slate-200 bg-white px-4 py-4 transition hover:border-slate-300 hover:bg-slate-50/60">
                  <div className="flex items-start justify-between gap-3">
                    <div><p className="text-base font-semibold text-slate-900">{item.name}</p><p className="mt-1 text-sm text-slate-500">{item.phone ? `Tel. ${item.phone}` : 'Sin teléfono registrado'}</p></div>
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"><Tags className="h-4 w-4" /></span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => startDepartmentEdit(item)} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"><Pencil className="h-4 w-4" />Editar</button><button type="button" onClick={() => deleteDepartment(item.id)} disabled={deletingDepartmentId === item.id} className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-60"><Trash2 className="h-4 w-4" />{deletingDepartmentId === item.id ? 'Borrando...' : 'Borrar'}</button></div>
                </div>
              )) : <EmptyState icon={<Tags className="h-6 w-6" />} title="No hay departamentos todavía" description="Crea el primero para que aparezca en proyectos y tareas." />}
            </div>
            <Card className="rounded-[28px] border border-slate-200/90 bg-white/[0.92] p-5 shadow-none">
              <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{departmentMode === 'edit' ? 'Editar departamento' : 'Nuevo departamento'}</p><h2 className="mt-2 text-lg font-semibold text-slate-900">{departmentMode === 'edit' ? departmentDraft.name || 'Editar departamento' : 'Crear departamento'}</h2></div>{departmentMode === 'edit' ? <button type="button" onClick={() => resetDepartmentDraft()} className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"><X className="h-4 w-4" /></button> : null}</div>
              <div className="mt-5 space-y-4"><div className="space-y-2"><label className="text-sm font-medium text-slate-700">Nombre</label><Input value={departmentDraft.name} onChange={(e) => setDepartmentDraft((cur) => ({ ...cur, name: e.target.value }))} placeholder="Ej. Mercadeo" /></div><div className="space-y-2"><label className="text-sm font-medium text-slate-700">Teléfono</label><Input value={departmentDraft.phone} onChange={(e) => setDepartmentDraft((cur) => ({ ...cur, phone: e.target.value }))} placeholder="Ej. +506 6000-0000" /></div><div className="flex flex-wrap gap-3"><Button type="button" loading={savingDepartment} onClick={saveDepartment}><Save className="h-4 w-4" />{departmentMode === 'edit' ? 'Guardar cambios' : 'Crear departamento'}</Button><Button type="button" variant="secondary" onClick={() => resetDepartmentDraft()}>Restablecer</Button></div></div>
            </Card>
          </div>
        ) : null}

        {activeTab === 'countries' ? (
          <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-3">
              <div><h2 className="text-lg font-semibold text-slate-900">Países disponibles</h2><p className="text-sm text-slate-500">Se mostrarán como lista desplegable en proyectos y tareas.</p></div>
              {countries.length ? countries.map((item) => (
                <div key={item.id} className="rounded-[22px] border border-slate-200 bg-white px-4 py-4 transition hover:border-slate-300 hover:bg-slate-50/60">
                  <div className="flex items-start justify-between gap-3"><div><p className="text-base font-semibold text-slate-900">{item.name}</p></div><span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700"><Globe2 className="h-4 w-4" /></span></div>
                  <div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => startCountryEdit(item)} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"><Pencil className="h-4 w-4" />Editar</button><button type="button" onClick={() => deleteCountry(item.id)} disabled={deletingCountryId === item.id} className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-60"><Trash2 className="h-4 w-4" />{deletingCountryId === item.id ? 'Borrando...' : 'Borrar'}</button></div>
                </div>
              )) : <EmptyState icon={<Globe2 className="h-6 w-6" />} title="No hay países todavía" description="Crea el primero para personalizar el formulario del workspace." />}
            </div>
            <Card className="rounded-[28px] border border-slate-200/90 bg-white/[0.92] p-5 shadow-none">
              <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{countryMode === 'edit' ? 'Editar país' : 'Nuevo país'}</p><h2 className="mt-2 text-lg font-semibold text-slate-900">{countryMode === 'edit' ? countryDraft.name || 'Editar país' : 'Crear país'}</h2></div>{countryMode === 'edit' ? <button type="button" onClick={() => resetCountryDraft()} className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"><X className="h-4 w-4" /></button> : null}</div>
              <div className="mt-5 space-y-4"><div className="space-y-2"><label className="text-sm font-medium text-slate-700">Nombre</label><Input value={countryDraft.name} onChange={(e) => setCountryDraft((cur) => ({ ...cur, name: e.target.value }))} placeholder="Ej. Costa Rica" /></div><div className="flex flex-wrap gap-3"><Button type="button" loading={savingCountry} onClick={saveCountry}><Save className="h-4 w-4" />{countryMode === 'edit' ? 'Guardar cambios' : 'Crear país'}</Button><Button type="button" variant="secondary" onClick={() => resetCountryDraft()}>Restablecer</Button></div></div>
            </Card>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
