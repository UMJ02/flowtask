"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { TASK_STATUSES } from "@/lib/constants/task-status";
import { logActivity } from "@/lib/activity/log-client";
import { createClientNotification } from "@/lib/notifications/create-client-notification";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { generateShareToken } from "@/lib/utils/tokens";
import { getTaskStatusUpdatePayload } from "@/lib/tasks/status";
import { emitTaskUpdated } from "@/lib/tasks/task-mutations";

interface TaskStatusFormProps {
  taskId: string;
  status: string;
  dueDate?: string | null;
  shareEnabled: boolean;
  shareToken: string | null;
  canEdit?: boolean;
  onSaved?: (next: { status: string; dueDate: string | null; shareEnabled: boolean; shareToken: string | null }) => void;
}

export function TaskStatusForm({ taskId, status, dueDate, shareEnabled, shareToken, canEdit = true, onSaved }: TaskStatusFormProps) {
  const router = useRouter();
  const [currentStatus, setCurrentStatus] = useState(status);
  const [currentDate, setCurrentDate] = useState(dueDate ?? "");
  const [currentShare, setCurrentShare] = useState(shareEnabled);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, startRefresh] = useTransition();

  useEffect(() => {
    setCurrentStatus(status);
  }, [status]);

  useEffect(() => {
    setCurrentDate(dueDate ?? "");
  }, [dueDate]);

  useEffect(() => {
    setCurrentShare(shareEnabled);
  }, [shareEnabled]);

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canEdit) return;
    setError(null);
    setMessage("Aplicando cambios…");
    setIsSaving(true);

    const supabase = createClient();
    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;

    const nextDueDate = currentDate || null;
    const nextShareToken = currentShare ? shareToken ?? generateShareToken() : null;

    const { data: confirmedTask, error: updateError } = await supabase
      .from("tasks")
      .update({
        ...getTaskStatusUpdatePayload(currentStatus, nextDueDate),
        share_enabled: currentShare,
        share_token: nextShareToken,
      })
      .eq("id", taskId)
      .select("id,title,status,priority,due_date,project_id,share_enabled,share_token,updated_at")
      .maybeSingle();

    if (updateError || !confirmedTask) {
      setError(updateError?.message ?? "No pudimos confirmar el cambio en Supabase. Revisa permisos o intenta de nuevo.");
      setMessage(null);
      setIsSaving(false);
      return;
    }

    if (user) {
      await logActivity(supabase, {
        entityType: "task",
        entityId: taskId,
        action: "task_status_changed",
        metadata: { status: confirmedTask.status, due_date: confirmedTask.due_date, share_enabled: confirmedTask.share_enabled, confirmed_at: confirmedTask.updated_at },
      });
      await createClientNotification(supabase, {
        userId: user.id,
        title: "Estado de tarea actualizado",
        body: `La tarea cambió a ${confirmedTask.status}.`,
        kind: "info",
        entityType: "task",
        entityId: taskId,
      });
    }

    emitTaskUpdated(confirmedTask as Record<string, unknown> & { id: string }, "form");

    setCurrentStatus(confirmedTask.status ?? currentStatus);
    setCurrentDate(confirmedTask.due_date ?? "");
    setCurrentShare(Boolean(confirmedTask.share_enabled));
    onSaved?.({ status: confirmedTask.status ?? currentStatus, dueDate: confirmedTask.due_date ?? null, shareEnabled: Boolean(confirmedTask.share_enabled), shareToken: confirmedTask.share_token ?? null });
    setMessage("Cambios aplicados. La fecha límite se conserva salvo que la cambies manualmente.");
    setIsSaving(false);
    startRefresh(() => router.refresh());
  };

  const isBusy = isSaving || isRefreshing;

  return (
    <form className="h-full space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-all duration-200" onSubmit={handleSave}>
      <div>
        <p className="text-sm font-medium text-slate-800">Actualizar seguimiento</p>
        <p className="text-xs text-slate-500">Una tarea en espera queda en standby y no cuenta como vencida. La fecha solo cambia si la editas manualmente.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Select value={currentStatus} onChange={(event) => setCurrentStatus(event.target.value)} disabled={!canEdit || isBusy}>
          {TASK_STATUSES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </Select>
        <Input type="date" value={currentDate} onChange={(event) => setCurrentDate(event.target.value)} disabled={!canEdit || isBusy} />
      </div>
      <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
        <input type="checkbox" checked={currentShare} onChange={(event) => setCurrentShare(event.target.checked)} disabled={!canEdit || isBusy} />
        Compartir tarea por link
      </label>
      {!canEdit ? <p className="text-sm text-slate-500">Tu acceso actual permite seguimiento, pero no editar estado, fecha o link compartido.</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
      <Button loading={isBusy} disabled={!canEdit} type="submit">
        Guardar cambios
      </Button>
    </form>
  );
}
