export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { ActivityTimeline } from '@/components/activity/activity-timeline';
import { TaskDetailSummary } from '@/components/tasks/task-detail-summary';
import { TaskStatusForm } from '@/components/tasks/task-status-form';
import { TaskSharePanel } from '@/components/tasks/task-share-panel';
import { TaskComments } from '@/components/tasks/task-comments';
import { TaskAssigneesPanel } from '@/components/tasks/task-assignees-panel';
import { EntityAttachments } from '@/components/attachments/entity-attachments';
import { getAssignableUsers, getTaskAssignees, getTaskById, getTaskComments } from '@/lib/queries/tasks';
import { getTaskAttachments } from '@/lib/queries/attachments';
import { getTaskActivity } from '@/lib/queries/activity';
import { safeServerCall } from '@/lib/runtime/safe-server';

export default async function TaskDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const search = (await searchParams) ?? {};
  const queryString = new URLSearchParams(
    Object.entries(search).flatMap(([key, value]) => typeof value === 'string' && value ? [[key, value]] : [])
  ).toString();

  const [task, comments, assignableUsers, assignees, attachments, activity] = await Promise.all([
    safeServerCall('getTaskById', () => getTaskById(id), null),
    safeServerCall('getTaskComments', () => getTaskComments(id), []),
    safeServerCall('getAssignableUsers', () => getAssignableUsers(id), []),
    safeServerCall('getTaskAssignees', () => getTaskAssignees(id), []),
    safeServerCall('getTaskAttachments', () => getTaskAttachments(id), []),
    safeServerCall('getTaskActivity', () => getTaskActivity(id), []),
  ]);

  if (!task) notFound();

  return (
    <div className="space-y-4">
      <TaskDetailSummary task={task} currentQuery={queryString} />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-4">
          <TaskComments taskId={task.id} comments={comments} />
          <EntityAttachments entityType="task" entityId={task.id} attachments={attachments} />
          <ActivityTimeline items={activity} title="Bitácora de la tarea" description="Seguimiento de estado, responsables, comentarios y adjuntos." compact />
        </div>
        <div className="space-y-4">
          <TaskStatusForm taskId={task.id} status={task.status} dueDate={task.due_date} shareEnabled={task.share_enabled} shareToken={task.share_token} />
          <TaskAssigneesPanel taskId={task.id} options={assignableUsers} assignees={assignees} />
          <TaskSharePanel enabled={task.share_enabled} token={task.share_token} />
        </div>
      </div>
    </div>
  );
}
