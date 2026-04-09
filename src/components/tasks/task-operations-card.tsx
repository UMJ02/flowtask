"use client";

import { Card } from "@/components/ui/card";
import { TaskAssigneesPanel } from "@/components/tasks/task-assignees-panel";
import { TaskSharePanel } from "@/components/tasks/task-share-panel";
import { TaskStatusForm } from "@/components/tasks/task-status-form";

export function TaskOperationsCard({
  taskId,
  status,
  dueDate,
  shareEnabled,
  shareToken,
  canEdit,
  canManageAssignees,
  canShare,
  assignableUsers,
  assignees,
}: {
  taskId: string;
  status: string;
  dueDate: string | null;
  shareEnabled: boolean;
  shareToken: string | null;
  canEdit: boolean;
  canManageAssignees: boolean;
  canShare: boolean;
  assignableUsers: Array<{ id: string; full_name?: string | null; email?: string | null }>;
  assignees: any[];
}) {
  return (
    <Card className="rounded-[28px] border border-slate-200/90 bg-white/[0.95] p-4 md:p-5">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)_minmax(0,0.9fr)]">
        <TaskStatusForm taskId={taskId} status={status} dueDate={dueDate} shareEnabled={shareEnabled} shareToken={shareToken} canEdit={canEdit} embedded />
        <TaskAssigneesPanel taskId={taskId} options={assignableUsers} assignees={assignees} canManage={canManageAssignees} embedded />
        {canShare ? <TaskSharePanel enabled={shareEnabled} token={shareToken} embedded /> : <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">El enlace compartido se activa cuando tu acceso lo permite.</div>}
      </div>
    </Card>
  );
}
