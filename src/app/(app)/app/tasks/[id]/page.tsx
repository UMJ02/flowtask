import { notFound } from 'next/navigation';
import { TaskDetailSummary } from '@/components/tasks/task-detail-summary';
import { TaskStatusForm } from '@/components/tasks/task-status-form';
import { TaskAssigneesPanel } from '@/components/tasks/task-assignees-panel';
import { TaskSharePanel } from '@/components/tasks/task-share-panel';
import { TaskComments } from '@/components/tasks/task-comments';
import { TaskCommentsLive } from '@/components/tasks/task-comments-live';
import { EntityAttachments } from '@/components/attachments/entity-attachments';
import { ActivityTimeline } from '@/components/activity/activity-timeline';
import { Card } from '@/components/ui/card';
import { safeServerCall } from '@/lib/runtime/safe-server';
import { getTaskById, getTaskComments, getTaskAssignees, getAssignableUsers } from '@/lib/queries/tasks';
import { getTaskAttachments } from '@/lib/queries/attachments';
import { getTaskActivity } from '@/lib/queries/activity';

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const task = await safeServerCall('getTaskById', () => getTaskById(id), null);
  if (!task) notFound();

  const [comments, assignees, assignableUsers, attachments, activity] = await Promise.all([
    safeServerCall('getTaskComments', () => getTaskComments(id), []),
    safeServerCall('getTaskAssignees', () => getTaskAssignees(id), []),
    safeServerCall('getAssignableUsers', () => getAssignableUsers(id), []),
    safeServerCall('getTaskAttachments', () => getTaskAttachments(id), []),
    safeServerCall('getTaskActivity', () => getTaskActivity(id), []),
  ]);

  return (
    <div className="space-y-4">
      <TaskDetailSummary task={task} />
      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <TaskComments taskId={id} comments={comments} />
          <TaskCommentsLive taskId={id} comments={comments} />
          <EntityAttachments entityType="task" entityId={id} attachments={attachments} />
          <ActivityTimeline items={activity} />
        </div>
        <div className="space-y-4">
          <TaskStatusForm taskId={id} status={task.status} dueDate={task.due_date} shareEnabled={task.share_enabled} shareToken={task.share_token} />
          <TaskAssigneesPanel taskId={id} assignees={assignees} options={assignableUsers} />
          <TaskSharePanel enabled={task.share_enabled} token={task.share_token} />
          <Card>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Resumen</p>
            <p className="mt-2 text-sm text-slate-600">Todo el detalle clave de la tarea quedó reunido en un solo lugar para evitar saltos entre módulos.</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
