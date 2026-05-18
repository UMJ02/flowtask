"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getClientWorkspaceContext, findWorkspaceClientId, fetchWorkspaceClientsDirectory, fetchWorkspaceCountries, fetchWorkspaceDepartments } from "@/lib/supabase/workspace-client";
import { resolveProjectEntityContext, validateTaskProjectClientIntegrity } from "@/lib/security/entity-integrity";
import { getClientAccessSummary, hasClientAccess } from "@/lib/security/client-access";
import { TASK_STATUSES } from "@/lib/constants/task-status";
import { TASK_PRIORITIES } from "@/lib/constants/task-priority";
import { taskDetailRoute, taskListRoute, type AppRoute } from "@/lib/navigation/routes";
import { taskSchema } from "@/lib/validations/task";
import { getWorkspaceDepartmentIdByCode } from "@/lib/queries/departments";
import { logActivity } from "@/lib/activity/log-client";
import { emitTaskUpdated } from "@/lib/tasks/task-mutations";
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
  ClipboardCheck,
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
  const [departmentOptions, setDepartmentOptions] = useState<Array<{ id: string; code: string; name: string }>>([]);
  const [countryOptions, setCountryOptions] = useState<Array<{ id: string; code: string; name: string }>>([]);
  const [clientOptions, setClientOptions] = useState<Array<{ id: string; name: string }>>([]);
  const [workspaceOwnerLabel, setWorkspaceOwnerLabel] = useState("Cargando usuario…");
  const [quickTipIndex, setQuickTipIndex] = useState(0);
  const [checklistStats, setChecklistStats] = useState({ total: 0, done: 0, loaded: false });
  const router = useRouter();
  const isEdit = Boolean(taskId);
  const fixedProjectId = initialData?.projectId ?? "";
  const isProjectTask = Boolean(fixedProjectId);

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
    return isPlaceholder ? profile?.email?.trim() || "Usuario del espacio" : fullName;
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
    const timer = window.setInterval(() => setQuickTipIndex((value) => (value + 1) % QUICK_TIPS.length), 6000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let active = true;
    async function loadChecklistStats() {
      if (!taskId) {
        setChecklistStats({ total: 0, done: 0, loaded: true });
        return;
      }
      const workspace = await getClientWorkspaceContext();
      const { data, error } = await workspace.supabase
        .from("task_checklist_items")
        .select("done")
        .eq("task_id", taskId);
      if (!active) return;
      if (error) {
        setChecklistStats({ total: 0, done: 0, loaded: true });
        return;
      }
      const rows = Array.isArray(data) ? data : [];
      setChecklistStats({ total: rows.length, done: rows.filter((item) => Boolean(item.done)).length, loaded: true });
    }
    void loadChecklistStats();
    return () => {
      active = false;
    };
  }, [taskId]);

  useEffect(() => {
    let active = true;
    const loadRegistryOptions = async () => {
      const workspace = await getClientWorkspaceContext();
      if (!workspace.user) {
        if (active) {
          setDepartmentOptions([]);
          setCountryOptions([]);
          setClientOptions([]);
          setWorkspaceOwnerLabel("Sin sesión");
        }
        return;
      }
      const [departmentRows, countryRows, clientRows, profileRes] = await Promise.all([
        fetchWorkspaceDepartments(workspace.supabase, workspace.user.id, isEdit ? (initialData?.organizationId ?? null) : workspace.activeOrganizationId),
        fetchWorkspaceCountries(workspace.supabase, workspace.user.id, isEdit ? (initialData?.organizationId ?? null) : workspace.activeOrganizationId),
        fetchWorkspaceClientsDirectory(workspace.supabase, workspace.user.id, isEdit ? (initialData?.organizationId ?? null) : workspace.activeOrganizationId),
        workspace.supabase.from("profiles").select("full_name,email").eq("id", workspace.user.id).maybeSingle(),
      ]);
      if (active) {
        setDepartmentOptions(appendMissingDepartmentOption(departmentRows, initialData?.department));
        setCountryOptions(appendMissingCountryOption(countryRows, initialData?.country));
        setClientOptions(clientRows);
        setWorkspaceOwnerLabel(getProfileLabel(profileRes.data ?? { email: workspace.user.email ?? null }));
      }
    };
    void loadRegistryOptions();
    return () => {
      active = false;
    };
  }, [initialData?.department, initialData?.country, initialData?.organizationId, isEdit]);


  useEffect(() => {
    if (!departmentOptions.length && !countryOptions.length) return;
    setValue("department", normalizeDepartmentValue(initialData?.department, departmentOptions), { shouldDirty: false, shouldTouch: false });
    setValue("country", normalizeCountryValue(initialData?.country, countryOptions), { shouldDirty: false, shouldTouch: false });
    // Do not depend on watched values here: otherwise every manual select change
    // gets overwritten by the saved initial value and the field feels locked.
  }, [initialData?.department, initialData?.country, departmentOptions, countryOptions, setValue]);

  const onSubmit = async (values: TaskValues) => {
    setMessage(isEdit ? "Guardando cambios…" : "Creando tarea…");
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
      setServerError(error instanceof Error ? error.message : "No fue posible cargar el departamento.");
      setMessage(null);
      return;
    }

    const clientName = values.clientName?.trim() || null;
    const clientId = await findWorkspaceClientId(supabase, user.id, formOrganizationId, clientName);
    const access = await getClientAccessSummary(supabase as any, user.id, formOrganizationId);
    const selectedProject = await resolveProjectEntityContext(supabase as any, fixedProjectId || null);

    if (formOrganizationId && clientId && !hasClientAccess(access, clientId, "edit")) {
      setServerError("No puedes usar este registro en la tarea. Elige otro registro o pide acceso al administrador.");
      setMessage(null);
      return;
    }

    if (fixedProjectId) {
      if (!selectedProject) {
        setServerError("No encontramos ese proyecto en tu espacio de trabajo.");
        setMessage(null);
        return;
      }
      if (formOrganizationId && !hasClientAccess(access, selectedProject.clientId ?? null, "edit")) {
        setServerError("No tienes acceso para crear tareas en este proyecto.");
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
      setServerError(integrity.message ?? "La tarea no coincide con la información del proyecto seleccionado.");
      setMessage(null);
      return;
    }

    const payload = {
      title: values.title,
      description: values.description || null,
      status: values.status,
      priority: values.priority,
      client_name: integrity.resolvedClientName,
      client_id: integrity.resolvedClientId,
      due_date: values.dueDate || null,
      project_id: fixedProjectId || null,
      department_id: selectedProject?.departmentId ?? departmentId,
      country: selectedProject?.country ?? ((countryOptions.find((item) => item.name === values.country || item.code === values.country)?.name ?? values.country) || null),
    };

    const result = isEdit
      ? await supabase.from("tasks").update(payload).eq("id", taskId!).select("id,title,status,priority,due_date,department_id,updated_at").maybeSingle()
      : await supabase
          .from("tasks")
          .insert({ owner_id: user.id, organization_id: formOrganizationId, ...payload })
          .select("id")
          .single();

    const error = result.error;
    const confirmedTask = (result as { data?: Record<string, unknown> | null }).data ?? null;

    if (error || (isEdit && !confirmedTask)) {
      setServerError(error?.message ?? "No pudimos confirmar los cambios de la tarea.");
      setMessage(null);
      return;
    }

    if (isEdit && confirmedTask?.id && typeof confirmedTask.id === "string") {
      emitTaskUpdated(confirmedTask as Record<string, unknown> & { id: string }, "form");
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
          project_id: fixedProjectId || undefined,
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

    const okMessage = successMessage ?? (isEdit ? "Tarea actualizada. Puedes seguir trabajando." : "Tarea creada y lista para seguir trabajando.");
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
  const statusProgress = checklistStats.total > 0 ? Math.round((checklistStats.done / checklistStats.total) * 100) : 0;

  return (
    <form className="ft-tasks-screen bg-[#F6F8FC] pb-8" onSubmit={handleSubmit(onSubmit)}>
      <div className="sticky top-0 z-40 mb-6 px-3 py-2 sm:px-4 lg:px-3">
        <div className="ft-tasks-toolbar bg-white/95 px-4 py-4 backdrop-blur-xl sm:px-3 lg:px-3">
          <div className="flex min-h-[72px] w-full flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <Link href={cancelHref} className="ft-btn-primary inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white transition" aria-label="Volver">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="min-w-0">
              <h1 className="truncate text-base font-semibold tracking-[-0.035em] ft-text-main sm:text-[18px]">{editorTitle}</h1>
              <p className="mt-1 line-clamp-1 text-sm font-medium ft-text-muted">Crea una tarea clara para que tu equipo sepa qué hacer y cuándo entregarlo.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <button type="button" onClick={() => reset(resetValues)} className="ft-btn-secondary inline-flex h-10 items-center gap-2 px-3.5 text-[13px] font-bold text-slate-800 transition">
              Limpiar <ChevronDown className="h-4 w-4 rotate-90" />
            </button>
            <Link href={cancelHref} className="ft-btn-secondary inline-flex h-10 items-center justify-center px-4 text-[13px] font-bold text-slate-800 transition">
              Cancelar
            </Link>
            <Button loading={isBusy} type="submit" className="ft-btn-primary h-10 px-3 text-white">
              {submitLabel ?? (isEdit ? "Guardar cambios" : "Crear tarea")}
            </Button>
          </div>
        </div>
      </div>

      </div>
      <div className="grid w-full gap-4 px-3 sm:px-4 lg:px-3 xl:grid-cols-[minmax(0,1fr)_380px] 2xl:gap-3">
        <div className="space-y-3">
          <section className="ft-task-form-panel p-4 sm:p-3">
            <div className="ft-subcard p-3 transition focus-within:border-emerald-200 focus-within:ring-4 focus-within:ring-emerald-50">
              <div className="mb-3 flex items-center justify-between gap-3">
                <label className="ft-kicker text-slate-500">Título</label>
                <span className="text-xs font-bold text-slate-400">{watchedTitle.length} / 120</span>
              </div>
              <Input {...register("title")} placeholder="Ej. Diseñar propuesta cliente" className="min-h-[52px] w-full rounded-xl border ft-border bg-white px-4 py-2.5 text-[18px] font-semibold leading-[1.15] tracking-[-0.028em] ft-text-main shadow-none outline-none transition placeholder:text-slate-400 focus:border-[#16C784] focus:ring-4 focus:ring-emerald-500/10 sm:text-[18px]" />
              {errors.title ? <p className="mt-3 text-sm font-semibold text-red-600">{errors.title.message}</p> : null}
            </div>

            <div className="mt-5 overflow-hidden rounded-[16px] border ft-border bg-white">
              <div className="flex items-center justify-between border-b ft-border px-3 py-4">
                <label className="ft-kicker text-slate-500">Descripción</label>
                <span className="text-xs font-bold text-slate-400">{watchedDescription.length} / 2000</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 border-b ft-border bg-slate-50/60 px-4 py-3 text-xs font-semibold text-slate-500">
                Agrega detalles, entregables o notas que ayuden a completar esta tarea.
              </div>
              <Textarea {...register("description")} placeholder="Describe el contexto, entregables o notas importantes…" className="min-h-[130px] rounded-none border-0 bg-white px-3 py-4 text-base leading-6 shadow-none focus:border-0 focus:ring-0" />
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <FieldCard label="Estado" icon={<Clock3 className="h-4 w-4" />}>
              <Select {...register("status")} className="h-10 font-semibold">
                {TASK_STATUSES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </Select>
            </FieldCard>
            <FieldCard label="Prioridad" icon={<Flag className="h-4 w-4" />}>
              <Select {...register("priority")} className="h-10 font-semibold">
                {TASK_PRIORITIES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </Select>
            </FieldCard>
            {isProjectTask ? (
              <div className="rounded-[16px] border border-emerald-200 bg-emerald-50/80 p-4 md:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">Tarea de proyecto</p>
                <p className="mt-2 text-sm font-semibold text-slate-700">Esta tarea quedará dentro del proyecto y usará su misma información base.</p>
              </div>
            ) : null}
            <FieldCard label="Responsable" icon={<UserRound className="h-4 w-4" />}>
              <Input value={workspaceOwnerLabel} readOnly className="h-10 bg-slate-50 font-semibold text-slate-500" />
            </FieldCard>
{!isProjectTask ? (
              <>
                <FieldCard label="Departamento" icon={<FileText className="h-4 w-4" />}>
                  <Select {...register("department")} className="h-10 font-semibold">
                    <option value="">Seleccionar</option>
                    {departmentOptions.map((item) => <option key={item.id} value={item.code}>{item.name}</option>)}
                  </Select>
                </FieldCard>
                <FieldCard label="País" icon={<Flag className="h-4 w-4" />}>
                  <Select {...register("country")} className="h-10 font-semibold">
                    <option value="">Seleccionar país</option>
                    {countryOptions.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}
                  </Select>
                </FieldCard>
              </>
            ) : null}
            <FieldCard label="Deadline" icon={<CalendarDays className="h-4 w-4" />}>
              <Input {...register("dueDate")} type="date" className="h-10 font-semibold" />
            </FieldCard>
{!isProjectTask ? (
              <FieldCard label="Registro" icon={<Tag className="h-4 w-4" />}>
                <Input {...register("clientName")} placeholder="Nombre del registro" list="registry-client-options" className="h-10 font-semibold" />
                <datalist id="registry-client-options">
                  {clientOptions.map((item) => <option key={item.id} value={item.name} />)}
                </datalist>
              </FieldCard>
            ) : null}
          </section>

          <details className="group overflow-hidden rounded-[16px] border ft-border bg-white">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-4">
              <span className="ft-kicker text-slate-500">Datos relacionados</span>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-500 transition group-open:rotate-180"><ChevronDown className="h-4 w-4" /></span>
            </summary>
            <div className="border-t ft-border p-3">
              <p className="text-sm font-medium leading-6 ft-text-muted">Aquí aparecerá información útil según el país, registro o proyecto que selecciones. Solo mostramos datos que la app puede guardar correctamente.</p>
            </div>
          </details>

          {serverError ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{serverError}</div> : null}
          {message ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{message}</div> : null}
        </div>

        <aside className="space-y-3 xl:sticky xl:top-[104px] xl:self-start">
          <SideCard tone="green">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600"><ShieldCheck className="h-4 w-4" /> Acceso</p>
                <p className="mt-3 text-sm font-medium leading-6 ft-text-muted">Los permisos se gestionan desde Ajustes. Aquí solo verás las opciones que puedes usar.</p>
              </div>
              <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Acceso completo</span>
            </div>
          </SideCard>

          <SideCard tone="amber">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">Seguimiento</p>
            <p className="mt-2 text-sm font-medium ft-text-muted">Revisa el estado, la prioridad y el avance antes de guardar.</p>
            <div className="mt-5 space-y-4">
              <FieldMini label="Estado de seguimiento">
                <Select className="h-10 rounded-2xl border-amber-100 bg-amber-50/70 font-semibold" value={selectedStatus ?? "en_proceso"} onChange={(event) => setValue("status", event.target.value as TaskValues["status"], { shouldDirty: true })}>
                  {TASK_STATUSES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </Select>
              </FieldMini>
              <div>
                <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.16em] text-slate-500"><span>Avance</span><span className="text-base tracking-normal text-slate-800">{statusProgress}%</span></div>
                <div className="h-2 rounded-full bg-slate-200"><div className="h-2 rounded-full bg-[#16C784] transition-all" style={{ width: `${statusProgress}%` }} /></div>
                <p className="mt-2 text-xs font-semibold ft-text-muted">Se sincroniza con el checklist: {checklistStats.total ? `${checklistStats.done}/${checklistStats.total} puntos completados.` : 'sin checklist todavía.'}</p>
              </div>
              <FieldMini label="Prioridad actual">
                <div className="flex h-10 items-center rounded-2xl border ft-border bg-white px-3.5 text-[13px] font-semibold text-slate-800">{priorityLabel(selectedPriority)}</div>
              </FieldMini>
              <div className="rounded-[18px] border border-amber-200 bg-white/70 p-4 text-sm font-semibold leading-6 text-amber-900">
                Próximo seguimiento: podrás definirlo después de crear la tarea, usando comentarios, recordatorios o checklist.
              </div>
              {isEdit && checklistStats.loaded && checklistStats.total === 0 ? (
                <Link href={taskId ? `${taskDetailRoute(taskId)}#checklist` : taskListRoute()} className="group flex items-start gap-3 rounded-[18px] border border-amber-200 bg-amber-100/80 p-4 text-left transition hover:bg-amber-100">
                  <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white text-amber-600 ring-1 ring-amber-200">
                    <ClipboardCheck className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-amber-950">Agrega un checklist para medir el avance</span>
                    <span className="mt-1 block text-xs font-semibold leading-5 text-amber-800">Divide el trabajo en pasos pequeños para que el avance sea más fácil de seguir.</span>
                  </span>
                </Link>
              ) : null}
            </div>
          </SideCard>

          <SideCard tone="purple">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">Comentarios y archivos</p>
            <p className="mt-3 text-sm font-medium leading-6 ft-text-muted">Después de crear la tarea podrás agregar comentarios, archivos y revisar la actividad en un solo lugar.</p>
            {isEdit && taskId ? (
              <Link href={taskDetailRoute(taskId)} className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-2xl bg-[#050B18] px-3.5 text-[13px] font-bold text-white transition">
                Abrir detalle de la tarea
              </Link>
            ) : null}
          </SideCard>

          <SideCard tone="blue">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">Consejos rápidos</p>
            <div className="mt-4 rounded-[18px] bg-white/70 p-4">
              <p className="text-sm font-semibold ft-text-main">{QUICK_TIPS[quickTipIndex].title}</p>
              <p className="mt-2 text-sm leading-6 ft-text-muted">{QUICK_TIPS[quickTipIndex].text}</p>
            </div>
            <div className="mt-4 flex gap-2">
              {QUICK_TIPS.map((tip, index) => (
                <button key={tip.title} type="button" onClick={() => setQuickTipIndex(index)} className={`h-2 flex-1 rounded-full transition ${index === quickTipIndex ? "bg-[#16C784]" : "bg-white/80"}`} aria-label={`Ver consejo ${index + 1}`} />
              ))}
            </div>
          </SideCard>

        </aside>
      </div>
    </form>
  );
}

function FieldCard({ label, icon, helper, children }: { label: string; icon: ReactNode; helper?: string; children: ReactNode }) {
  return (
    <div className="rounded-[16px] border ft-border bg-white p-4">
      <label className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
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
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</span>
      {children}
    </label>
  );
}

function SideCard({ children, tone = "white" }: { children: ReactNode; tone?: "white" | "green" | "amber" | "purple" | "blue" }) {
  const toneClass = tone === "green" ? "border-[#BBF7D0] bg-[#ECFDF5]" : tone === "amber" ? "border-[#FDECC8] bg-[#FFF8E8]" : tone === "purple" ? "border-[#E9D5FF] bg-[#FAF5FF]" : tone === "blue" ? "border-[#BFDBFE] bg-[#EFF6FF]" : "ft-border bg-white";
  return <section className={`rounded-[16px] border p-3 ${toneClass}`}>{children}</section>;
}

function CommentBubble({ name, meta, text }: { name: string; meta: string; text: string }) {
  return (
    <div className="rounded-2xl bg-slate-50/90 p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-800">{name}</p>
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

const QUICK_TIPS = [
  { title: "Define un título claro", text: "Usa una frase corta que explique el resultado esperado de la tarea." },
  { title: "Agrega contexto útil", text: "Incluye entregables, referencias o instrucciones para evitar retrabajo." },
  { title: "Asigna prioridad y fecha", text: "La prioridad y la fecha límite ayudan a ordenar el trabajo diario sin perder foco." },
  { title: "Usa checklist para medir progreso", text: "Divide tareas complejas en pasos pequeños y accionables." },
];
