import { notFound } from "next/navigation";
import { TaskAssigneesPanel } from "@/components/tasks/task-assignees-panel";
import { EntityAttachments } from "@/components/attachments/entity-attachments";
import { TaskCommentsLive } from "@/components/tasks/task-comments-live";
import { TaskDetailSummary } from "@/components/tasks/task-detail-summary";
import { TaskSharePanel } from "@/components/tasks/task-share-panel";
import { TaskStatusForm } from "@/components/tasks/task-status-form";
import {
  getAssignableUsers,
  getTaskAssignees,
  getTaskById,
  getTaskComments,
} from "@/lib/queries/tasks";
import { getTaskAttachments } from "@/lib/queries/attachments";

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [task, comments, options, assignees, attachments] = await Promise.all([
    getTaskById(id),
    getTaskComments(id),
    getAssignableUsers(id),
    getTaskAssignees(id),
    getTaskAttachments(id),
  ]);

  if (!task) notFound();

  return (
    <div className="space-y-4">
      <TaskDetailSummary task={task} />
      <div className="grid gap-4 lg:grid-cols-2">
        <TaskStatusForm
          taskId={task.id}
          status={task.status}
          dueDate={task.due_date}
          shareEnabled={task.share_enabled}
          shareToken={task.share_token}
        />
        <TaskSharePanel enabled={task.share_enabled} token={task.share_token} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <TaskAssigneesPanel taskId={task.id} options={options} assignees={assignees} />
        <TaskCommentsLive taskId={task.id} comments={comments} />
      </div>
      <EntityAttachments entityType="task" entityId={task.id} attachments={attachments} />
    </div>
  );
}
