"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getClientWorkspaceContext, findWorkspaceClientId, fetchWorkspaceClientsDirectory, fetchWorkspaceCountries, fetchWorkspaceDepartments, fetchWorkspaceProjects } from "@/lib/supabase/workspace-client";
import { resolveProjectEntityContext, validateTaskProjectClientIntegrity } from "@/lib/security/entity-integrity";
import { getClientAccessSummary, hasClientAccess } from "@/lib/security/client-access";
import { TASK_STATUSES } from "@/lib/constants/task-status";
import { TASK_PRIORITIES } from "@/lib/constants/task-priority";
import { taskDetailRoute, taskListRoute, type AppRoute } from "@/lib/navigation/routes";
import { taskSchema } from "@/lib/validations/task";
import { getWorkspaceDepartmentIdByCode } from "@/lib/queries/departments";
import { logActivity } from "@/lib/activity/log-client";
import { trackEvent } from "@/lib/telemetry/track-event";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  CalendarDays,
  ChevronDown,
  CircleHelp,
  Clock3,
  FileText,
  Flag,
  FolderKanban,
  Link2,
  List,
  MessageCircle,
  Paperclip,
  Send,
  ShieldCheck,
  Tag,
  UserRound,
  X,
} from "lucide-react";
import type { z } from "zod";

type TaskValues = z.infer<typeof taskSchema>;

interface TaskFormProps {
  taskId?: string;
  initialData?: Partial<TaskValues> & { organizationId?: string | null; ownerId?: string | null };
  submitLabel?: string;
  successMessage?: string;
  redirectTo?: AppRoute;
}

export function TaskForm({
  taskId,
  initialData,
  submitLabel,
  successMessage,
  redirectTo,
}: TaskFormProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isRefreshing, startRefresh] = useTransition();
  const [projects, setProjects] = useState<Array<{ id: string; title: string; status: string }>>([]);
  const [departmentOptions, setDepartmentOptions] = useState<Array<{ id: string; code: string; name: string }>>([]);
  const [countryOptions, setCountryOptions] = useState<Array<{ id: string; code: string; name: string }>>([]);
  const [clientOptions, setClientOptions] = useState<Array<{ id: string; name: string }>>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [workspaceOwnerLabel, setWorkspaceOwnerLabel] = useState("Cargando usuario…");
  const router = useRouter();
  const isEdit = Boolean(taskId);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<TaskValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: initialData?.title ?? "",
      description: initialData?.description ?? "",
      status: initialData?.status ?? "en_proceso",
      priority: initialData?.priority ?? "media",
      department: initialData?.department ?? "",
      clientName: initialData?.clientName ?? "",
      dueDate: initialData?.dueDate ?? "",
      projectId: initialData?.projectId ?? "",
      country: initialData?.country ?? "",
    },
  });



  const watchedDepartment = useWatch({ control, name: "department" });
  const watchedCountry = useWatch({ control, name: "country" });

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

  function getProfileLabel(profile?: { full_name?: string | null; email?: string | null } | null) {
    const fullName = profile?.full_name?.trim() ?? "";
    const isPlaceholder = !fullName || fullName.toLowerCase() === "workspace owner" || fullName.toLowerCase() === "owner";
    return isPlaceholder ? profile?.email?.trim() || "Usuario del workspace" : fullName;
  }
  const resetValues = useMemo(
    () => ({
      title: initialData?.title ?? "",
      description: initialData?.description ?? "",
      status: initialData?.status ?? "en_proceso",
      priority: initialData?.priority ?? "media",
      department: normalizeDepartmentValue(initialData?.department, departmentOptions),
      clientName: initialData?.clientName ?? "",
      dueDate: initialData?.dueDate ?? "",
      projectId: initialData?.projectId ?? "",
      country: normalizeCountryValue(initialData?.country, countryOptions),
    }),
    [initialData, departmentOptions, countryOptions],
  );

  useEffect(() => {
    let active = true;
    const loadRegistryOptions = async () => {
      setLoadingProjects(true);
      const workspace = await getClientWorkspaceContext();
      if (!workspace.user) {
        if (active) {
          setProjects([]);
          setDepartmentOptions([]);
          setCountryOptions([]);
          setClientOptions([]);
          setWorkspaceOwnerLabel("Sin sesión");
          setLoadingProjects(false);
        }
        return;
      }
      const [projectRows, departmentRows, countryRows, clientRows, profileRes] = await Promise.all([
        fetchWorkspaceProjects(workspace.supabase, workspace.user.id, isEdit ? (initialData?.organizationId ?? null) : workspace.activeOrganizationId, "edit"),
        fetchWorkspaceDepartments(workspace.supabase, workspace.user.id, isEdit ? (initialData?.organizationId ?? null) : workspace.activeOrganizationId),
        fetchWorkspaceCountries(workspace.supabase, workspace.user.id, isEdit ? (initialData?.organizationId ?? null) : workspace.activeOrganizationId),
        fetchWorkspaceClientsDirectory(workspace.supabase, workspace.user.id, isEdit ? (initialData?.organizationId ?? null) : workspace.activeOrganizationId),
        workspace.supabase.from("profiles").select("full_name,email").eq("id", workspace.user.id).maybeSingle(),
      ]);
      if (active) {
        setProjects(projectRows);
        setDepartmentOptions(appendMissingDepartmentOption(departmentRows, initialData?.department));
        setCountryOptions(appendMissingCountryOption(countryRows, initialData?.country));
        setClientOptions(clientRows);
        setWorkspaceOwnerLabel(getProfileLabel(profileRes.data ?? { email: workspace.user.email ?? null }));
        setLoadingProjects(false);
      }
    };
    void loadRegistryOptions();
    return () => {
      active = false;
    };
  }, [initialData?.department, initialData?.country, initialData?.organizationId, isEdit]);


  useEffect(() => {
    if (!departmentOptions.length && !countryOptions.length) return;
    const normalizedDepartment = normalizeDepartmentValue(initialData?.department, departmentOptions);
    const normalizedCountry = normalizeCountryValue(initialData?.country, countryOptions);

    if (normalizedDepartment !== (watchedDepartment ?? '') || normalizedCountry !== (watchedCountry ?? '')) {
      setValue("department", normalizedDepartment, { shouldDirty: false, shouldTouch: false });
      setValue("country", normalizedCountry, { shouldDirty: false, shouldTouch: false });
    }
  }, [initialData?.department, initialData?.country, departmentOptions, countryOptions, setValue, watchedDepartment, watchedCountry]);

  const onSubmit = async (values: TaskValues) => {
    setMessage(isEdit ? "Guardando cambios…" : "Creando tarea…");
    setServerError(null);
    const workspace = await getClientWorkspaceContext();
    const supabase = workspace.supabase;
    const user = workspace.user;
    const formOrganizationId = isEdit ? (initialData?.organizationId ?? null) : workspace.activeOrganizationId;

    if (!user) {
      setServerError("Sesión no válida.");
      setMessage(null);
      return;
    }

    let departmentId: number | null = null;
    try {
      departmentId = await getWorkspaceDepartmentIdByCode({ code: values.department, userId: user.id, organizationId: formOrganizationId });
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "No fue posible cargar el departamento.");
      setMessage(null);
      return;
    }

    const clientName = values.clientName?.trim() || null;
    const clientId = await findWorkspaceClientId(supabase, user.id, formOrganizationId, clientName);
    const access = await getClientAccessSummary(supabase as any, user.id, formOrganizationId);
    const selectedProject = await resolveProjectEntityContext(supabase as any, values.projectId || null);

    if (formOrganizationId && clientId && !hasClientAccess(access, clientId, "edit")) {
      setServerError("No tienes permisos para crear o editar tareas sobre ese cliente.");
      setMessage(null);
      return;
    }

    if (values.projectId) {
      if (!selectedProject) {
        setServerError("El proyecto seleccionado no existe o no está disponible en tu workspace.");
        setMessage(null);
        return;
      }
      if (formOrganizationId && !hasClientAccess(access, selectedProject.clientId ?? null, "edit")) {
        setServerError("No tienes permisos para crear o editar tareas en el proyecto seleccionado.");
        setMessage(null);
        return;
      }
    }

    const integrity = validateTaskProjectClientIntegrity({
      selectedProject,
      selectedClientId: clientId,
      selectedClientName: clientName,
      activeOrganizationId: formOrganizationId,
    });

    if (!integrity.ok) {
      setServerError(integrity.message ?? "La tarea no respeta la integridad del proyecto y cliente seleccionado.");
      setMessage(null);
      return;
    }

    const payload = {
      title: values.title,
      description: values.description || null,
      status: values.status,
      priority: values.priority,
      department_id: departmentId,
      client_name: integrity.resolvedClientName,
      client_id: integrity.resolvedClientId,
      due_date: values.dueDate || null,
      project_id: values.projectId || null,
      country: (countryOptions.find((item) => item.name === values.country || item.code === values.country)?.name ?? values.country) || null,
    };

    const result = isEdit
      ? await supabase.from("tasks").update(payload).eq("id", taskId!)
      : await supabase
          .from("tasks")
          .insert({ owner_id: user.id, organization_id: formOrganizationId, ...payload })
          .select("id")
          .single();

    const error = result.error;

    if (error) {
      setServerError(error.message);
      setMessage(null);
      return;
    }

    const createdTaskId = !isEdit ? ((result as { data?: { id?: string | null } | null }).data?.id ?? null) : null;
    const activityEntityId = isEdit ? taskId! : createdTaskId;
    if (activityEntityId) {
      await logActivity(supabase as any, {
        entityType: "task",
        entityId: activityEntityId,
        action: isEdit ? "task_updated" : "task_created",
        metadata: {
          title: payload.title,
          status: payload.status,
          client_id: payload.client_id ?? undefined,
          client_name: payload.client_name ?? undefined,
          project_id: values.projectId || undefined,
          organization_id: formOrganizationId,
          country: payload.country ?? undefined,
        },
      });
    }
    void trackEvent({
      eventName: isEdit ? "update_task" : "create_task",
      organizationId: formOrganizationId,
      metadata: {
        task_id: activityEntityId,
        client_id: payload.client_id,
        project_id: payload.project_id,
        priority: payload.priority,
        country: payload.country,
      },
    });

    const okMessage = successMessage ?? (isEdit ? "Cambios guardados al instante." : "Tarea creada y lista para seguir trabajando.");
    setMessage(okMessage);

    if (!isEdit && !createdTaskId) {
      reset({
        title: "",
        description: "",
        status: "en_proceso",
        priority: "media",
        department: "",
        clientName: "",
        dueDate: "",
        projectId: "",
        country: "",
      });
    }

    const nextRoute = isEdit ? redirectTo : redirectTo ?? (createdTaskId ? taskDetailRoute(createdTaskId) : undefined);

    startRefresh(() => {
      router.refresh();
      if (nextRoute) router.push(nextRoute);
    });
  };

  const isBusy = isSubmitting || isRefreshing;
  const cancelHref = redirectTo ?? taskListRoute();
  const watchedTitle = useWatch({ control, name: "title" }) ?? "";
  const watchedDescription = useWatch({ control, name: "description" }) ?? "";
  const selectedPriority = useWatch({ control, name: "priority" });
  const selectedStatus = useWatch({ control, name: "status" });
  const editorTitle = isEdit ? "Editar tarea" : "Nueva tarea";
  const statusProgress = selectedStatus === "concluido" ? 100 : selectedStatus === "en_espera" ? 25 : 65;

  return (
    <form className="bg-[#F7F9FC] pb-8" onSubmit={handleSubmit(onSubmit)}>
      <div className="relative z-10 mb-6 rounded-[28px] border border-[#E5EAF1] bg-white/95 px-5 py-5 shadow-[0_14px_32px_rgba(15,23,42,0.045)] backdrop-blur-xl sm:px-6 lg:px-7">
        <div className="mx-auto flex max-w-[1480px] flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <Link href={cancelHref} className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#050B18] text-white shadow-[0_14px_28px_rgba(5,11,24,0.18)] transition hover:-translate-y-0.5" aria-label="Volver">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-black tracking-[-0.035em] text-[#0F172A] sm:text-3xl">{editorTitle}</h1>
              <p className="mt-1 line-clamp-1 text-sm font-medium text-[#64748B]">Gestiona la información clave sin perder contexto operativo.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <button type="button" onClick={() => reset(resetValues)} className="inline-flex h-11 items-center gap-2 rounded-2xl border border-[#E5EAF1] bg-white px-4 text-sm font-bold text-slate-800 shadow-[0_10px_24px_rgba(15,23,42,0.04)] transition hover:bg-slate-50">
              Restablecer <ChevronDown className="h-4 w-4 rotate-90" />
            </button>
            <Link href={cancelHref} className="inline-flex h-11 items-center justify-center rounded-2xl border border-[#E5EAF1] bg-white px-5 text-sm font-bold text-slate-800 shadow-[0_10px_24px_rgba(15,23,42,0.04)] transition hover:bg-slate-50">
              Cancelar
            </Link>
            <Button loading={isBusy} type="submit" className="h-11 rounded-2xl bg-[#16C784] px-6 text-white shadow-[0_16px_30px_rgba(22,199,132,0.24)] hover:bg-[#12b777]">
              {submitLabel ?? (isEdit ? "Guardar cambios" : "Crear tarea")}
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1480px] gap-6 xl:grid-cols-[minmax(0,1fr)_430px]">
        <div className="space-y-5">
          <section className="rounded-[24px] border border-[#E5EAF1] bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)] sm:p-5">
            <div className="rounded-[20px] border border-[#E5EAF1] bg-white p-5 transition focus-within:border-emerald-200 focus-within:ring-4 focus-within:ring-emerald-50">
              <div className="mb-3 flex items-center justify-between gap-3">
                <label className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Título</label>
                <span className="text-xs font-bold text-slate-400">{watchedTitle.length} / 120</span>
              </div>
              <Input {...register("title")} placeholder="Ej. Diseñar propuesta cliente" className="h-auto border-0 bg-transparent px-0 py-0 text-2xl font-black tracking-[-0.04em] shadow-none focus:border-0 focus:ring-0 sm:text-3xl" />
              {errors.title ? <p className="mt-3 text-sm font-semibold text-red-600">{errors.title.message}</p> : null}
            </div>

            <div className="mt-5 overflow-hidden rounded-[20px] border border-[#E5EAF1] bg-white">
              <div className="flex items-center justify-between border-b border-[#E5EAF1] px-5 py-4">
                <label className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Descripción</label>
                <span className="text-xs font-bold text-slate-400">{watchedDescription.length} / 2000</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 border-b border-[#E5EAF1] bg-slate-50/60 px-4 py-3 text-xs font-semibold text-slate-500">
                Campo de texto simple conectado al guardado real de la tarea.
              </div>
              <Textarea {...register("description")} placeholder="Describe el contexto, entregables o notas importantes…" className="min-h-[130px] rounded-none border-0 bg-white px-5 py-4 text-base leading-7 shadow-none focus:border-0 focus:ring-0" />
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <FieldCard label="Estado" icon={<Clock3 className="h-4 w-4" />}>
              <Select {...register("status")} className="h-12 rounded-2xl border-[#E5EAF1] bg-white font-semibold">
                {TASK_STATUSES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </Select>
            </FieldCard>
            <FieldCard label="Prioridad" icon={<Flag className="h-4 w-4" />}>
              <Select {...register("priority")} className="h-12 rounded-2xl border-[#E5EAF1] bg-white font-semibold">
                {TASK_PRIORITIES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </Select>
            </FieldCard>
            <FieldCard label="Proyecto" icon={<FolderKanban className="h-4 w-4" />} helper={loadingProjects ? "Cargando proyectos del workspace…" : "Opcional: asigna esta tarea a un proyecto activo."}>
              <Select {...register("projectId")} className="h-12 rounded-2xl border-[#E5EAF1] bg-white font-semibold">
                <option value="">Sin proyecto</option>
                {projects.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
              </Select>
            </FieldCard>
            <FieldCard label="Responsable" icon={<UserRound className="h-4 w-4" />}>
              <Input value={workspaceOwnerLabel} readOnly className="h-12 rounded-2xl border-[#E5EAF1] bg-slate-50 font-semibold text-slate-500" />
            </FieldCard>
            <FieldCard label="Departamento" icon={<FileText className="h-4 w-4" />}>
              <Select {...register("department")} className="h-12 rounded-2xl border-[#E5EAF1] bg-white font-semibold">
                <option value="">Seleccionar</option>
                {departmentOptions.map((item) => <option key={item.id} value={item.code}>{item.name}</option>)}
              </Select>
            </FieldCard>
            <FieldCard label="País" icon={<Flag className="h-4 w-4" />}>
              <Select {...register("country")} className="h-12 rounded-2xl border-[#E5EAF1] bg-white font-semibold">
                <option value="">Seleccionar país</option>
                {countryOptions.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}
              </Select>
            </FieldCard>
            <FieldCard label="Deadline" icon={<CalendarDays className="h-4 w-4" />}>
              <Input {...register("dueDate")} type="date" className="h-12 rounded-2xl border-[#E5EAF1] bg-white font-semibold" />
            </FieldCard>
            <FieldCard label="Registro" icon={<Tag className="h-4 w-4" />}>
              <Input {...register("clientName")} placeholder="Nombre del registro" list="registry-client-options" className="h-12 rounded-2xl border-[#E5EAF1] bg-white font-semibold" />
              <datalist id="registry-client-options">
                {clientOptions.map((item) => <option key={item.id} value={item.name} />)}
              </datalist>
            </FieldCard>
          </section>

          <details className="group overflow-hidden rounded-[24px] border border-[#E5EAF1] bg-white shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4">
              <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Detalles adicionales</span>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-500 transition group-open:rotate-180"><ChevronDown className="h-4 w-4" /></span>
            </summary>
            <div className="border-t border-[#E5EAF1] p-5">
              <p className="text-sm font-medium leading-6 text-[#64748B]">Los campos conectados actualmente son estado, prioridad, proyecto, responsable, departamento, país, fecha límite y registro. No se muestran campos decorativos sin respaldo en base de datos.</p>
            </div>
          </details>

          {serverError ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{serverError}</div> : null}
          {message ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{message}</div> : null}
        </div>

        <aside className="space-y-5 xl:sticky xl:top-[104px] xl:self-start">
          <SideCard>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-slate-600"><ShieldCheck className="h-4 w-4" /> Acceso operativo</p>
                <p className="mt-3 text-sm font-medium leading-6 text-[#64748B]">El control completo de permisos vive en Settings para mantener esta tarea más limpia.</p>
              </div>
              <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">Permiso full</span>
            </div>
          </SideCard>

          <SideCard>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-600">Seguimiento</p>
            <p className="mt-2 text-sm font-medium text-[#64748B]">Gestiona el avance y mantén a todos alineados.</p>
            <div className="mt-5 space-y-4">
              <FieldMini label="Estado de seguimiento">
                <Select className="h-12 rounded-2xl border-amber-100 bg-amber-50/70 font-semibold" value={selectedStatus ?? "en_proceso"} onChange={(event) => setValue("status", event.target.value as TaskValues["status"], { shouldDirty: true })}>
                  {TASK_STATUSES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </Select>
              </FieldMini>
              <div>
                <div className="mb-2 flex items-center justify-between text-xs font-black uppercase tracking-[0.16em] text-slate-500"><span>Progreso operativo</span><span className="text-base tracking-normal text-slate-800">{statusProgress}%</span></div>
                <div className="h-2 rounded-full bg-slate-200"><div className="h-2 rounded-full bg-[#16C784] transition-all" style={{ width: `${statusProgress}%` }} /></div>
                <p className="mt-2 text-xs font-semibold text-[#64748B]">Se calcula según estado real; el avance detallado vive en el checklist.</p>
              </div>
              <FieldMini label="Prioridad actual">
                <div className="flex h-12 items-center rounded-2xl border border-[#E5EAF1] bg-white px-4 text-sm font-black text-slate-800">{priorityLabel(selectedPriority)}</div>
              </FieldMini>
              <FieldMini label="Próximo check-in">
                <Input type="date" className="h-12 rounded-2xl border-[#E5EAF1] bg-white font-semibold" />
              </FieldMini>
            </div>
          </SideCard>

          <SideCard>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-600">Comentarios y adjuntos</p>
            <p className="mt-3 text-sm font-medium leading-6 text-[#64748B]">Los comentarios, adjuntos y bitácora real se gestionan desde el detalle de la tarea para mantener una sola fuente de verdad.</p>
            {isEdit && taskId ? (
              <Link href={taskDetailRoute(taskId)} className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-2xl bg-[#050B18] px-4 text-sm font-bold text-white shadow-[0_14px_28px_rgba(5,11,24,0.18)] transition hover:-translate-y-0.5">
                Abrir detalle operativo
              </Link>
            ) : null}
          </SideCard>


        </aside>
      </div>
    </form>
  );
}

function FieldCard({ label, icon, helper, children }: { label: string; icon: ReactNode; helper?: string; children: ReactNode }) {
  return (
    <div className="rounded-[20px] border border-[#E5EAF1] bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.035)]">
      <label className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-slate-500">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 text-slate-500">{icon}</span>
        {label}
      </label>
      {children}
      {helper ? <p className="mt-2 text-xs font-semibold text-slate-500">{helper}</p> : null}
    </div>
  );
}

function FieldMini({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">{label}</span>
      {children}
    </label>
  );
}

function SideCard({ children }: { children: ReactNode }) {
  return <section className="rounded-[24px] border border-[#E5EAF1] bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">{children}</section>;
}

function CommentBubble({ name, meta, text }: { name: string; meta: string; text: string }) {
  return (
    <div className="rounded-2xl bg-slate-50/90 p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-black text-slate-800">{name}</p>
        <p className="text-xs font-semibold text-slate-500">{meta}</p>
      </div>
      <p className="mt-2 text-sm font-medium leading-6 text-slate-600">{text}</p>
    </div>
  );
}

function priorityLabel(value?: string) {
  if (value === "alta") return "Alta";
  if (value === "baja") return "Baja";
  return "Media";
}
