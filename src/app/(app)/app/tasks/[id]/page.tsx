export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { ActivityTimeline } from '@/components/activity/activity-timeline';
import { TaskDetailSummary } from '@/components/tasks/task-detail-summary';
import { TaskStatusForm } from '@/components/tasks/task-status-form';
import { TaskSharePanel } from '@/components/tasks/task-share-panel';
import { TaskComments } from '@/components/tasks/task-comments';
import { TaskAssigneesPanel } from '@/components/tasks/task-assignees-panel';
import { EntityAttachments } from '@/components/attachments/entity-attachments';
import { AccessSummaryCard } from '@/components/security/access-summary-card';
import { getAssignableUsers, getTaskAssignees, getTaskById, getTaskComments } from '@/lib/queries/tasks';
import { getTaskAttachments } from '@/lib/queries/attachments';
import { getTaskActivity } from '@/lib/queries/activity';
import { getTaskAccessSummary } from '@/lib/queries/access-summary';
import { safeServerCall } from '@/lib/runtime/safe-server';
import { formatOrganizationRole } from '@/lib/organization/labels';

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
      <AccessSummaryCard
        title="Permisos visibles de la tarea"
        description="La UI ya muestra qué acciones puedes ejecutar en esta tarea según rol organizacional, asignación y acceso efectivo por cliente."
        roleLabel={access.projectMemberRole ? `Proyecto: ${access.projectMemberRole}` : access.role ? `Org: ${formatOrganizationRole(access.role)}` : 'Sin organización activa'}
        items={[
          { label: 'Editar tarea', enabled: access.canEdit },
          { label: 'Gestionar responsables', enabled: access.canManageAssignees },
          { label: 'Comentar', enabled: access.canComment },
          { label: 'Subir adjuntos', enabled: access.canUploadAttachments },
          { label: 'Compartir por link', enabled: access.canShare },
        ]}
        compact
      />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-4">
          <TaskComments taskId={task.id} comments={comments} canComment={access.canComment} />
          <EntityAttachments entityType="task" entityId={task.id} attachments={attachments} canManage={access.canUploadAttachments} />
          {access.canViewActivity ? <ActivityTimeline items={activity} title="Bitácora de la tarea" description="Seguimiento de estado, responsables, comentarios y adjuntos." compact /> : null}
        </div>
        <div className="space-y-4">
          <TaskStatusForm taskId={task.id} status={task.status} dueDate={task.due_date} shareEnabled={task.share_enabled} shareToken={task.share_token} canEdit={access.canEdit} />
          <TaskAssigneesPanel taskId={task.id} options={assignableUsers} assignees={assignees} canManage={access.canManageAssignees} />
          {access.canShare ? <TaskSharePanel enabled={task.share_enabled} token={task.share_token} /> : null}
        </div>
      </div>
    </div>
  );
}
