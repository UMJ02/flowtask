"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { DEPARTMENTS } from "@/lib/constants/departments";
import { PROJECT_STATUSES } from "@/lib/constants/project-status";
import { generateShareToken } from "@/lib/utils/tokens";
import { projectSchema } from "@/lib/validations/project";
import { getDepartmentIdByCode } from "@/lib/queries/departments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { z } from "zod";

type ProjectValues = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  projectId?: string;
  initialData?: Partial<ProjectValues>;
  submitLabel?: string;
  successMessage?: string;
  redirectTo?: string;
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
    setMessage(null);
    setServerError(null);
    const supabase = createClient();
    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;

    if (!user) {
      setServerError("Sesión no válida.");
      return;
    }

    let departmentId: number | null = null;
    try {
      departmentId = await getDepartmentIdByCode(values.department);
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "No fue posible cargar el departamento.");
      return;
    }

    const payload = {
      title: values.title,
      description: values.description || null,
      status: values.status,
      department_id: departmentId,
      client_name: values.clientName || null,
      due_date: values.dueDate || null,
      is_collaborative: values.isCollaborative,
      share_enabled: values.isCollaborative,
    };

    if (isEdit) {
      const updateValues: Record<string, unknown> = { ...payload };
      if (values.isCollaborative) {
        updateValues.share_token = generateShareToken();
      } else {
        updateValues.share_token = null;
      }

      const { error } = await supabase.from("projects").update(updateValues).eq("id", projectId!);
      if (error) {
        setServerError(error.message);
        return;
      }
    } else {
      const shareToken = values.isCollaborative ? generateShareToken() : null;
      const { data, error } = await supabase
        .from("projects")
        .insert({
          owner_id: user.id,
          ...payload,
          share_token: shareToken,
        })
        .select("id")
        .single();

      if (error) {
        setServerError(error.message);
        return;
      }

      if (data?.id) {
        await supabase.from("project_members").insert({
          project_id: data.id,
          user_id: user.id,
          role: "owner",
        });
      }

      reset({
        title: "",
        description: "",
        status: "activo",
        department: "",
        clientName: "",
        dueDate: "",
        isCollaborative: false,
      });
    }

    const okMessage = successMessage ?? (isEdit ? "Proyecto actualizado correctamente." : "Proyecto creado correctamente.");
    setMessage(okMessage);
    router.refresh();

    if (redirectTo) {
      router.push(redirectTo);
      return;
    }
  };

  return (
    <form className="space-y-4 rounded-[24px] bg-white p-5 shadow-soft" onSubmit={handleSubmit(onSubmit)}>
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
      <div className="flex gap-3">
        <Button disabled={isSubmitting} type="submit">
          {isSubmitting ? "Guardando..." : submitLabel ?? (isEdit ? "Guardar cambios" : "Guardar proyecto")}
        </Button>
        <Button
          type="button"
          variant="secondary"
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
      </div>
    </form>
  );
}
