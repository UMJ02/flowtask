"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { logActivity } from "@/lib/activity/log-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export function ProjectInviteForm({ projectId, canManage = true }: { projectId: string; canManage?: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("editor");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleInvite = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canManage) return;
    setMessage(null);
    setError(null);
    setIsSaving(true);
    const supabase = createClient();

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id,email,full_name")
      .ilike("email", email.trim())
      .single();

    if (profileError || !profile) {
      setError("No existe un usuario registrado con ese correo.");
      setIsSaving(false);
      return;
    }

    const { data: upserted, error: insertError } = await supabase.from("project_members").upsert(
      {
        project_id: projectId,
        user_id: profile.id,
        role,
      },
      { onConflict: "project_id,user_id" },
    ).select('id').single();

    if (insertError) {
      setError(insertError.message);
      setIsSaving(false);
      return;
    }

    if (upserted?.id) {
      await logActivity(supabase as any, { entityType: 'project_member' as any, entityId: upserted.id, action: 'project_member_added', metadata: { project_id: projectId, email: profile.email, role } });
    }

    setMessage(`Colaborador agregado: ${profile.full_name || profile.email}`);
    setEmail("");
    setRole("editor");
    setIsSaving(false);
    router.refresh();
  };

  return (
    <form className="space-y-3 rounded-2xl bg-slate-50 p-4" onSubmit={handleInvite}>
      <div>
        <p className="text-sm font-medium text-slate-800">Invitar colaborador</p>
        <p className="text-xs text-slate-500">El tablero principal sigue siendo privado. Solo verá este proyecto.</p>
      </div>
      <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="correo@empresa.com" required disabled={!canManage || isSaving} />
      <Select value={role} onChange={(event) => setRole(event.target.value)} disabled={!canManage || isSaving}>
        <option value="viewer">Viewer</option>
        <option value="editor">Editor</option>
        <option value="owner">Owner</option>
      </Select>
      {!canManage ? <p className="text-sm text-slate-500">Tu acceso actual no permite invitar colaboradores a este proyecto.</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
      <Button disabled={!canManage || isSaving} type="submit">
        {isSaving ? "Agregando..." : "Agregar al proyecto"}
      </Button>
    </form>
  );
}
