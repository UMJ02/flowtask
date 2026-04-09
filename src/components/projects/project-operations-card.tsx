"use client";

import { Card } from "@/components/ui/card";
import { ProjectMembers } from "@/components/projects/project-members";
import { ProjectSharePanel } from "@/components/projects/project-share-panel";
import { ProjectStatusForm } from "@/components/projects/project-status-form";

export function ProjectOperationsCard({
  projectId, status, dueDate, shareEnabled, shareToken, canEdit, canManageMembers, canShare, members,
}: {
  projectId: string;
  status: string;
  dueDate: string | null;
  shareEnabled: boolean;
  shareToken: string | null;
  canEdit: boolean;
  canManageMembers: boolean;
  canShare: boolean;
  members: any[];
}) {
  return (
    <Card className="rounded-[28px] border border-slate-200/90 bg-white/[0.95] p-4 md:p-5">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.9fr)]">
        <ProjectStatusForm projectId={projectId} status={status} dueDate={dueDate} shareEnabled={shareEnabled} shareToken={shareToken} canEdit={canEdit} embedded />
        <ProjectMembers projectId={projectId} members={members} canManage={canManageMembers} embedded />
        {canShare ? <ProjectSharePanel enabled={shareEnabled} token={shareToken} embedded /> : <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">El enlace compartido se activa cuando tu acceso lo permite.</div>}
      </div>
    </Card>
  );
}
