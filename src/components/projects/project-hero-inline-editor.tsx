"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, CheckCircle2, FolderKanban, Globe2, Link2, Save, Tag, Users, X } from "lucide-react";
import { PROJECT_STATUSES } from "@/lib/constants/project-status";
import { fetchWorkspaceClientsDirectory, fetchWorkspaceCountries, fetchWorkspaceDepartments, findWorkspaceClientId, getClientWorkspaceContext } from "@/lib/supabase/workspace-client";
import { getClientAccessSummary, hasClientAccess } from "@/lib/security/client-access";
import { getWorkspaceDepartmentIdByCode } from "@/lib/queries/departments";
import { generateShareToken } from "@/lib/utils/tokens";
import { logActivity } from "@/lib/activity/log-client";
import { trackEvent } from "@/lib/telemetry/track-event";
import { formatDate } from "@/lib/utils/dates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type ProjectInlineForm = {
  title: string;
  description: string;
  status: string;
  department: string;
  clientName: string;
  country: string;
  dueDate: string;
  isCollaborative: boolean;
};

type Option = { id: string; code: string; name: string };

type ProjectHeroInlineEditorProps = {
  project: any;
  progress: number;
  currentQuery?: string;
};

function getDepartment(project: any) {
  return Array.isArray(project?.departments) ? project.departments[0] : project?.departments;
}

function normalizeDepartmentValue(value?: string | null, options: Option[] = []) {
  const normalized = value?.trim();
  if (!normalized) return "";
  const direct = options.find((item) => item.code === normalized || item.id === normalized);
  if (direct) return direct.code;
  const byName = options.find((item) => item.name.toLowerCase() === normalized.toLowerCase());
  return byName?.code ?? normalized;
}

function normalizeCountryValue(value?: string | null, options: Option[] = []) {
  const normalized = value?.trim();
  if (!normalized) return "";
  const directName = options.find((item) => item.name === normalized);
  if (directName) return directName.name;
  const directCode = options.find((item) => item.code === normalized);
  if (directCode) return directCode.name;
  const byName = options.find((item) => item.name.toLowerCase() === normalized.toLowerCase());
  return byName?.name ?? normalized;
}

function appendMissingOption(rows: Option[], value?: string | null) {
  const normalized = value?.trim();
  if (!normalized) return rows;
  const exists = rows.some((item) => item.id === normalized || item.code === normalized || item.name.toLowerCase() === normalized.toLowerCase());
  return exists ? rows : [{ id: `current-${normalized}`, code: normalized, name: normalized }, ...rows];
}

export function ProjectHeroInlineEditor({ project, progress, currentQuery = "" }: ProjectHeroInlineEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [departmentOptions, setDepartmentOptions] = useState<Option[]>([]);
  const [countryOptions, setCountryOptions] = useState<Option[]>([]);
  const [clientOptions, setClientOptions] = useState<Array<{ id: string; name: string }>>([]);
  const department = getDepartment(project);

  const initialForm = useMemo<ProjectInlineForm>(() => ({
    title: project.title ?? "",
    description: project.description ?? "",
    status: project.status ?? "activo",
    department: department?.code ?? department?.name ?? "",
    clientName: project.client_name ?? "",
    country: project.country ?? "",
    dueDate: project.due_date ?? "",
    isCollaborative: Boolean(project.is_collaborative),
  }), [project, department?.code, department?.name]);

  const [form, setForm] = useState<ProjectInlineForm>(initialForm);

  useEffect(() => {
    setForm(initialForm);
  }, [initialForm]);

  useEffect(() => {
    let active = true;
    async function loadOptions() {
      const workspace = await getClientWorkspaceContext();
      if (!workspace.user) return;
      const [departmentRows, countryRows, clientRows] = await Promise.all([
        fetchWorkspaceDepartments(workspace.supabase, workspace.user.id, project.organization_id ?? workspace.activeOrganizationId ?? null),
        fetchWorkspaceCountries(workspace.supabase, workspace.user.id, project.organization_id ?? workspace.activeOrganizationId ?? null),
        fetchWorkspaceClientsDirectory(workspace.supabase, workspace.user.id, project.organization_id ?? workspace.activeOrganizationId ?? null),
      ]);
      if (!active) return;
      setDepartmentOptions(appendMissingOption(departmentRows, initialForm.department));
      setCountryOptions(appendMissingOption(countryRows, initialForm.country));
      setClientOptions(clientRows);
    }
    void loadOptions();
    return () => { active = false; };
  }, [project.organization_id, initialForm.department, initialForm.country]);

  useEffect(() => {
    if (!departmentOptions.length && !countryOptions.length) return;
    setForm((current) => ({
      ...current,
      department: normalizeDepartmentValue(current.department || initialForm.department, departmentOptions),
      country: normalizeCountryValue(current.country || initialForm.country, countryOptions),
    }));
  }, [departmentOptions, countryOptions, initialForm.department, initialForm.country]);

  function setField<K extends keyof ProjectInlineForm>(key: K, value: ProjectInlineForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function cancelInline() {
    setForm(initialForm);
    const base = `/app/projects/${project.id}`;
    router.push(currentQuery ? `${base}?${currentQuery}` : base);
  }

  async function saveInline() {
    setMessage("Guardando cambios…");
    setServerError(null);
    const workspace = await getClientWorkspaceContext();
    const supabase = workspace.supabase;
    const user = workspace.user;
    const organizationId = project.organization_id ?? workspace.activeOrganizationId ?? null;

    if (!user) {
      setServerError("Sesión no válida.");
      setMessage(null);
      return;
    }

    if (!form.title.trim()) {
      setServerError("El nombre del proyecto es obligatorio.");
      setMessage(null);
      return;
    }

    let departmentId: number | null = null;
    try {
      departmentId = await getWorkspaceDepartmentIdByCode({ code: form.department, userId: user.id, organizationId });
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "No fue posible cargar el departamento.");
      setMessage(null);
      return;
    }

    const clientName = form.clientName.trim() || null;
    const clientId = await findWorkspaceClientId(supabase, user.id, organizationId, clientName);
    const access = await getClientAccessSummary(supabase as any, user.id, organizationId);

    if (organizationId && clientId && !hasClientAccess(access, clientId, "edit")) {
      setServerError("No tienes permisos para editar proyectos sobre ese registro.");
      setMessage(null);
      return;
    }

    const country = (countryOptions.find((item) => item.name === form.country || item.code === form.country)?.name ?? form.country) || null;
    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      status: form.status,
      department_id: departmentId,
      client_name: clientName,
      client_id: clientId,
      due_date: form.dueDate || null,
      country,
      is_collaborative: form.isCollaborative,
      share_enabled: form.isCollaborative,
      share_token: form.isCollaborative ? project.share_token ?? generateShareToken() : null,
    };

    const { error } = await supabase.from("projects").update(payload).eq("id", project.id);
    if (error) {
      setServerError(error.message);
      setMessage(null);
      return;
    }

    await logActivity(supabase as any, {
      entityType: "project",
      entityId: project.id,
      action: "project_updated",
      metadata: { project_id: project.id, title: payload.title, status: payload.status, client_id: clientId ?? undefined, client_name: clientName ?? undefined, organization_id: organizationId, country: payload.country ?? undefined },
    });

    void trackEvent({ eventName: "update_project_inline", organizationId, metadata: { project_id: project.id, client_id: clientId, country: payload.country, collaborative: payload.is_collaborative } });
    setMessage("Cambios guardados.");
    startTransition(() => {
      router.refresh();
      const base = `/app/projects/${project.id}`;
      router.push(currentQuery ? `${base}?${currentQuery}` : base);
    });
  }

  const cover = project.image_url || "/imagenes/organization-team-hero.png";

  return (
    <section className="relative overflow-hidden rounded-[24px] border border-[#BBF7D0] bg-white p-6 shadow-[0_12px_35px_rgba(15,23,42,0.05)]">
      <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-[#ECFDF5] via-[#EFF6FF]/50 to-transparent" />
      <div className="relative grid gap-6 lg:grid-cols-[230px_minmax(0,1fr)_360px]">
        <div className="relative h-[190px] overflow-hidden rounded-[20px] bg-slate-100">
          <Image src={cover} alt={project.title || "Proyecto FlowTask"} fill className="object-cover" sizes="230px" priority={false} unoptimized={Boolean(project.image_url)} />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 to-transparent" />
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-[#ECFDF5] px-3 py-1 text-xs font-black text-[#087A4B] ring-1 ring-[#BBF7D0]">Editando inline</span>
            <span className="rounded-full bg-[#F6F0FF] px-3 py-1 text-xs font-black text-[#7C3AED] ring-1 ring-[#E9D5FF]">Misma estructura del detalle</span>
          </div>
          <Input value={form.title} onChange={(event) => setField("title", event.target.value)} className="min-h-[58px] rounded-[18px] border-[#E5EAF1] bg-white px-4 text-[30px] font-black tracking-[-0.035em] text-[#0F172A] focus:border-[#16C784] focus:ring-4 focus:ring-emerald-500/10" placeholder="Nombre del proyecto" />
          <p className="text-sm font-semibold text-[#64748B]">Creado el {project.created_at ? formatDate(project.created_at) : "—"}</p>
          <Textarea value={form.description} onChange={(event) => setField("description", event.target.value)} className="min-h-[118px] rounded-[18px] border-[#E5EAF1] bg-white text-base leading-7 text-[#64748B] focus:border-[#16C784] focus:ring-4 focus:ring-emerald-500/10" placeholder="Descripción del proyecto" />
        </div>

        <div className="flex flex-col justify-between gap-5">
          <div className="flex justify-start gap-3 lg:justify-end">
            <Button type="button" variant="secondary" disabled={isPending} onClick={cancelInline} className="h-12 rounded-[16px] border-[#E7EDF5] bg-white px-5 text-sm font-bold text-[#0F172A]"><X className="h-4 w-4" />Cancelar</Button>
            <Button type="button" loading={isPending} onClick={saveInline} className="h-12 rounded-[16px] bg-[#16C784] px-5 text-sm font-bold text-white shadow-[0_12px_28px_rgba(22,199,132,0.22)]"><Save className="h-4 w-4" />Guardar</Button>
          </div>

          <div className="grid gap-3">
            <label className="space-y-2 text-xs font-black uppercase tracking-[0.16em] text-slate-500"><span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" />Estado</span><Select value={form.status} onChange={(event) => setField("status", event.target.value)} className="h-11 rounded-2xl border-[#E5EAF1] bg-white font-semibold">{PROJECT_STATUSES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</Select></label>
            <label className="space-y-2 text-xs font-black uppercase tracking-[0.16em] text-slate-500"><span className="flex items-center gap-2"><FolderKanban className="h-4 w-4" />Departamento</span><Select value={form.department} onChange={(event) => setField("department", event.target.value)} className="h-11 rounded-2xl border-[#E5EAF1] bg-white font-semibold"><option value="">Seleccionar</option>{departmentOptions.map((item) => <option key={item.id} value={item.code}>{item.name}</option>)}</Select></label>
            <label className="space-y-2 text-xs font-black uppercase tracking-[0.16em] text-slate-500"><span className="flex items-center gap-2"><Tag className="h-4 w-4" />Registro</span><Input value={form.clientName} onChange={(event) => setField("clientName", event.target.value)} list="project-inline-client-options" className="h-11 rounded-2xl border-[#E5EAF1] bg-white font-semibold" /><datalist id="project-inline-client-options">{clientOptions.map((item) => <option key={item.id} value={item.name} />)}</datalist></label>
            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-2 text-xs font-black uppercase tracking-[0.16em] text-slate-500"><span className="flex items-center gap-2"><Globe2 className="h-4 w-4" />País</span><Select value={form.country} onChange={(event) => setField("country", event.target.value)} className="h-11 rounded-2xl border-[#E5EAF1] bg-white font-semibold"><option value="">País</option>{countryOptions.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}</Select></label>
              <label className="space-y-2 text-xs font-black uppercase tracking-[0.16em] text-slate-500"><span className="flex items-center gap-2"><CalendarDays className="h-4 w-4" />Deadline</span><Input type="date" value={form.dueDate} onChange={(event) => setField("dueDate", event.target.value)} className="h-11 rounded-2xl border-[#E5EAF1] bg-white font-semibold" /></label>
            </div>
            <label className="flex items-center justify-between rounded-2xl border border-[#BBF7D0] bg-[#ECFDF5] px-4 py-3 text-sm font-black text-[#0F172A]"><span className="flex items-center gap-2"><Link2 className="h-4 w-4" />Colaborativo</span><input type="checkbox" checked={form.isCollaborative} onChange={(event) => setField("isCollaborative", event.target.checked)} className="h-5 w-5 accent-[#16C784]" /></label>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between text-sm"><span className="font-semibold text-[#64748B]">Progreso general</span><span className="text-2xl font-black text-[#16A36C]">{progress}%</span></div>
            <div className="h-[7px] rounded-full bg-[#EEF2F7]"><div className="h-[7px] rounded-full bg-[#16C784]" style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} /></div>
          </div>
          {serverError ? <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{serverError}</p> : null}
          {message ? <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{message}</p> : null}
        </div>
      </div>
    </section>
  );
}
