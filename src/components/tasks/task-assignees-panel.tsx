"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

interface UserOption {
  id: string;
  full_name?: string | null;
  email?: string | null;
}

export function TaskAssigneesPanel({
  taskId,
  options,
  assignees,
}: {
  taskId: string;
  options: UserOption[];
  assignees: Array<{ id: string; user_id: string; profiles?: UserOption | UserOption[] | null }>;
}) {
  const router = useRouter();
  const [selectedUserId, setSelectedUserId] = useState(options[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const currentIds = new Set(assignees.map((item) => item.user_id));

  const handleAssign = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (!selectedUserId) return;
    setIsSaving(true);

    const supabase = createClient();
    const { error: insertError } = await supabase.from("task_assignees").upsert(
      {
        task_id: taskId,
        user_id: selectedUserId,
      },
      { onConflict: "task_id,user_id" },
    );

    if (insertError) {
      setError(insertError.message);
      setIsSaving(false);
      return;
    }

    setIsSaving(false);
    router.refresh();
  };

  const handleRemove = async (assignmentId: string) => {
    setError(null);
    setRemovingId(assignmentId);
    const supabase = createClient();
    const { error: deleteError } = await supabase.from("task_assignees").delete().eq("id", assignmentId);

    if (deleteError) {
      setError(deleteError.message);
      setRemovingId(null);
      return;
    }

    setRemovingId(null);
    router.refresh();
  };

  return (
    <div className="space-y-4 rounded-[24px] bg-white p-5 shadow-soft">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">Responsables</h3>
        <p className="text-sm text-slate-500">Asigna personas relacionadas al proyecto para seguimiento.</p>
      </div>

      <div className="space-y-3">
        {assignees.length ? assignees.map((item) => {
          const profile = Array.isArray(item.profiles) ? item.profiles[0] : item.profiles;
          return (
            <div key={item.id} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <div>
                <p className="font-medium text-slate-900">{profile?.full_name || profile?.email || "Usuario"}</p>
                <p>{profile?.email || "Sin correo"}</p>
              </div>
              <Button type="button" variant="secondary" onClick={() => handleRemove(item.id)} disabled={removingId === item.id}>
                {removingId === item.id ? "Quitando..." : "Quitar"}
              </Button>
            </div>
          );
        }) : <p className="text-sm text-slate-500">Todavía no hay responsables asignados.</p>}
      </div>

      <form className="space-y-3 rounded-2xl border border-slate-200 p-4" onSubmit={handleAssign}>
        <p className="text-sm font-medium text-slate-800">Asignar responsable</p>
        <Select value={selectedUserId} onChange={(event) => setSelectedUserId(event.target.value)}>
          {options.map((option) => (
            <option key={option.id} value={option.id} disabled={currentIds.has(option.id)}>
              {(option.full_name || option.email) + (currentIds.has(option.id) ? " — ya asignado" : "")}
            </option>
          ))}
        </Select>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button disabled={isSaving || !selectedUserId} type="submit">
          {isSaving ? "Guardando..." : "Asignar"}
        </Button>
      </form>
    </div>
  );
}
