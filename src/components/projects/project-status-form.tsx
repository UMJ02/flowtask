"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PROJECT_STATUSES } from "@/lib/constants/project-status";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { logActivity } from "@/lib/activity/log-client";
import { createClientNotification } from "@/lib/notifications/create-client-notification";

interface ProjectStatusFormProps {
  projectId: string;
  status: string;
  dueDate: string | null;
  shareEnabled: boolean;
  shareToken: string | null;
  canEdit?: boolean;
  embedded?: boolean;
}

export function ProjectStatusForm({ projectId, status, dueDate, shareEnabled, shareToken, canEdit = true, embedded = false }: ProjectStatusFormProps) {
  const router = useRouter();
  const [currentStatus, setCurrentStatus] = useState(status);
  const [currentDate, setCurrentDate] = useState(dueDate?.slice(0, 10) ?? "");
  const [currentShare, setCurrentShare] = useState(shareEnabled);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canEdit) return;
    setError(null);
    setMessage(null);
    setIsSaving(true);

    const supabase = createClient();
    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;

    const { error: updateError } = await supabase
      .from("projects")
      .update({
        status: currentStatus,
        due_date: currentDate || null,
        share_enabled: currentShare,
        share_token: currentShare ? shareToken : null,
      })
      .eq("id", projectId);

    if (updateError) {
      setError(updateError.message);
      setIsSaving(false);
      return;
    }

    if (user) {
      await logActivity(supabase, {
        entityType: "project",
        entityId: projectId,
        action: "project_status_changed",
        metadata: { status: currentStatus },
      });
      await createClientNotification(supabase, {
        userId: user.id,
        title: "Proyecto actualizado",
        body: `El proyecto cambió a ${currentStatus}.`,
        kind: "info",
        entityType: "project",
        entityId: projectId,
      });
    }

    setMessage("Proyecto actualizado.");
    setIsSaving(false);
    router.refresh();
  };

  const shellClassName = embedded ? "space-y-3" : "space-y-3 rounded-2xl bg-slate-50 p-4";

  return (
    <form className={shellClassName} onSubmit={handleSave}>
      <div>
        <p className="text-sm font-medium text-slate-800">Actualizar proyecto</p>
        <p className="text-xs text-slate-500">Controla estado, deadline y visibilidad pública.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Select value={currentStatus} onChange={(event) => setCurrentStatus(event.target.value)} disabled={!canEdit || isSaving}>
          {PROJECT_STATUSES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </Select>
        <Input type="date" value={currentDate} onChange={(event) => setCurrentDate(event.target.value)} disabled={!canEdit || isSaving} />
      </div>
      <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
        <input type="checkbox" checked={currentShare} onChange={(event) => setCurrentShare(event.target.checked)} disabled={!canEdit || isSaving} />
        Compartir proyecto por link
      </label>
      {!canEdit ? <p className="text-sm text-slate-500">Tu acceso actual permite consultar el proyecto, pero no modificar estado, fecha o enlace compartido.</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
      <Button disabled={!canEdit || isSaving} type="submit">
        {isSaving ? "Guardando..." : "Guardar cambios"}
      </Button>
    </form>
  );
}
