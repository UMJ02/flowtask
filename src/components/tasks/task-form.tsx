"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getClientWorkspaceContext, findOrganizationClientId, fetchWorkspaceProjects } from "@/lib/supabase/workspace-client";
import { resolveProjectEntityContext, validateTaskProjectClientIntegrity } from "@/lib/security/entity-integrity";
import { getClientAccessSummary, hasClientAccess } from "@/lib/security/client-access";
import { DEPARTMENTS } from "@/lib/constants/departments";
import { TASK_STATUSES } from "@/lib/constants/task-status";
import { TASK_PRIORITIES } from "@/lib/constants/task-priority";
import { taskDetailRoute, taskListRoute, type AppRoute } from "@/lib/navigation/routes";
import { taskSchema } from "@/lib/validations/task";
import { getDepartmentIdByCode } from "@/lib/queries/departments";
import { logActivity } from "@/lib/activity/log-client";
import { trackEvent } from "@/lib/telemetry/track-event";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { z } from "zod";

type TaskValues = z.infer<typeof taskSchema>;

interface TaskFormProps {
  taskId?: string;
  initialData?: Partial<TaskValues>;
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
  const [loadingProjects, setLoadingProjects] = useState(true);
  const router = useRouter();
  const isEdit = Boolean(taskId);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
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
    },
  });

  const resetValues = useMemo(() => ({
    title: initialData?.title ?? "",
    description: initialData?.description ?? "",
    status: initialData?.status ?? "en_proceso",
    priority: initialData?.priority ?? "media",
    department: initialData?.department ?? "",
    clientName: initialData?.clientName ?? "",
    dueDate: initialData?.dueDate ?? "",
    projectId: initialData?.projectId ?? "",
  }), [initialData]);

  useEffect(() => {
    let active = true;
    const loadProjects = async () => {
      setLoadingProjects(true);
      const workspace = await getClientWorkspaceContext();
      if (!workspace.user) {
        if (active) {
          setProjects([]);
          setLoadingProjects(false);
        }
        return;
      }
      const rows = await fetchWorkspaceProjects(workspace.supabase, workspace.user.id, workspace.activeOrganizationId, "edit");
      if (active) {
        setProjects(rows);
        setLoadingProjects(false);
      }
    };
    void loadProjects();
    return () => {
      active = false;
    };
  }, []);

  const onSubmit = async (values: TaskValues) => {
    setMessage(isEdit ? "Guardando cambios…" : "Creando tarea…");
    setServerError(null);
    const workspace = await getClientWorkspaceContext();
    const supabase = workspace.supabase;
    const user = workspace.user;

    if (!user) {
      setServerError("Sesión no válida.");
      setMessage(null);
      return;
    }

    let departmentId: number | null = null;
    try {
      departmentId = await getDepartmentIdByCode(values.department);
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "No fue posible cargar el departamento.");
      setMessage(null);
      return;
    }

    const clientName = values.clientName?.trim() || null;
    const clientId = await findOrganizationClientId(supabase, workspace.activeOrganizationId, clientName);
    const access = await getClientAccessSummary(supabase as any, user.id, workspace.activeOrganizationId);
    const selectedProject = await resolveProjectEntityContext(supabase as any, values.projectId || null);

    if (clientId && !hasClientAccess(access, clientId, "edit")) {
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
      if (!hasClientAccess(access, selectedProject.clientId ?? null, "edit")) {
        setServerError("No tienes permisos para crear o editar tareas en el proyecto seleccionado.");
        setMessage(null);
        return;
      }
    }

    const integrity = validateTaskProjectClientIntegrity({
      selectedProject,
      selectedClientId: clientId,
      selectedClientName: clientName,
      activeOrganizationId: workspace.activeOrganizationId,
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
    };

    const result = isEdit
      ? await supabase.from("tasks").update(payload).eq("id", taskId!)
      : await supabase
          .from("tasks")
          .insert({ owner_id: user.id, organization_id: workspace.activeOrganizationId, ...payload })
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
        entityType: 'task',
        entityId: activityEntityId,
        action: isEdit ? 'task_updated' : 'task_created',
        metadata: { title: payload.title, status: payload.status, client_id: payload.client_id ?? undefined, client_name: payload.client_name ?? undefined, project_id: values.projectId || undefined, organization_id: workspace.activeOrganizationId },
      });
    }
    void trackEvent({
      eventName: isEdit ? "update_task" : "create_task",
      organizationId: workspace.activeOrganizationId,
      metadata: {
        task_id: activityEntityId,
        client_id: payload.client_id,
        project_id: payload.project_id,
        priority: payload.priority,
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

  return (
    <form className="space-y-4 rounded-[24px] bg-white p-5 shadow-soft transition-all duration-200" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-slate-700">Título</label>
          <Input {...register("title")} placeholder="Ej. Diseñar propuesta cliente" />
          {errors.title ? <p className="text-sm text-red-600">{errors.title.message}</p> : null}
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-slate-700">Descripción</label>
          <Textarea {...register("description")} placeholder="Detalle de la tarea" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Estado</label>
          <Select {...register("status")}>
            {TASK_STATUSES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Prioridad</label>
          <Select {...register("priority")}>
            {TASK_PRIORITIES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-slate-700">Proyecto vinculado</label>
          <Select {...register("projectId")}>
            <option value="">Sin proyecto</option>
            {projects.map((item) => (
              <option key={item.id} value={item.id}>{item.title}</option>
            ))}
          </Select>
          <p className="text-xs text-slate-500">{loadingProjects ? "Cargando proyectos del workspace…" : "Opcional: asigna esta tarea a un proyecto activo."}</p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Departamento</label>
          <Select {...register("department")}>
            <option value="">Seleccionar</option>
            {DEPARTMENTS.map((item) => (
              <option key={item.code} value={item.code}>
                {item.label}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Cliente</label>
          <Input {...register("clientName")} placeholder="Nombre del cliente" />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-slate-700">Deadline</label>
          <Input {...register("dueDate")} type="date" />
        </div>
      </div>
      {serverError ? <p className="text-sm text-red-600">{serverError}</p> : null}
      {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
      <div className="flex flex-wrap gap-3">
        <Button loading={isBusy} type="submit">
          {submitLabel ?? (isEdit ? "Guardar cambios" : "Guardar tarea")}
        </Button>
        <Button type="button" variant="secondary" disabled={isBusy} onClick={() => reset(resetValues)}>
          Restablecer
        </Button>
        <Link href={cancelHref} className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:border-emerald-200 hover:bg-emerald-50">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
