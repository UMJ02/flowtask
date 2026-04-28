"use client";

import Link from "next/link";
import { useEffect, useState, useTransition, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getClientWorkspaceContext, findWorkspaceClientId, fetchWorkspaceClientsDirectory, fetchWorkspaceCountries, fetchWorkspaceDepartments } from "@/lib/supabase/workspace-client";
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
import { ImagePlus, X } from "lucide-react";
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

export function ProjectForm({
  projectId,
  initialData,
  submitLabel,
  successMessage,
  redirectTo,
  sourceTaskId,
}: ProjectFormProps) {
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
    // Do not depend on watched values here: otherwise every manual select change
    // gets overwritten by the saved initial value and the field feels locked.
  }, [initialData?.department, initialData?.country, departmentOptions, countryOptions, setValue]);

  const onSubmit = async (values: ProjectValues) => {
    setMessage(isEdit ? "Guardando cambios…" : "Creando proyecto…");
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

    if (formOrganizationId && clientId && !hasClientAccess(access, clientId, "edit")) {
      setServerError("No tienes permisos para crear o editar proyectos sobre ese cliente.");
      setMessage(null);
      return;
    }

    const normalizedClientName = clientName;

    let imageUrl: string | null = projectImagePreview ? (initialData?.imageUrl ?? null) : null;

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
      client_name: normalizedClientName,
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
      const { error } = await supabase.from("projects").update(updateValues).eq("id", projectId!);
      if (error) {
        setServerError(error.message);
        setMessage(null);
        return;
      }

      await logActivity(supabase as any, {
        entityType: "project",
        entityId: projectId!,
        action: "project_updated",
        metadata: {
          title: payload.title,
          status: payload.status,
          client_id: clientId ?? undefined,
          client_name: normalizedClientName ?? undefined,
          organization_id: formOrganizationId,
          country: payload.country ?? undefined,
        },
      });
    } else {
      const shareToken = values.isCollaborative ? generateShareToken() : null;
      const { data, error } = await supabase
        .from("projects")
        .insert({
          owner_id: user.id,
          organization_id: formOrganizationId,
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

        if (sourceTaskId) {
          const [{ data: sourceTask }, { data: checklistRows }] = await Promise.all([
            supabase
              .from("tasks")
              .select("id,title,description,priority,due_date")
              .eq("id", sourceTaskId)
              .maybeSingle(),
            supabase
              .from("task_checklist_items")
              .select("title,due_date,position")
              .eq("task_id", sourceTaskId)
              .order("position", { ascending: true }),
          ]);

          const checklistTasks = (checklistRows ?? [])
            .map((item: any) => ({ title: String(item.title ?? "").trim(), due_date: item.due_date ?? null }))
            .filter((item: any) => item.title.length > 0);

          const childTasks = checklistTasks.length
            ? checklistTasks
            : sourceTask?.title
              ? [{ title: String(sourceTask.title), due_date: sourceTask.due_date ?? null }]
              : [];

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
              client_name: normalizedClientName,
              client_id: clientId,
              country: payload.country,
              due_date: item.due_date ?? payload.due_date,
            })));
          }

          await supabase
            .from("tasks")
            .update({ status: "concluido", completed_at: new Date().toISOString() })
            .eq("id", sourceTaskId);
        }

        await logActivity(supabase as any, {
          entityType: "project",
          entityId: createdProjectId,
          action: "project_created",
          metadata: {
            title: payload.title,
            status: payload.status,
            client_id: clientId ?? undefined,
            client_name: normalizedClientName ?? undefined,
            organization_id: formOrganizationId,
            country: payload.country ?? undefined,
          },
        });
      }
    }

    void trackEvent({
      eventName: isEdit ? "update_project" : "create_project",
      organizationId: formOrganizationId,
      metadata: {
        project_id: isEdit ? projectId ?? null : createdProjectId,
        client_id: clientId,
        collaborative: values.isCollaborative,
        country: payload.country,
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
        <div className="space-y-3 md:col-span-2">
          <label className="text-sm font-medium text-slate-700">Imagen del proyecto</label>
          <div className="grid gap-4 rounded-[22px] border border-slate-200 bg-slate-50/70 p-4 md:grid-cols-[180px_minmax(0,1fr)] md:items-center">
            <div className="relative flex h-32 items-center justify-center overflow-hidden rounded-[20px] bg-white ring-1 ring-slate-200">
              {projectImagePreview ? <img src={projectImagePreview} alt="Imagen del proyecto" className="h-full w-full object-cover" /> : <ImagePlus className="h-10 w-10 text-slate-400" />}
            </div>
            <div className="space-y-3">
              <input type="hidden" {...register("imageUrl")} />
              <Input
                type="file"
                accept="image/*"
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  const file = event.target.files?.[0] ?? null;
                  setProjectImageFile(file);
                  if (file) {
                    const preview = URL.createObjectURL(file);
                    setProjectImagePreview(preview);
                    setValue("imageUrl", preview, { shouldDirty: true });
                  }
                }}
              />
              {projectImagePreview ? (
                <button type="button" onClick={() => { setProjectImageFile(null); setProjectImagePreview(""); setValue("imageUrl", "", { shouldDirty: true }); }} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-rose-600">
                  <X className="h-4 w-4" /> Quitar imagen
                </button>
              ) : null}
              <p className="text-xs text-slate-500">Se muestra en la vista de proyecto y en el listado de proyectos. Máximo recomendado: 5 MB.</p>
            </div>
          </div>
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
            {departmentOptions.map((item) => (
              <option key={item.id} value={item.code}>
                {item.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Registro</label>
          <Input {...register("clientName")} placeholder="Nombre del registro" list="project-registry-client-options" />
          <datalist id="project-registry-client-options">
            {clientOptions.map((item) => (
              <option key={item.id} value={item.name} />
            ))}
          </datalist>
          <p className="text-xs text-slate-500">Usa registros del workspace activo para mantener proyectos y tareas en el mismo contexto.</p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">País</label>
          <Select {...register("country")}>
            <option value="">Seleccionar país</option>
            {countryOptions.map((item) => (
              <option key={item.id} value={item.name}>
                {item.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2 md:col-span-2">
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
          onClick={() => {
            reset({
              title: initialData?.title ?? "",
              description: initialData?.description ?? "",
              status: initialData?.status ?? "activo",
              department: normalizeDepartmentValue(initialData?.department, departmentOptions),
              clientName: initialData?.clientName ?? "",
              dueDate: initialData?.dueDate ?? "",
              isCollaborative: initialData?.isCollaborative ?? false,
              country: normalizeCountryValue(initialData?.country, countryOptions),
              imageUrl: initialData?.imageUrl ?? "",
            });
            setProjectImageFile(null);
            setProjectImagePreview(initialData?.imageUrl ?? "");
          }}
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
