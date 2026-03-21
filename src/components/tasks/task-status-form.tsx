"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { TASK_STATUSES } from "@/lib/constants/task-status";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

interface TaskStatusFormProps {
  taskId: string;
  status: string;
  dueDate: string | null;
  shareEnabled: boolean;
  shareToken: string | null;
}

export function TaskStatusForm({ taskId, status, dueDate, shareEnabled, shareToken }: TaskStatusFormProps) {
  const router = useRouter();
  const [currentStatus, setCurrentStatus] = useState(status);
  const [currentDate, setCurrentDate] = useState(dueDate?.slice(0, 10) ?? "");
  const [currentShare, setCurrentShare] = useState(shareEnabled);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsSaving(true);

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("tasks")
      .update({
        status: currentStatus,
        due_date: currentDate || null,
        share_enabled: currentShare,
        share_token: currentShare ? shareToken : null,
      })
      .eq("id", taskId);

    if (updateError) {
      setError(updateError.message);
      setIsSaving(false);
      return;
    }

    setMessage("Cambios guardados.");
    setIsSaving(false);
    router.refresh();
  };

  return (
    <form className="space-y-3 rounded-2xl bg-slate-50 p-4" onSubmit={handleSave}>
      <div>
        <p className="text-sm font-medium text-slate-800">Actualizar seguimiento</p>
        <p className="text-xs text-slate-500">Cambia estado, deadline y visibilidad compartida.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Select value={currentStatus} onChange={(event) => setCurrentStatus(event.target.value)}>
          {TASK_STATUSES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </Select>
        <Input type="date" value={currentDate} onChange={(event) => setCurrentDate(event.target.value)} />
      </div>
      <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
        <input type="checkbox" checked={currentShare} onChange={(event) => setCurrentShare(event.target.checked)} />
        Compartir tarea por link
      </label>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
      <Button disabled={isSaving} type="submit">
        {isSaving ? "Guardando..." : "Guardar cambios"}
      </Button>
    </form>
  );
}
