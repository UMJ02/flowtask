"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProjectInviteForm } from "@/components/collaboration/project-invite-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { logActivity } from "@/lib/activity/log-client";
import { formatDate } from "@/lib/utils/dates";

const ROLE_OPTIONS = [
  { value: "editor", label: "Editor" },
  { value: "viewer", label: "Viewer" },
] as const;

export function ProjectMembers({ projectId, members, canManage = true, embedded = false }: { projectId: string; members: any[]; canManage?: boolean; embedded?: boolean }) {
  const router = useRouter();
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRemove = async (memberId: string) => {
    if (!canManage) return;
    setError(null);
    setRemovingId(memberId);
    const supabase = createClient();
    const currentMember = members.find((member) => member.id === memberId) ?? null;
    const { error: deleteError } = await supabase.from("project_members").delete().eq("id", memberId);

    if (deleteError) {
      setError(deleteError.message);
      setRemovingId(null);
      return;
    }

    await logActivity(supabase as any, { entityType: 'project_member' as any, entityId: memberId, action: 'project_member_removed', metadata: { project_id: projectId, role: currentMember?.role ?? undefined } });
    setRemovingId(null);
    router.refresh();
  };

  const handleRoleChange = async (memberId: string, role: string) => {
    if (!canManage) return;
    setError(null);
    setUpdatingId(memberId);
    const supabase = createClient();
    const currentMember = members.find((member) => member.id === memberId) ?? null;
    const { error: updateError } = await supabase.from("project_members").update({ role }).eq("id", memberId);

    if (updateError) {
      setError(updateError.message);
      setUpdatingId(null);
      return;
    }

    await logActivity(supabase as any, { entityType: 'project_member' as any, entityId: memberId, action: 'project_member_updated', metadata: { project_id: projectId, previous_role: currentMember?.role ?? undefined, role } });
    setUpdatingId(null);
    router.refresh();
  };

  if (embedded) {
    return (
      <div>
        <h3 className="text-lg font-semibold text-slate-900">Responsables</h3>
        <p className="mt-1 text-sm text-slate-500">Asigna personas relacionadas al proyecto para seguimiento.</p>
        <div className="mt-4 space-y-3">
          {members.length ? members.map((member) => {
            const profile = Array.isArray(member.profiles) ? member.profiles[0] : member.profiles;
            const isOwner = member.role === "owner";
            return (
              <div key={member.id} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="font-medium text-slate-900">{profile?.full_name || profile?.email || "Usuario"}</p>
                    <p>{profile?.email || "Sin correo"}</p>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <select className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm" defaultValue={member.role} disabled={!canManage || isOwner || updatingId === member.id} onChange={(event) => handleRoleChange(member.id, event.target.value)}>
                      {isOwner ? <option value="owner">Owner</option> : null}
                      {ROLE_OPTIONS.map((option) => (<option key={option.value} value={option.value}>{option.label}</option>))}
                    </select>
                    {!isOwner ? <Button type="button" variant="secondary" onClick={() => handleRemove(member.id)} disabled={!canManage || removingId === member.id || updatingId === member.id}>{removingId === member.id ? "Quitando..." : "Quitar"}</Button> : null}
                  </div>
                </div>
              </div>
            );
          }) : <p className="text-sm text-slate-500">Todavía no hay colaboradores agregados.</p>}
        </div>
        {!canManage ? <p className="mt-3 text-sm text-slate-500">Tu acceso actual es de seguimiento. La gestión de miembros está bloqueada en esta vista.</p> : null}
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        <div className="mt-4">
          <ProjectInviteForm projectId={projectId} canManage={canManage} />
        </div>
      </div>
    );
  }

  return (
    <Card>
      <h3 className="text-lg font-semibold text-slate-900">Miembros del proyecto</h3>
      <p className="mt-1 text-sm text-slate-500">Owner, editor y viewer para controlar mejor quién edita y quién solo revisa.</p>
      <div className="mt-4 space-y-3">
        {members.length ? members.map((member) => {
          const profile = Array.isArray(member.profiles) ? member.profiles[0] : member.profiles;
          const isOwner = member.role === "owner";
          return (
            <div key={member.id} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="font-medium text-slate-900">{profile?.full_name || profile?.email || "Usuario"}</p>
                  <p>{profile?.email || "Sin correo"}</p>
                  <p className="mt-1 text-xs text-slate-500">Desde {formatDate(member.created_at)}</p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <select
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                    defaultValue={member.role}
                    disabled={!canManage || isOwner || updatingId === member.id}
                    onChange={(event) => handleRoleChange(member.id, event.target.value)}
                  >
                    {isOwner ? <option value="owner">Owner</option> : null}
                    {ROLE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  {!isOwner ? (
                    <Button type="button" variant="secondary" onClick={() => handleRemove(member.id)} disabled={!canManage || removingId === member.id || updatingId === member.id}>
                      {removingId === member.id ? "Quitando..." : "Quitar"}
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          );
        }) : <p className="text-sm text-slate-500">Todavía no hay colaboradores agregados.</p>}
      </div>
      {!canManage ? <p className="mt-3 text-sm text-slate-500">Tu acceso actual es de seguimiento. La gestión de miembros está bloqueada en esta vista.</p> : null}
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      <div className="mt-4">
        <ProjectInviteForm projectId={projectId} canManage={canManage} />
      </div>
    </Card>
  );
}
