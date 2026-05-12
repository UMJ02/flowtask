"use client";

import { useEffect, useState } from "react";
import { TaskAssigneesPanel } from "@/components/tasks/task-assignees-panel";
import { TaskSharePanel } from "@/components/tasks/task-share-panel";
import { TaskStatusForm } from "@/components/tasks/task-status-form";

type UserOption = {
  id: string;
  full_name?: string | null;
  email?: string | null;
};

type AssigneeItem = { id: string; user_id: string; profiles?: UserOption | UserOption[] | null };

export function TaskOperationalPanel({
  taskId,
  status,
  dueDate,
  shareEnabled,
  shareToken,
  options,
  assignees,
  canEdit,
  canManageAssignees,
  canShare,
}: {
  taskId: string;
  status: string;
  dueDate?: string | null;
  shareEnabled: boolean;
  shareToken: string | null;
  options: UserOption[];
  assignees: AssigneeItem[];
  canEdit: boolean;
  canManageAssignees: boolean;
  canShare: boolean;
}) {
  const [statusState, setStatusState] = useState({ status, dueDate: dueDate ?? null, shareEnabled, shareToken });
  const [assigneeState, setAssigneeState] = useState<AssigneeItem[]>(assignees);

  useEffect(() => {
    setStatusState({ status, dueDate: dueDate ?? null, shareEnabled, shareToken });
  }, [status, dueDate, shareEnabled, shareToken]);

  useEffect(() => {
    setAssigneeState(assignees);
  }, [assignees]);

  return (
    <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)_minmax(0,0.9fr)]">
      <TaskStatusForm
        taskId={taskId}
        status={statusState.status}
        dueDate={statusState.dueDate}
        shareEnabled={statusState.shareEnabled}
        shareToken={statusState.shareToken}
        canEdit={canEdit}
        onSaved={(next) => setStatusState(next)}
      />
      <TaskAssigneesPanel taskId={taskId} options={options} assignees={assigneeState} canManage={canManageAssignees} onChange={setAssigneeState} />
      {canShare ? <TaskSharePanel enabled={statusState.shareEnabled} token={statusState.shareToken} /> : <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-4 text-sm text-slate-500">Sin acceso para compartir esta tarea.</div>}
    </div>
  );
}
