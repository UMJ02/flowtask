"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

interface ReminderFormProps {
  tasks: Array<{ id: string; title: string }>;
  projects: Array<{ id: string; title: string }>;
}

export function ReminderForm({ tasks, projects }: ReminderFormProps) {
  const router = useRouter();
  const [entityType, setEntityType] = useState<"task" | "project">("task");
  const [entityId, setEntityId] = useState("");
  const [remindAt, setRemindAt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const options = entityType === "task" ? tasks : projects;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSaving(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Sesión no válida.");
      setIsSaving(false);
      return;
    }

    const payload = {
      user_id: user.id,
      remind_at: new Date(remindAt).toISOString(),
      task_id: entityType === "task" ? entityId : null,
      project_id: entityType === "project" ? entityId : null,
    };

    const { error: insertError } = await supabase.from("reminders").insert(payload);

    if (insertError) {
      setError(insertError.message);
      setIsSaving(false);
      return;
    }

    setEntityId("");
    setRemindAt("");
    setIsSaving(false);
    router.refresh();
  };

  return (
    <form className="space-y-4 rounded-[24px] bg-white p-5 shadow-soft" onSubmit={handleSubmit}>
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Nuevo recordatorio</h2>
        <p className="mt-1 text-sm text-slate-500">Programa un aviso para una tarea o proyecto.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Tipo</label>
          <Select value={entityType} onChange={(e) => { setEntityType(e.target.value as "task" | "project"); setEntityId(""); }}>
            <option value="task">Tarea</option>
            <option value="project">Proyecto</option>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Elemento</label>
          <Select required value={entityId} onChange={(e) => setEntityId(e.target.value)}>
            <option value="">Seleccionar</option>
            {options.map((item) => (
              <option key={item.id} value={item.id}>{item.title}</option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Fecha y hora</label>
          <Input required type="datetime-local" value={remindAt} onChange={(e) => setRemindAt(e.target.value)} />
        </div>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button disabled={isSaving || !entityId || !remindAt} type="submit">
        {isSaving ? "Guardando..." : "Guardar recordatorio"}
      </Button>
    </form>
  );
}
