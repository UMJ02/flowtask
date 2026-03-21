"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { DEPARTMENTS } from "@/lib/constants/departments";
import { TASK_STATUSES } from "@/lib/constants/task-status";
import { taskSchema } from "@/lib/validations/task";
import { getDepartmentIdByCode } from "@/lib/queries/departments";
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
  redirectTo?: string;
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
      department: initialData?.department ?? "",
      clientName: initialData?.clientName ?? "",
      dueDate: initialData?.dueDate ?? "",
    },
  });

  const onSubmit = async (values: TaskValues) => {
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
    };

    const query = isEdit
      ? supabase.from("tasks").update(payload).eq("id", taskId!)
      : supabase.from("tasks").insert({ owner_id: user.id, ...payload });

    const { error } = await query;

    if (error) {
      setServerError(error.message);
      return;
    }

    const okMessage = successMessage ?? (isEdit ? "Tarea actualizada correctamente." : "Tarea creada correctamente.");
    setMessage(okMessage);

    if (!isEdit) {
      reset({
        title: "",
        description: "",
        status: "en_proceso",
        department: "",
        clientName: "",
        dueDate: "",
      });
    }

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
      </div>
      {serverError ? <p className="text-sm text-red-600">{serverError}</p> : null}
      {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
      <div className="flex gap-3">
        <Button disabled={isSubmitting} type="submit">
          {isSubmitting ? "Guardando..." : submitLabel ?? (isEdit ? "Guardar cambios" : "Guardar tarea")}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() =>
            reset({
              title: initialData?.title ?? "",
              description: initialData?.description ?? "",
              status: initialData?.status ?? "en_proceso",
              department: initialData?.department ?? "",
              clientName: initialData?.clientName ?? "",
              dueDate: initialData?.dueDate ?? "",
            })
          }
        >
          Restablecer
        </Button>
      </div>
    </form>
  );
}
