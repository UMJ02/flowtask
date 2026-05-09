'use client';

import { ChangeEvent, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ChevronDown, FileSpreadsheet, Filter, Globe2, MoreVertical, Pencil, Plus, Save, Search, ShieldCheck, Tags, Trash2, UploadCloud, Users, X, ImagePlus } from 'lucide-react';
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
  avatarUrl: string;
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

const EMPTY_DRAFT: Draft = { name: '', contactEmail: '', status: 'activo', notes: '', avatarUrl: '' };
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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [query, setQuery] = useState(initialQuery);
  const [statusFilter, setStatusFilter] = useState<ClientStatus | 'all'>('all');
  const [clientAvatarFile, setClientAvatarFile] = useState<File | null>(null);

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

  const filteredClients = useMemo(() => {
    const needle = normalizeCatalogName(query);
    return list.filter((item) => {
      const matchesQuery = !needle || [item.name, item.contactEmail ?? '', item.notes ?? ''].some((value) => normalizeCatalogName(value).includes(needle));
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [list, query, statusFilter]);

  const filteredDepartments = useMemo(() => {
    const needle = normalizeCatalogName(query);
    return departments.filter((item) => !needle || [item.name, item.phone ?? ''].some((value) => normalizeCatalogName(value).includes(needle)));
  }, [departments, query]);

  const filteredCountries = useMemo(() => {
    const needle = normalizeCatalogName(query);
    return countries.filter((item) => !needle || normalizeCatalogName(item.name).includes(needle));
  }, [countries, query]);

  const resetDraft = (clearFeedback = true) => {
    setDraft(EMPTY_DRAFT);
    setClientAvatarFile(null);
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
    setDraft({ id: item.id, name: item.name, contactEmail: item.contactEmail ?? '', status: item.status, notes: item.notes ?? '', avatarUrl: item.avatarUrl ?? '' });
    setClientAvatarFile(null);
    setMode('edit');
    setActiveTab('clients');
    setDrawerOpen(true);
    setError(null);
    setMessage(null);
  };
  const startDepartmentEdit = (item: DepartmentItem) => {
    setDepartmentDraft({ id: item.id, name: item.name, phone: item.phone ?? '' });
    setDepartmentMode('edit');
    setActiveTab('departments');
    setDrawerOpen(true);
    setError(null);
    setMessage(null);
  };
  const startCountryEdit = (item: CountryItem) => {
    setCountryDraft({ id: item.id, name: item.name });
    setCountryMode('edit');
    setActiveTab('countries');
    setDrawerOpen(true);
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
      let avatarUrl = draft.avatarUrl || null;
      if (clientAvatarFile) {
        if (clientAvatarFile.size > 5 * 1024 * 1024) throw new Error('La foto del cliente debe pesar menos de 5 MB.');
        const extension = clientAvatarFile.name.split('.').pop()?.toLowerCase() || 'jpg';
        const path = `clients/${workspace.activeOrganizationId ?? workspace.user.id}/${draft.id ?? `new-${Date.now()}`}/${Date.now()}.${extension}`;
        const upload = await workspace.supabase.storage.from('attachments').upload(path, clientAvatarFile, { upsert: true, contentType: clientAvatarFile.type || 'image/jpeg' });
        if (upload.error) throw upload.error;
        avatarUrl = workspace.supabase.storage.from('attachments').getPublicUrl(path).data.publicUrl;
      }
      const payload = {
        organization_id: workspace.activeOrganizationId,
        account_owner_id: workspace.activeOrganizationId ? null : workspace.user.id,
        name: normalizedClientName,
        contact_email: draft.contactEmail.trim() || null,
        status: draft.status,
        notes: draft.notes.trim() || null,
        avatar_url: avatarUrl,
      };
      if (mode === 'edit' && draft.id) {
        const { error: updateError } = await workspace.supabase.from('clients').update(payload).eq('id', draft.id);
        if (updateError) throw updateError;
        setList((current) => current.map((item) => item.id === draft.id ? { ...item, ...payload, contactEmail: payload.contact_email, avatarUrl: payload.avatar_url } : item));
        setMessage('Registro actualizado correctamente.');
        resetDraft(false);
        setDrawerOpen(false);
        return;
      }
      const { data, error: insertError } = await workspace.supabase.from('clients').insert(payload).select('id,name,status,notes,contact_email,avatar_url').single();
      if (insertError) throw insertError;
      setList((current) => [{ id: data.id, name: data.name, status: data.status, notes: data.notes ?? null, contactEmail: data.contact_email ?? null, avatarUrl: data.avatar_url ?? null, createdAtLabel: 'Hoy', projectsCount: 0, openTasksCount: 0, completedTasksCount: 0, overdueTasksCount: 0 }, ...current]);
      setMessage('Registro creado correctamente.');
      resetDraft(false);
      setDrawerOpen(false);
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
        setDrawerOpen(false);
        return;
      }
      const { data, error: insertError } = await workspace.supabase.from('departments').insert(payload).select('id,code,name,phone').single();
      if (insertError) throw insertError;
      setDepartments((current) => [{ id: String(data.id), code: String(data.code), name: String(data.name), phone: (data.phone as string | null | undefined) ?? null, isSystem: false }, ...current]);
      setMessage('Departamento creado correctamente.');
      resetDepartmentDraft(false);
      setDrawerOpen(false);
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
        setDrawerOpen(false);
        return;
      }
      const { data, error: insertError } = await workspace.supabase.from('countries').insert(payload).select('id,code,name').single();
      if (insertError) throw insertError;
      setCountries((current) => [{ id: String(data.id), code: String(data.code), name: String(data.name), isSystem: false }, ...current]);
      setMessage('País creado correctamente.');
      resetCountryDraft(false);
      setDrawerOpen(false);
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

  const openCreate = (tab: TabKey = activeTab) => {
    setActiveTab(tab);
    if (tab === 'clients') resetDraft(false);
    if (tab === 'departments') resetDepartmentDraft(false);
    if (tab === 'countries') resetCountryDraft(false);
    setError(null);
    setMessage(null);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    if (activeTab === 'clients') resetDraft(false);
    if (activeTab === 'departments') resetDepartmentDraft(false);
    if (activeTab === 'countries') resetCountryDraft(false);
  };

  const tabs: Array<{ key: TabKey; label: string; helper: string; icon: ReactNode; count: number }> = [
    { key: 'clients', label: 'Clientes', helper: 'Registro de cuentas y contactos', icon: <Users className="h-4 w-4" />, count: list.length },
    { key: 'departments', label: 'Departamentos', helper: 'Catálogo para tareas y proyectos', icon: <ShieldCheck className="h-4 w-4" />, count: departments.length },
    { key: 'countries', label: 'Países', helper: 'Lista desplegable personalizable', icon: <Globe2 className="h-4 w-4" />, count: countries.length },
  ];

  const currentTab = tabs.find((tab) => tab.key === activeTab) ?? tabs[0];
  const activeCount = activeTab === 'clients' ? filteredClients.length : activeTab === 'departments' ? filteredDepartments.length : filteredCountries.length;
  const drawerTitle = activeTab === 'clients'
    ? (mode === 'edit' ? 'Editar cliente' : 'Nuevo cliente')
    : activeTab === 'departments'
      ? (departmentMode === 'edit' ? 'Editar departamento' : 'Nuevo departamento')
      : (countryMode === 'edit' ? 'Editar país' : 'Nuevo país');

  return (
    <div className="space-y-5">
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_560px]">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-emerald-600">Registros</p>
          <h1 className="mt-3 text-[24px] font-semibold tracking-[-0.028em] text-slate-950 md:text-[28px]">Catálogos del workspace para proyectos y tareas</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">Centraliza registros de clientes, departamentos y países para que después aparezcan en las listas desplegables de tareas y proyectos.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <MetricCard icon={<Users className="h-5 w-5" />} label="Registros" value={stats.total} tone="emerald" />
          <MetricCard icon={<ShieldCheck className="h-5 w-5" />} label="Departamentos" value={departments.length} tone="slate" />
          <MetricCard icon={<Globe2 className="h-5 w-5" />} label="Países" value={countries.length} tone="blue" />
        </div>
      </section>

      <Card className="overflow-hidden rounded-[20px] border border-slate-200/90 bg-white">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 px-5 py-4">
          {tabs.map((tab) => {
            const isActive = tab.key === activeTab;
            return (
              <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key)} className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold transition ${isActive ? 'bg-slate-950 text-white' : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}>
                {tab.icon}{tab.label}<span className={`rounded-full px-2 py-0.5 text-xs ${isActive ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-500'}`}>{tab.count}</span>
              </button>
            );
          })}
        </div>

        <div className="px-5 py-5">
          {error ? <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div> : null}
          {message ? <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{message}</div> : null}

          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-[-0.03em] text-slate-950">
                {activeTab === 'clients' ? 'Clientes registrados' : activeTab === 'departments' ? 'Departamentos disponibles' : 'Países disponibles'}
              </h2>
              <p className="mt-1 text-sm text-slate-500">{activeTab === 'clients' ? 'Listado de todos los clientes de la organización.' : activeTab === 'departments' ? 'Se usan luego en formularios de tareas y proyectos.' : 'Se mostrarán como lista desplegable en proyectos y tareas.'}</p>
            </div>
            <button type="button" onClick={() => openCreate(activeTab)} className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 text-[13px] font-bold text-white transition hover:-translate-y-0.5 hover:bg-slate-900">
              <Plus className="h-4 w-4" />{activeTab === 'clients' ? 'Nuevo cliente' : activeTab === 'departments' ? 'Nuevo departamento' : 'Nuevo país'}
            </button>
          </div>

          <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="relative w-full max-w-[440px]"><Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={activeTab === 'clients' ? 'Buscar cliente...' : activeTab === 'departments' ? 'Buscar departamento...' : 'Buscar país...'} className="h-10 rounded-2xl border-slate-200 bg-white pl-12 shadow-none" /></div>
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={() => { setQuery(''); setStatusFilter('all'); }} className="inline-flex h-10 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3.5 text-[13px] font-bold text-slate-700 transition hover:bg-slate-50"><Filter className="h-4 w-4" /> Limpiar filtros</button>
              {activeTab === 'clients' ? (
                <label className="relative inline-flex h-10 items-center rounded-2xl border border-slate-200 bg-white px-3.5 text-[13px] font-bold text-slate-700">
                  <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as ClientStatus | 'all')} className="appearance-none bg-transparent pr-8 outline-none"><option value="all">Todos</option><option value="activo">Activo</option><option value="en_pausa">En pausa</option><option value="cerrado">Cerrado</option></select>
                  <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4 text-slate-400" />
                </label>
              ) : null}
            </div>
          </div>

          {activeTab === 'clients' ? <ClientsTable rows={filteredClients} deletingId={deletingId} onEdit={startEdit} onDelete={deleteClient} /> : null}
          {activeTab === 'departments' ? <DepartmentsTable rows={filteredDepartments} deletingId={deletingDepartmentId} onEdit={startDepartmentEdit} onDelete={deleteDepartment} /> : null}
          {activeTab === 'countries' ? <CountriesTable rows={filteredCountries} deletingId={deletingCountryId} onEdit={startCountryEdit} onDelete={deleteCountry} /> : null}

          <div className="mt-5 flex flex-col gap-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between"><span>Mostrando {activeCount} de {currentTab.count} resultados</span><div className="flex items-center gap-2"><button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-400" disabled>‹</button><span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold text-white">1</span><button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-400" disabled>›</button><span className="ml-2 inline-flex h-10 items-center rounded-2xl border border-slate-200 bg-white px-3.5 text-[13px] font-bold text-slate-600">10 / página</span></div></div>
        </div>
      </Card>

      {activeTab === 'clients' ? (
        <Card className="rounded-[20px] border border-slate-200/90 bg-white p-5">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)] lg:items-center">
            <div className="flex items-start gap-4"><span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"><FileSpreadsheet className="h-5 w-5" /></span><div><p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Carga masiva</p><h2 className="mt-2 text-base font-bold text-slate-950">Importar registros desde documento</h2><p className="mt-1 text-sm leading-6 text-slate-500">Acepta CSV o TSV con columnas sugeridas: nombre, correo, estado y notas.</p></div></div>
            <div className="space-y-3"><label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm font-bold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50/60"><UploadCloud className="h-4 w-4" />Subir archivo exportado<input type="file" accept=".csv,.tsv,.txt,text/csv,text/tab-separated-values" className="hidden" onChange={handleImportFile} /></label><Textarea value={importText} onChange={(event) => setImportText(event.target.value)} placeholder={"nombre,correo,estado,notas\nAcme,contacto@acme.com,activo,Cuenta principal"} className="min-h-[92px] rounded-2xl" /><Button type="button" variant="secondary" loading={importing} onClick={() => processImportRows(parseDelimited(importText))}>Importar registros</Button></div>
          </div>
        </Card>
      ) : null}

      <Drawer open={drawerOpen} title={drawerTitle} description="Formulario limpio para crear o editar registros sin saturar la pantalla." onClose={closeDrawer} footer={<div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Button type="button" variant="secondary" onClick={closeDrawer}>Cancelar</Button>{activeTab === 'clients' ? <Button type="button" loading={saving} onClick={saveClient}><Save className="h-4 w-4" />{mode === 'edit' ? 'Guardar cambios' : 'Crear cliente'}</Button> : null}{activeTab === 'departments' ? <Button type="button" loading={savingDepartment} onClick={saveDepartment}><Save className="h-4 w-4" />{departmentMode === 'edit' ? 'Guardar cambios' : 'Crear departamento'}</Button> : null}{activeTab === 'countries' ? <Button type="button" loading={savingCountry} onClick={saveCountry}><Save className="h-4 w-4" />{countryMode === 'edit' ? 'Guardar cambios' : 'Crear país'}</Button> : null}</div>}>
        {activeTab === 'clients' ? <div className="space-y-4"><Field label="Foto del cliente"><div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-3"><span className="inline-flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-emerald-50 text-sm font-semibold text-emerald-700">{draft.avatarUrl ? <img src={draft.avatarUrl} alt={draft.name || 'Cliente'} className="h-full w-full object-cover" /> : <ImagePlus className="h-6 w-6" />}</span><Input type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0] ?? null; setClientAvatarFile(file); if (file) setDraft((cur) => ({ ...cur, avatarUrl: URL.createObjectURL(file) })); }} /></div></Field><Field label="Nombre del cliente"><Input value={draft.name} onChange={(event) => setDraft((cur) => ({ ...cur, name: event.target.value }))} placeholder="Ej. Constructora Bello" /></Field><Field label="Correo"><Input type="email" value={draft.contactEmail} onChange={(event) => setDraft((cur) => ({ ...cur, contactEmail: event.target.value }))} placeholder="contacto@empresa.com" /></Field><Field label="Estado"><select value={draft.status} onChange={(event) => setDraft((cur) => ({ ...cur, status: event.target.value as ClientStatus }))} className="flex h-11 w-full rounded-2xl border border-slate-200 bg-white px-3.5 text-[13px] text-slate-900 shadow-none outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"><option value="activo">Activo</option><option value="en_pausa">En pausa</option><option value="cerrado">Cerrado</option></select></Field><Field label="Notas"><Textarea value={draft.notes} onChange={(event) => setDraft((cur) => ({ ...cur, notes: event.target.value }))} placeholder="Contexto del cliente, acuerdos o notas clave." /></Field></div> : null}
        {activeTab === 'departments' ? <div className="space-y-4"><Field label="Nombre"><Input value={departmentDraft.name} onChange={(event) => setDepartmentDraft((cur) => ({ ...cur, name: event.target.value }))} placeholder="Ej. Mercadeo" /></Field><Field label="Teléfono"><Input value={departmentDraft.phone} onChange={(event) => setDepartmentDraft((cur) => ({ ...cur, phone: event.target.value }))} placeholder="Ej. +506 6000-0000" /></Field></div> : null}
        {activeTab === 'countries' ? <div className="space-y-4"><Field label="Nombre"><Input value={countryDraft.name} onChange={(event) => setCountryDraft((cur) => ({ ...cur, name: event.target.value }))} placeholder="Ej. Costa Rica" /></Field></div> : null}
      </Drawer>
    </div>
  );
}

function initials(value: string) { return value.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'FT'; }
function Field({ label, children }: { label: string; children: ReactNode }) { return <div className="space-y-2"><label className="text-sm font-semibold text-slate-700">{label}</label>{children}</div>; }
function MetricCard({ icon, label, value, tone }: { icon: ReactNode; label: string; value: number; tone: 'emerald' | 'slate' | 'blue' }) { const toneClass = tone === 'emerald' ? 'bg-emerald-50 text-emerald-700' : tone === 'blue' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-700'; return <div className="rounded-[20px] border border-slate-200 bg-white p-5"><div className="flex items-center gap-4"><span className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl ${toneClass}`}>{icon}</span><div><p className="text-sm font-semibold text-slate-500">{label}</p><p className="mt-1 text-xl font-semibold text-slate-950">{value}</p></div></div></div>; }
function Drawer({ open, title, description, children, footer, onClose }: { open: boolean; title: string; description: string; children: ReactNode; footer: ReactNode; onClose: () => void }) { if (!open) return null; return <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/25 backdrop-blur-[2px]" role="dialog" aria-modal="true"><button type="button" aria-label="Cerrar panel" className="absolute inset-0 cursor-default" onClick={onClose} /><aside className="relative flex h-full w-full max-w-[420px] flex-col border-l border-slate-200 bg-white shadow-[var(--ft-shadow-floating)]"><div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-5"><div><p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-600">Registros</p><h2 className="mt-2 text-xl font-bold text-slate-950">{title}</h2><p className="mt-1 text-sm leading-6 text-slate-500">{description}</p></div><button type="button" onClick={onClose} className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"><X className="h-4 w-4" /></button></div><div className="flex-1 overflow-y-auto px-5 py-5">{children}</div><div className="border-t border-slate-100 bg-slate-50/80 px-5 py-4">{footer}</div></aside></div>; }
function ClientsTable({ rows, deletingId, onEdit, onDelete }: { rows: ClientListItem[]; deletingId: string | null; onEdit: (item: ClientListItem) => void; onDelete: (id: string) => void }) { if (!rows.length) return <EmptyState icon={<Users className="h-6 w-6" />} title="No hay clientes con esos criterios" description="Ajusta la búsqueda o crea un nuevo cliente para este workspace." />; return <div className="overflow-hidden rounded-[20px] border border-slate-200 bg-white"><div className="hidden grid-cols-[1.3fr_1fr_1.2fr_.8fr_140px] border-b border-slate-200 bg-slate-50/70 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 lg:grid"><span>Cliente</span><span>Contacto</span><span>Correo</span><span>Estado</span><span>Acciones</span></div>{rows.map((item) => <div key={item.id} className="grid gap-3 border-b border-slate-100 px-4 py-4 transition last:border-b-0 hover:bg-slate-50/70 lg:grid-cols-[1.3fr_1fr_1.2fr_.8fr_140px] lg:items-center"><div className="flex min-w-0 items-center gap-3"><span className="inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-emerald-50 text-sm font-semibold text-emerald-700">{item.avatarUrl ? <img src={item.avatarUrl} alt={item.name} className="h-full w-full object-cover" /> : initials(item.name)}</span><div className="min-w-0"><p className="truncate font-bold text-slate-950">{item.name}</p><p className="text-xs text-slate-500">{item.projectsCount} proyectos · {item.openTasksCount} tareas abiertas</p></div></div><p className="truncate text-sm text-slate-500">{item.notes || 'Sin contacto adicional'}</p><p className="truncate text-sm text-slate-600">{item.contactEmail || 'Sin correo'}</p><StatusBadge value={item.status} /><div className="flex items-center gap-2 lg:justify-end"><button type="button" onClick={() => onEdit(item)} className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"><Pencil className="h-4 w-4" /></button><button type="button" onClick={() => onDelete(item.id)} disabled={deletingId === item.id} className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 transition hover:bg-rose-100 disabled:opacity-60"><Trash2 className="h-4 w-4" /></button><span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl text-slate-400"><MoreVertical className="h-4 w-4" /></span></div></div>)}</div>; }
function DepartmentsTable({ rows, deletingId, onEdit, onDelete }: { rows: DepartmentItem[]; deletingId: string | null; onEdit: (item: DepartmentItem) => void; onDelete: (id: string) => void }) { if (!rows.length) return <EmptyState icon={<Tags className="h-6 w-6" />} title="No hay departamentos con esos criterios" description="Crea el primero para que aparezca en proyectos y tareas." />; return <div className="overflow-hidden rounded-[20px] border border-slate-200 bg-white"><div className="hidden grid-cols-[1.4fr_1fr_.8fr_140px] border-b border-slate-200 bg-slate-50/70 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 lg:grid"><span>Nombre</span><span>Teléfono</span><span>Estado</span><span>Acciones</span></div>{rows.map((item) => <div key={item.id} className="grid gap-3 border-b border-slate-100 px-4 py-4 transition last:border-b-0 hover:bg-slate-50/70 lg:grid-cols-[1.4fr_1fr_.8fr_140px] lg:items-center"><div className="flex items-center gap-3"><span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700"><Tags className="h-4 w-4" /></span><p className="font-bold text-slate-950">{item.name}</p></div><p className="text-sm text-slate-500">{item.phone || 'Sin teléfono'}</p><span className="w-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">Activo</span><div className="flex items-center gap-2 lg:justify-end"><button type="button" onClick={() => onEdit(item)} className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"><Pencil className="h-4 w-4" /></button><button type="button" onClick={() => onDelete(item.id)} disabled={deletingId === item.id || item.isSystem} className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 transition hover:bg-rose-100 disabled:opacity-40"><Trash2 className="h-4 w-4" /></button><span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl text-slate-400"><MoreVertical className="h-4 w-4" /></span></div></div>)}</div>; }
function CountriesTable({ rows, deletingId, onEdit, onDelete }: { rows: CountryItem[]; deletingId: string | null; onEdit: (item: CountryItem) => void; onDelete: (id: string) => void }) { if (!rows.length) return <EmptyState icon={<Globe2 className="h-6 w-6" />} title="No hay países con esos criterios" description="Crea el primero para personalizar el formulario del workspace." />; return <div className="overflow-hidden rounded-[20px] border border-slate-200 bg-white"><div className="hidden grid-cols-[1.4fr_.8fr_140px] border-b border-slate-200 bg-slate-50/70 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 lg:grid"><span>País</span><span>Estado</span><span>Acciones</span></div>{rows.map((item) => <div key={item.id} className="grid gap-3 border-b border-slate-100 px-4 py-4 transition last:border-b-0 hover:bg-slate-50/70 lg:grid-cols-[1.4fr_.8fr_140px] lg:items-center"><div className="flex items-center gap-3"><span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-700"><Globe2 className="h-4 w-4" /></span><p className="font-bold text-slate-950">{item.name}</p></div><span className="w-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">Activo</span><div className="flex items-center gap-2 lg:justify-end"><button type="button" onClick={() => onEdit(item)} className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"><Pencil className="h-4 w-4" /></button><button type="button" onClick={() => onDelete(item.id)} disabled={deletingId === item.id || item.isSystem} className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 transition hover:bg-rose-100 disabled:opacity-40"><Trash2 className="h-4 w-4" /></button><span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl text-slate-400"><MoreVertical className="h-4 w-4" /></span></div></div>)}</div>; }
