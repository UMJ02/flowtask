"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { TASK_STATUSES } from "@/lib/constants/task-status";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { logActivity } from "@/lib/activity/log-client";
import { buildTaskStatusUpdate, shouldRefreshDueDateForStatus, todayIsoDate } from "@/lib/tasks/status-rules";
import { createClientNotification } from "@/lib/notifications/create-client-notification";

interface TaskStatusFormProps {
  taskId: string;
  status: string;
  dueDate: string | null;
  shareEnabled: boolean;
  shareToken: string | null;
  canEdit?: boolean;
  compact?: boolean;
}

export function TaskStatusForm({ taskId, status, dueDate, shareEnabled, shareToken, canEdit = true, compact = false }: TaskStatusFormProps) {
  const router = useRouter();
  const [currentStatus, setCurrentStatus] = useState(status);
  const [currentDate, setCurrentDate] = useState(dueDate?.slice(0, 10) ?? "");
  const [currentShare, setCurrentShare] = useState(shareEnabled);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, startRefresh] = useTransition();

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canEdit) return;
    setError(null);
    setMessage("Aplicando cambios…");
    setIsSaving(true);

    const supabase = createClient();
    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;

    const normalizedDate = shouldRefreshDueDateForStatus(currentStatus) ? todayIsoDate() : currentDate || null;

    const { error: updateError } = await supabase
      .from("tasks")
      .update({
        ...buildTaskStatusUpdate(currentStatus, normalizedDate),
        share_enabled: currentShare,
        share_token: currentShare ? shareToken : null,
      })
      .eq("id", taskId);

    if (updateError) {
      setError(updateError.message);
      setMessage(null);
      setIsSaving(false);
      return;
    }

    if (user) {
      await logActivity(supabase, {
        entityType: "task",
        entityId: taskId,
        action: "task_status_changed",
        metadata: { status: currentStatus },
      });
      await createClientNotification(supabase, {
        userId: user.id,
        title: "Estado de tarea actualizado",
        body: `La tarea cambió a ${currentStatus}.`,
        kind: "info",
        entityType: "task",
        entityId: taskId,
      });
    }

    setCurrentDate(normalizedDate ?? "");
    setMessage(currentStatus === "en_espera" ? "Cambios aplicados. La tarea en espera no contará como atrasada." : "Cambios aplicados.");
    setIsSaving(false);
    startRefresh(() => router.refresh());
  };

  const isBusy = isSaving || isRefreshing;

  return (
    <form className={`space-y-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 transition-all duration-200 ${compact ? "h-full" : ""}`} onSubmit={handleSave}>
      <div>
        <p className="text-sm font-medium text-slate-800">Actualizar seguimiento</p>
        <p className="text-xs text-slate-500">Cambia estado, deadline y visibilidad compartida. Al volver a en proceso o concluida, la fecha se ajusta al día del cambio.</p>
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
