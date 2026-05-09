"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition, type ChangeEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  fetchWorkspaceClientsDirectory,
  fetchWorkspaceCountries,
  fetchWorkspaceDepartments,
  findWorkspaceClientId,
  getClientWorkspaceContext,
} from "@/lib/supabase/workspace-client";
import { getClientAccessSummary, hasClientAccess } from "@/lib/security/client-access";
import { PROJECT_STATUSES } from "@/lib/constants/project-status";
import { projectDetailRoute, projectListRoute, type AppRoute } from "@/lib/navigation/routes";
import { generateShareToken } from "@/lib/utils/tokens";
import { projectSchema } from "@/lib/validations/project";
import { getWorkspaceDepartmentIdByCode } from "@/lib/queries/departments";
import { logActivity } from "@/lib/activity/log-client";
import { trackEvent } from "@/lib/telemetry/track-event";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, CalendarDays, CheckCircle2, FolderKanban, Globe2, ImagePlus, Link2, Sparkles, Tag, Users, X } from "lucide-react";
import type { z } from "zod";

type ProjectValues = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  projectId?: string;
  initialData?: Partial<ProjectValues> & { shareToken?: string | null; organizationId?: string | null; ownerId?: string | null; imageUrl?: string | null };
  submitLabel?: string;
  successMessage?: string;
  redirectTo?: AppRoute;
  sourceTaskId?: string;
}

export function ProjectForm({ projectId, initialData, submitLabel, successMessage, redirectTo, sourceTaskId }: ProjectFormProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [departmentOptions, setDepartmentOptions] = useState<Array<{ id: string; code: string; name: string }>>([]);
  const [countryOptions, setCountryOptions] = useState<Array<{ id: string; code: string; name: string }>>([]);
  const [clientOptions, setClientOptions] = useState<Array<{ id: string; name: string }>>([]);
  const [projectImageFile, setProjectImageFile] = useState<File | null>(null);
  const [projectImagePreview, setProjectImagePreview] = useState<string>(initialData?.imageUrl ?? "");
  const [isRefreshing, startRefresh] = useTransition();
  const router = useRouter();
  const isEdit = Boolean(projectId);

  const {
    register,
    handleSubmit,
    control,
    formState: { isSubmitting, errors },
    reset,
    setValue,
  } = useForm<ProjectValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: initialData?.title ?? "",
      description: initialData?.description ?? "",
      status: initialData?.status ?? "activo",
      department: initialData?.department ?? "",
      clientName: initialData?.clientName ?? "",
      dueDate: initialData?.dueDate ?? "",
      isCollaborative: initialData?.isCollaborative ?? false,
      country: initialData?.country ?? "",
      imageUrl: initialData?.imageUrl ?? "",
    },
  });

  function normalizeDepartmentValue(value?: string | null, options: Array<{ id: string; code: string; name: string }> = []) {
    const normalized = value?.trim();
    if (!normalized) return "";
    const direct = options.find((item) => item.code === normalized || item.id === normalized);
    if (direct) return direct.code;
    const byName = options.find((item) => item.name.toLowerCase() === normalized.toLowerCase());
    return byName?.code ?? normalized;
  }

  function normalizeCountryValue(value?: string | null, options: Array<{ id: string; code: string; name: string }> = []) {
    const normalized = value?.trim();
    if (!normalized) return "";
    const directName = options.find((item) => item.name === normalized);
    if (directName) return directName.name;
    const directCode = options.find((item) => item.code === normalized);
    if (directCode) return directCode.name;
    const byName = options.find((item) => item.name.toLowerCase() === normalized.toLowerCase());
    return byName?.name ?? normalized;
  }

  function appendMissingDepartmentOption(rows: Array<{ id: string; code: string; name: string }>, value?: string | null) {
    const normalized = value?.trim();
    if (!normalized) return rows;
    const exists = rows.some((item) => item.id === normalized || item.code === normalized || item.name.toLowerCase() === normalized.toLowerCase());
    return exists ? rows : [{ id: `current-${normalized}`, code: normalized, name: normalized }, ...rows];
  }

  function appendMissingCountryOption(rows: Array<{ id: string; code: string; name: string }>, value?: string | null) {
    const normalized = value?.trim();
    if (!normalized) return rows;
    const exists = rows.some((item) => item.id === normalized || item.code === normalized || item.name.toLowerCase() === normalized.toLowerCase());
    return exists ? rows : [{ id: `current-${normalized}`, code: normalized, name: normalized }, ...rows];
  }

  useEffect(() => {
    let active = true;
    const loadRegistryOptions = async () => {
      const workspace = await getClientWorkspaceContext();
      if (!workspace.user) return;
      const [departmentRows, countryRows, clientRows] = await Promise.all([
        fetchWorkspaceDepartments(workspace.supabase, workspace.user.id, isEdit ? (initialData?.organizationId ?? null) : workspace.activeOrganizationId),
        fetchWorkspaceCountries(workspace.supabase, workspace.user.id, isEdit ? (initialData?.organizationId ?? null) : workspace.activeOrganizationId),
        fetchWorkspaceClientsDirectory(workspace.supabase, workspace.user.id, isEdit ? (initialData?.organizationId ?? null) : workspace.activeOrganizationId),
      ]);
      if (!active) return;
      setDepartmentOptions(appendMissingDepartmentOption(departmentRows, initialData?.department));
      setCountryOptions(appendMissingCountryOption(countryRows, initialData?.country));
      setClientOptions(clientRows);
    };
    void loadRegistryOptions();
    return () => { active = false; };
  }, [initialData?.department, initialData?.country, initialData?.organizationId, isEdit]);

  useEffect(() => {
    if (!departmentOptions.length && !countryOptions.length) return;
    setValue("department", normalizeDepartmentValue(initialData?.department, departmentOptions), { shouldDirty: false, shouldTouch: false });
    setValue("country", normalizeCountryValue(initialData?.country, countryOptions), { shouldDirty: false, shouldTouch: false });
  }, [initialData?.department, initialData?.country, departmentOptions, countryOptions, setValue]);

  const onSubmit = async (values: ProjectValues) => {
    setMessage(isEdit ? "Guardando cambios…" : "Creando proyecto…");
    setServerError(null);
    const workspace = await getClientWorkspaceContext();
    const supabase = workspace.supabase;
    const user = workspace.user;
    const formOrganizationId = isEdit ? (initialData?.organizationId ?? null) : workspace.activeOrganizationId;

    if (!user) {
      setServerError("Tu sesión expiró. Vuelve a iniciar sesión para continuar.");
      setMessage(null);
      return;
    }

    let departmentId: number | null = null;
    try {
      departmentId = await getWorkspaceDepartmentIdByCode({ code: values.department, userId: user.id, organizationId: formOrganizationId });
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "No pudimos cargar el departamento. Intenta de nuevo.");
      setMessage(null);
      return;
    }

    const clientName = values.clientName?.trim() || null;
    const clientId = await findWorkspaceClientId(supabase, user.id, formOrganizationId, clientName);
    const access = await getClientAccessSummary(supabase as any, user.id, formOrganizationId);

    if (formOrganizationId && clientId && !hasClientAccess(access, clientId, "edit")) {
      setServerError("No puedes usar este registro en el proyecto. Elige otro registro o pide acceso al administrador.");
      setMessage(null);
      return;
    }

    let imageUrl: string | null = projectImagePreview ? (initialData?.imageUrl ?? projectImagePreview) : null;

    if (projectImageFile) {
      if (projectImageFile.size > 5 * 1024 * 1024) {
        setServerError("La imagen del proyecto debe pesar menos de 5 MB.");
        setMessage(null);
        return;
      }
      const extension = projectImageFile.name.split(".").pop()?.toLowerCase() || "jpg";
      const safeProjectId = projectId ?? `new-${Date.now()}`;
      const path = `projects/${formOrganizationId ?? user.id}/${safeProjectId}/${Date.now()}.${extension}`;
      const upload = await supabase.storage.from("attachments").upload(path, projectImageFile, { upsert: true, contentType: projectImageFile.type || "image/jpeg" });
      if (upload.error) {
        setServerError(upload.error.message);
        setMessage(null);
        return;
      }
      imageUrl = supabase.storage.from("attachments").getPublicUrl(path).data.publicUrl;
      setValue("imageUrl", imageUrl ?? "", { shouldDirty: true });
    }

    const payload = {
      title: values.title,
      description: values.description || null,
      status: values.status,
      department_id: departmentId,
      client_name: clientName,
      client_id: clientId,
      due_date: values.dueDate || null,
      is_collaborative: values.isCollaborative,
      share_enabled: values.isCollaborative,
      country: (countryOptions.find((item) => item.name === values.country || item.code === values.country)?.name ?? values.country) || null,
      image_url: imageUrl,
    };

    let createdProjectId: string | null = null;

    if (isEdit) {
      const updateValues: Record<string, unknown> = { ...payload };
      updateValues.share_token = values.isCollaborative ? initialData?.shareToken ?? generateShareToken() : null;
      const { data: confirmedProject, error } = await supabase.from("projects").update(updateValues).eq("id", projectId!).select("id,title,status,updated_at").maybeSingle();
      if (error || !confirmedProject) {
        setServerError(error?.message ?? "No pudimos confirmar los cambios del proyecto.");
        setMessage(null);
        return;
      }
      await logActivity(supabase as any, {
        entityType: "project",
        entityId: projectId!,
        action: "project_updated",
        metadata: { project_id: projectId!, title: payload.title, status: payload.status, client_id: clientId ?? undefined, client_name: clientName ?? undefined, organization_id: formOrganizationId, country: payload.country ?? undefined },
      });
    } else {
      const shareToken = values.isCollaborative ? generateShareToken() : null;
      const { data, error } = await supabase
        .from("projects")
        .insert({ owner_id: user.id, organization_id: formOrganizationId, ...payload, share_token: shareToken })
        .select("id")
        .single();

      if (error) {
        setServerError(error.message);
        setMessage(null);
        return;
      }

      createdProjectId = data?.id ?? null;

      if (createdProjectId) {
        await supabase.from("project_members").insert({ project_id: createdProjectId, user_id: user.id, role: "owner" });

        if (sourceTaskId) {
          const [{ data: sourceTask }, { data: checklistRows }] = await Promise.all([
            supabase.from("tasks").select("id,title,description,priority,due_date").eq("id", sourceTaskId).maybeSingle(),
            supabase.from("task_checklist_items").select("title,due_date,position").eq("task_id", sourceTaskId).order("position", { ascending: true }),
          ]);

          const checklistTasks = (checklistRows ?? [])
            .map((item: any) => ({ title: String(item.title ?? "").trim(), due_date: item.due_date ?? null }))
            .filter((item: any) => item.title.length > 0);

          const childTasks = checklistTasks.length ? checklistTasks : sourceTask?.title ? [{ title: String(sourceTask.title), due_date: sourceTask.due_date ?? null }] : [];

          if (childTasks.length) {
            await supabase.from("tasks").insert(childTasks.map((item: any) => ({
              owner_id: user.id,
              organization_id: formOrganizationId,
              project_id: createdProjectId,
              title: item.title,
              description: null,
              status: "en_proceso",
              priority: (sourceTask as any)?.priority ?? "media",
              department_id: departmentId,
              client_name: clientName,
              client_id: clientId,
              country: payload.country,
              due_date: item.due_date ?? payload.due_date,
            })));
          }

          await supabase.from("tasks").update({ status: "concluido", completed_at: new Date().toISOString() }).eq("id", sourceTaskId).select("id,status,updated_at").maybeSingle();
        }

        await logActivity(supabase as any, {
          entityType: "project",
          entityId: createdProjectId,
          action: "project_created",
          metadata: { project_id: createdProjectId, title: payload.title, status: payload.status, client_id: clientId ?? undefined, client_name: clientName ?? undefined, organization_id: formOrganizationId, country: payload.country ?? undefined },
        });
      }
    }

    void trackEvent({
      eventName: isEdit ? "update_project" : "create_project",
      organizationId: formOrganizationId,
      metadata: { project_id: isEdit ? projectId ?? null : createdProjectId, client_id: clientId, collaborative: values.isCollaborative, country: payload.country },
    });

    setMessage(successMessage ?? (isEdit ? "Proyecto actualizado al instante." : "Proyecto creado y listo para compartir."));

    const nextRoute = isEdit ? redirectTo : redirectTo ?? (createdProjectId ? projectDetailRoute(createdProjectId) : undefined);
    startRefresh(() => {
      router.refresh();
      if (nextRoute) router.push(nextRoute);
    });
  };

  const isBusy = isSubmitting || isRefreshing;
  const cancelHref = redirectTo ?? projectListRoute();
  const watchedTitle = useWatch({ control, name: "title" }) ?? "";
  const watchedDescription = useWatch({ control, name: "description" }) ?? "";
  const watchedCollaborative = useWatch({ control, name: "isCollaborative" });

  const resetValues = useMemo(() => ({
    title: initialData?.title ?? "",
    description: initialData?.description ?? "",
    status: initialData?.status ?? "activo",
    department: normalizeDepartmentValue(initialData?.department, departmentOptions),
    clientName: initialData?.clientName ?? "",
    dueDate: initialData?.dueDate ?? "",
    isCollaborative: initialData?.isCollaborative ?? false,
    country: normalizeCountryValue(initialData?.country, countryOptions),
    imageUrl: initialData?.imageUrl ?? "",
  }), [initialData, departmentOptions, countryOptions]);

  return (
    <form className="-mx-4 min-h-screen bg-[#F6F8FC] pb-8 md:-mx-6" onSubmit={handleSubmit(onSubmit)}>
      <div className="sticky top-0 z-40 mb-6 px-3 py-2 sm:px-4 lg:px-5">
        <div className="rounded-[20px] border border-[#E5EAF1] bg-white/95 px-4 py-4 backdrop-blur-xl sm:px-5 lg:px-5">
          <div className="flex min-h-[72px] w-full flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <Link href={cancelHref} className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#050B18] text-white transition hover:-translate-y-0.5" aria-label="Volver">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.20em] text-[#16A36C]">FlowTask · Crear proyecto</p>
                <h1 className="truncate text-xl font-semibold tracking-[-0.035em] text-[#0F172A] sm:text-[28px]">{isEdit ? "Editar proyecto" : "Nuevo proyecto"}</h1>
                <p className="mt-1 line-clamp-1 text-sm font-medium text-[#64748B]">Define el frente de trabajo sin cambiar el contrato actual de Supabase.</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 lg:justify-end">
              <button type="button" onClick={() => { reset(resetValues); setProjectImagePreview(initialData?.imageUrl ?? ""); setProjectImageFile(null); }} className="inline-flex h-10 items-center rounded-2xl border border-[#E5EAF1] bg-white px-3.5 text-[13px] font-bold text-slate-800 transition hover:bg-slate-50">Restablecer</button>
              <Link href={cancelHref} className="inline-flex h-10 items-center justify-center rounded-2xl border border-[#E5EAF1] bg-white px-4 text-[13px] font-bold text-slate-800 transition hover:bg-slate-50">Cancelar</Link>
              <Button loading={isBusy} type="submit" className="h-10 rounded-xl bg-[#16C784] px-5 text-white hover:bg-[#12b777]">{submitLabel ?? (isEdit ? "Guardar cambios" : "Crear proyecto")}</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid w-full gap-4 px-3 sm:px-4 lg:px-5 xl:grid-cols-[minmax(0,1fr)_380px] 2xl:gap-5">
        <div className="space-y-5">
          <section className="rounded-[20px] border border-[#E5EAF1] bg-white p-4 sm:p-5">
            <div className="rounded-[20px] border border-[#E5EAF1] bg-white p-5 transition focus-within:border-emerald-200 focus-within:ring-4 focus-within:ring-emerald-50">
              <div className="mb-3 flex items-center justify-between gap-3">
                <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Nombre del proyecto</label>
                <span className="text-xs font-bold text-slate-400">{watchedTitle.length} / 120</span>
              </div>
              <Input {...register("title")} placeholder="Ej. Lanzamiento de campaña Q3" className="min-h-[52px] w-full rounded-xl border border-[#E5EAF1] bg-white px-4 py-2.5 text-[22px] font-semibold leading-[1.15] tracking-[-0.028em] text-[#0F172A] shadow-none outline-none transition placeholder:text-slate-400 focus:border-[#16C784] focus:ring-4 focus:ring-emerald-500/10 sm:text-[26px]" />
              {errors.title ? <p className="mt-3 text-sm font-semibold text-red-600">{errors.title.message}</p> : null}
            </div>

            <div className="mt-5 overflow-hidden rounded-[20px] border border-[#E5EAF1] bg-white">
              <div className="flex items-center justify-between border-b border-[#E5EAF1] px-5 py-4">
                <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Descripción</label>
                <span className="text-xs font-bold text-slate-400">{watchedDescription.length} caracteres</span>
              </div>
              <Textarea {...register("description")} placeholder="Objetivo, alcance, entregables y contexto del proyecto." className="min-h-[180px] resize-y rounded-none border-0 bg-white px-5 py-4 text-base leading-7 text-slate-700 shadow-none focus:ring-0" />
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <FieldCard label="Imagen del proyecto" icon={<ImagePlus className="h-4 w-4" />} helper="Opcional. Se conserva el upload actual al bucket attachments.">
              <div className="grid gap-4 md:grid-cols-[140px_minmax(0,1fr)] md:items-center">
                <div className="relative flex h-28 items-center justify-center overflow-hidden rounded-[20px] bg-slate-50 ring-1 ring-[#E5EAF1]">
                  {projectImagePreview ? <img src={projectImagePreview} alt="Imagen del proyecto" className="h-full w-full object-cover" /> : <ImagePlus className="h-9 w-9 text-slate-400" />}
                </div>
                <div className="space-y-3">
                  <input type="hidden" {...register("imageUrl")} />
                  <Input type="file" accept="image/*" className="h-10 rounded-2xl border-[#E5EAF1] bg-white font-semibold" onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    const file = event.target.files?.[0] ?? null;
                    setProjectImageFile(file);
                    if (file) {
                      const preview = URL.createObjectURL(file);
                      setProjectImagePreview(preview);
                      setValue("imageUrl", preview, { shouldDirty: true });
                    }
                  }} />
                  {projectImagePreview ? <button type="button" onClick={() => { setProjectImageFile(null); setProjectImagePreview(""); setValue("imageUrl", "", { shouldDirty: true }); }} className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-rose-600"><X className="h-4 w-4" />Quitar imagen</button> : null}
                </div>
              </div>
            </FieldCard>

            <FieldCard label="Estado" icon={<CheckCircle2 className="h-4 w-4" />}>
              <Select {...register("status")} className="h-10 rounded-2xl border-[#E5EAF1] bg-white font-semibold">
                {PROJECT_STATUSES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </Select>
            </FieldCard>

            <FieldCard label="Departamento" icon={<FolderKanban className="h-4 w-4" />}>
              <Select {...register("department")} className="h-10 rounded-2xl border-[#E5EAF1] bg-white font-semibold">
                <option value="">Seleccionar</option>
                {departmentOptions.map((item) => <option key={item.id} value={item.code}>{item.name}</option>)}
              </Select>
            </FieldCard>

            <FieldCard label="Registro" icon={<Tag className="h-4 w-4" />} helper="Asocia este proyecto con el registro correcto para mantener todo organizado.">
              <Input {...register("clientName")} placeholder="Nombre del registro" list="project-registry-client-options" className="h-10 rounded-2xl border-[#E5EAF1] bg-white font-semibold" />
              <datalist id="project-registry-client-options">{clientOptions.map((item) => <option key={item.id} value={item.name} />)}</datalist>
            </FieldCard>

            <FieldCard label="País" icon={<Globe2 className="h-4 w-4" />}>
              <Select {...register("country")} className="h-10 rounded-2xl border-[#E5EAF1] bg-white font-semibold">
                <option value="">Seleccionar país</option>
                {countryOptions.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}
              </Select>
            </FieldCard>

            <FieldCard label="Deadline" icon={<CalendarDays className="h-4 w-4" />}>
              <Input {...register("dueDate")} type="date" className="h-10 rounded-2xl border-[#E5EAF1] bg-white font-semibold" />
            </FieldCard>

            <label className="md:col-span-2 flex cursor-pointer items-center justify-between gap-4 rounded-[20px] border border-[#BBF7D0] bg-[#ECFDF5] p-5">
              <span className="flex min-w-0 items-start gap-3">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-[#16A36C] ring-1 ring-[#BBF7D0]"><Link2 className="h-5 w-5" /></span>
                <span className="min-w-0"><span className="block text-sm font-semibold text-[#0F172A]">Proyecto colaborativo y con enlace compartible</span><span className="mt-1 block text-sm font-medium leading-6 text-[#64748B]">Activa la visibilidad compartida usando los mismos campos reales: is_collaborative, share_enabled y share_token.</span></span>
              </span>
              <input type="checkbox" {...register("isCollaborative")} className="h-5 w-5 shrink-0 accent-[#16C784]" />
            </label>
          </section>

          {serverError ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{serverError}</div> : null}
          {message ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{message}</div> : null}
        </div>

        <aside className="space-y-5 xl:sticky xl:top-[104px] xl:self-start">
          <SideCard tone="green">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600"><Sparkles className="h-4 w-4" /> ¿Qué es este proyecto?</p>
            <p className="mt-3 text-sm font-medium leading-6 text-[#64748B]">Un proyecto reúne tareas, equipo, archivos y fechas en un solo lugar. Después de crearlo podrás trabajar desde su detalle.</p>
          </SideCard>
          <SideCard tone="blue">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600"><Users className="h-4 w-4" /> Siguiente paso</p>
            <div className="mt-4 space-y-3 text-sm font-semibold leading-6 text-[#64748B]">
              <p>1. Crea el proyecto.</p>
              <p>2. Entra al detalle para agregar tareas internas.</p>
              <p>3. Usa editar aquí mismo para ajustes rápidos sin salir de la vista.</p>
            </div>
          </SideCard>
          <SideCard tone="amber">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">Información que se guardará</p>
            <p className="mt-3 text-sm font-medium leading-6 text-[#64748B]">Este formulario guarda solo la información necesaria: nombre, descripción, imagen, estado, departamento, registro, país, fecha límite y colaboración.</p>
            <span className="mt-4 inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-[#E5EAF1]">{watchedCollaborative ? "Modo colaborativo" : "Modo individual"}</span>
          </SideCard>
        </aside>
      </div>
    </form>
  );
}

function FieldCard({ label, icon, helper, children }: { label: string; icon: ReactNode; helper?: string; children: ReactNode }) {
  return (
    <div className="rounded-[20px] border border-[#E5EAF1] bg-white p-4 md:col-span-1">
      <label className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 text-slate-500">{icon}</span>
        {label}
      </label>
      {children}
      {helper ? <p className="mt-2 text-xs font-semibold text-slate-500">{helper}</p> : null}
    </div>
  );
}

function SideCard({ children, tone = "white" }: { children: ReactNode; tone?: "white" | "green" | "amber" | "blue" }) {
  const toneClass = tone === "green" ? "border-[#BBF7D0] bg-[#ECFDF5]" : tone === "amber" ? "border-[#FDECC8] bg-[#FFF8E8]" : tone === "blue" ? "border-[#BFDBFE] bg-[#EFF6FF]" : "border-[#E5EAF1] bg-white";
  return <section className={`rounded-[20px] border p-5 ${toneClass}`}>{children}</section>;
}
