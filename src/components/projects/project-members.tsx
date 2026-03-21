"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProjectInviteForm } from "@/components/collaboration/project-invite-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils/dates";

export function ProjectMembers({ projectId, members }: { projectId: string; members: any[] }) {
  const router = useRouter();
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRemove = async (memberId: string) => {
    setError(null);
    setRemovingId(memberId);
    const supabase = createClient();
    const { error: deleteError } = await supabase.from("project_members").delete().eq("id", memberId);

    if (deleteError) {
      setError(deleteError.message);
      setRemovingId(null);
      return;
    }

    setRemovingId(null);
    router.refresh();
  };

  return (
    <Card>
      <h3 className="text-lg font-semibold text-slate-900">Miembros del proyecto</h3>
      <p className="mt-1 text-sm text-slate-500">Solo ven el proyecto compartido, no el tablero personal.</p>
      <div className="mt-4 space-y-3">
        {members.length ? members.map((member) => {
          const profile = Array.isArray(member.profiles) ? member.profiles[0] : member.profiles;
          return (
            <div key={member.id} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <div>
                <p className="font-medium text-slate-900">{profile?.full_name || profile?.email || "Usuario"}</p>
                <p>{profile?.email || "Sin correo"}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">{member.role}</p>
                <p className="mt-1 text-xs text-slate-500">Desde {formatDate(member.created_at)}</p>
              </div>
              {member.role !== "owner" ? (
                <Button type="button" variant="secondary" onClick={() => handleRemove(member.id)} disabled={removingId === member.id}>
                  {removingId === member.id ? "Quitando..." : "Quitar"}
                </Button>
              ) : null}
            </div>
          );
        }) : <p className="text-sm text-slate-500">Todavía no hay colaboradores agregados.</p>}
      </div>
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      <div className="mt-4">
        <ProjectInviteForm projectId={projectId} />
      </div>
    </Card>
  );
}
