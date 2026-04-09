export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { ActivityTimeline } from '@/components/activity/activity-timeline';
import { TaskDetailSummary } from '@/components/tasks/task-detail-summary';
import { TaskComments } from '@/components/tasks/task-comments';
import { TaskOperationsCard } from '@/components/tasks/task-operations-card';
import { EntityAttachments } from '@/components/attachments/entity-attachments';
import { TaskPermissionBadge } from '@/components/tasks/task-permission-badge';
import { getAssignableUsers, getTaskAssignees, getTaskById, getTaskComments } from '@/lib/queries/tasks';
import { getTaskAttachments } from '@/lib/queries/attachments';
import { getTaskActivity } from '@/lib/queries/activity';
import { getTaskAccessSummary } from '@/lib/queries/access-summary';
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

  const [task, comments, assignableUsers, assignees, attachments, activity, access] = await Promise.all([
    safeServerCall('getTaskById', () => getTaskById(id), null),
    safeServerCall('getTaskComments', () => getTaskComments(id), []),
    safeServerCall('getAssignableUsers', () => getAssignableUsers(id), []),
    safeServerCall('getTaskAssignees', () => getTaskAssignees(id), []),
    safeServerCall('getTaskAttachments', () => getTaskAttachments(id), []),
    safeServerCall('getTaskActivity', () => getTaskActivity(id), []),
    safeServerCall('getTaskAccessSummary', () => getTaskAccessSummary(id), { role: null, projectMemberRole: null, isAssignee: false, canEdit: false, canManageAssignees: false, canComment: false, canUploadAttachments: false, canShare: false, canViewActivity: false }),
  ]);

  if (!task) notFound();

  return (
    <div className="space-y-4">
      <TaskDetailSummary task={task} currentQuery={queryString} />
      <TaskPermissionBadge canEdit={access.canEdit} canManage={access.canManageAssignees} canShare={access.canShare} />
      <TaskOperationsCard
        taskId={task.id}
        status={task.status}
        dueDate={task.due_date}
        shareEnabled={task.share_enabled}
        shareToken={task.share_token}
        canEdit={access.canEdit}
        canManageAssignees={access.canManageAssignees}
        canShare={access.canShare}
        assignableUsers={assignableUsers}
        assignees={assignees}
      />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(340px,0.7fr)]">
        <div className="space-y-4">
          <TaskComments taskId={task.id} comments={comments} canComment={access.canComment} />
          {access.canViewActivity ? <ActivityTimeline items={activity} title="Bitácora de la tarea" description="Seguimiento de estado, responsables, comentarios y adjuntos." compact defaultVisibleCount={3} expandLabel="Ver más movimientos" collapseLabel="Ver menos movimientos" /> : null}
        </div>
        <div className="space-y-4">
          <EntityAttachments entityType="task" entityId={task.id} attachments={attachments} canManage={access.canUploadAttachments} />
        </div>
      </div>
    </div>
  );
}
