export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { ActivityTimeline } from '@/components/activity/activity-timeline';
import { TaskDetailSummary } from '@/components/tasks/task-detail-summary';
import { TaskStatusForm } from '@/components/tasks/task-status-form';
import { TaskSharePanel } from '@/components/tasks/task-share-panel';
import { TaskComments } from '@/components/tasks/task-comments';
import { TaskAssigneesPanel } from '@/components/tasks/task-assignees-panel';
import { EntityAttachments } from '@/components/attachments/entity-attachments';
import { Card } from '@/components/ui/card';
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
      <div className="space-y-4">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
          <EntityAttachments entityType="task" entityId={task.id} attachments={attachments} canManage={access.canUploadAttachments} />
          <Card className="rounded-[24px] border border-slate-200/90 bg-white/[0.94] p-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Seguimiento operativo</p>
            <h3 className="mt-2 text-lg font-bold text-slate-900">Actualizar seguimiento, responsables y enlace compartido</h3>
            <p className="mt-1 text-sm text-slate-500">Todo el control de la tarea en un solo bloque, debajo del acceso operativo.</p>
            <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)_minmax(0,1fr)]">
              <TaskStatusForm taskId={task.id} status={task.status} dueDate={task.due_date} shareEnabled={task.share_enabled} shareToken={task.share_token} canEdit={access.canEdit} embedded />
              <TaskAssigneesPanel taskId={task.id} options={assignableUsers} assignees={assignees} canManage={access.canManageAssignees} embedded />
              {access.canShare ? <TaskSharePanel enabled={task.share_enabled} token={task.share_token} embedded /> : <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-4 text-sm text-slate-500">Sin acceso para compartir esta tarea.</div>}
            </div>
          </Card>
        </div>

        <TaskComments taskId={task.id} comments={comments} canComment={access.canComment} />
        {access.canViewActivity ? <ActivityTimeline items={activity} title="Bitácora de la tarea" description="Seguimiento de estado, responsables, comentarios y adjuntos." compact defaultVisibleCount={3} expandLabel="Ver más movimientos" collapseLabel="Ver menos movimientos" /> : null}
      </div>
    </div>
  );
}
