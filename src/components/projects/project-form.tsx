"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getClientWorkspaceContext, findOrganizationClientId } from "@/lib/supabase/workspace-client";
import { getClientAccessSummary, hasClientAccess } from "@/lib/security/client-access";
import { DEPARTMENTS } from "@/lib/constants/departments";
import { PROJECT_STATUSES } from "@/lib/constants/project-status";
import { projectDetailRoute, projectListRoute, type AppRoute } from "@/lib/navigation/routes";
import { generateShareToken } from "@/lib/utils/tokens";
import { projectSchema } from "@/lib/validations/project";
import { getDepartmentIdByCode } from "@/lib/queries/departments";
import { logActivity } from "@/lib/activity/log-client";
import { trackEvent } from "@/lib/telemetry/track-event";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { z } from "zod";

type ProjectValues = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  projectId?: string;
  initialData?: Partial<ProjectValues> & { shareToken?: string | null };
  submitLabel?: string;
  successMessage?: string;
  redirectTo?: AppRoute;
}

export function ProjectForm({
  projectId,
  initialData,
  submitLabel,
  successMessage,
  redirectTo,
}: ProjectFormProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isRefreshing, startRefresh] = useTransition();
  const router = useRouter();
  const isEdit = Boolean(projectId);
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
    reset,
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
    },
  });

  const onSubmit = async (values: ProjectValues) => {
    setMessage(isEdit ? "Guardando cambios…" : "Creando proyecto…");
    setServerError(null);
    const workspace = await getClientWorkspaceContext();
    const supabase = workspace.supabase;
    const user = workspace.user;

    if (!user) {
      setServerError("Sesión no válida.");
      setMessage(null);
      return;
    }

    if (!workspace.activeOrganizationId) {
      setServerError("Antes de crear proyectos debes activar una organización desde Equipo.");
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

    if (clientId && !hasClientAccess(access, clientId, "edit")) {
      setServerError("No tienes permisos para crear o editar proyectos sobre ese cliente.");
      setMessage(null);
      return;
    }

    const normalizedClientName = clientName;

    const payload = {
      title: values.title,
      description: values.description || null,
      status: values.status,
      department_id: departmentId,
      client_name: normalizedClientName,
      client_id: clientId,
      due_date: values.dueDate || null,
      is_collaborative: values.isCollaborative,
      share_enabled: values.isCollaborative,
    };

    let createdProjectId: string | null = null;

    if (isEdit) {
      const updateValues: Record<string, unknown> = { ...payload };
      updateValues.share_token = values.isCollaborative ? initialData?.shareToken ?? generateShareToken() : null;
      const { error } = await supabase.from("projects").update(updateValues).eq("id", projectId!);
      if (error) {
        setServerError(error.message);
        setMessage(null);
        return;
      }

      await logActivity(supabase as any, {
        entityType: 'project',
        entityId: projectId!,
        action: 'project_updated',
        metadata: { title: payload.title, status: payload.status, client_id: clientId ?? undefined, client_name: normalizedClientName ?? undefined, organization_id: workspace.activeOrganizationId },
      });
    } else {
      const shareToken = values.isCollaborative ? generateShareToken() : null;
      const { data, error } = await supabase
        .from("projects")
        .insert({
          owner_id: user.id,
          organization_id: workspace.activeOrganizationId,
          ...payload,
          share_token: shareToken,
        })
        .select("id")
        .single();

      if (error) {
        setServerError(error.message);
        setMessage(null);
        return;
      }

      createdProjectId = data?.id ?? null;

      if (createdProjectId) {
        await supabase.from("project_members").insert({
          project_id: createdProjectId,
          user_id: user.id,
          role: "owner",
        });

        await logActivity(supabase as any, {
          entityType: 'project',
          entityId: createdProjectId,
          action: 'project_created',
          metadata: { title: payload.title, status: payload.status, client_id: clientId ?? undefined, client_name: normalizedClientName ?? undefined, organization_id: workspace.activeOrganizationId },
        });
      }
    }

    void trackEvent({
      eventName: isEdit ? "update_project" : "create_project",
      organizationId: workspace.activeOrganizationId,
      metadata: {
        project_id: isEdit ? projectId ?? null : createdProjectId,
        client_id: clientId,
        collaborative: values.isCollaborative,
      },
    });

    const okMessage = successMessage ?? (isEdit ? "Proyecto actualizado al instante." : "Proyecto creado y listo para compartir.");
    setMessage(okMessage);

    const nextRoute = isEdit ? redirectTo : redirectTo ?? (createdProjectId ? projectDetailRoute(createdProjectId) : undefined);

    startRefresh(() => {
      router.refresh();
      if (nextRoute) router.push(nextRoute);
    });
  };

  const isBusy = isSubmitting || isRefreshing;
  const cancelHref = redirectTo ?? projectListRoute();

  return (
    <form className="space-y-4 rounded-[24px] bg-white p-5 shadow-soft transition-all duration-200" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-slate-700">Nombre del proyecto</label>
          <Input {...register("title")} placeholder="Ej. Lanzamiento web interna" />
          {errors.title ? <p className="text-sm text-red-600">{errors.title.message}</p> : null}
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-slate-700">Descripción</label>
          <Textarea {...register("description")} placeholder="Detalle del proyecto" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Estado</label>
          <Select {...register("status")}>
            {PROJECT_STATUSES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </Select>
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
          <p className="text-xs text-slate-500">Usa clientes del workspace activo para mantener proyectos y tareas en el mismo contexto.</p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Deadline</label>
          <Input {...register("dueDate")} type="date" />
        </div>
        <label className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700 md:col-span-2">
          <input type="checkbox" {...register("isCollaborative")} />
          Proyecto colaborativo y con enlace compartible
        </label>
      </div>
      {serverError ? <p className="text-sm text-red-600">{serverError}</p> : null}
      {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
      <div className="flex flex-wrap gap-3">
        <Button loading={isBusy} type="submit">
          {submitLabel ?? (isEdit ? "Guardar cambios" : "Guardar proyecto")}
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={isBusy}
          onClick={() =>
            reset({
              title: initialData?.title ?? "",
              description: initialData?.description ?? "",
              status: initialData?.status ?? "activo",
              department: initialData?.department ?? "",
              clientName: initialData?.clientName ?? "",
              dueDate: initialData?.dueDate ?? "",
              isCollaborative: initialData?.isCollaborative ?? false,
            })
          }
        >
          Restablecer
        </Button>
        <Link href={cancelHref} className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:border-emerald-200 hover:bg-emerald-50">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
