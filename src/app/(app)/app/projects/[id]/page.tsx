export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ActivityTimeline } from '@/components/activity/activity-timeline';
import { ProjectDetailSummary } from '@/components/projects/project-detail-summary';
import { ProjectStatusForm } from '@/components/projects/project-status-form';
import { ProjectTaskList } from '@/components/projects/project-task-list';
import { ProjectComments } from '@/components/projects/project-comments';
import { ProjectMembers } from '@/components/projects/project-members';
import { ProjectSharePanel } from '@/components/projects/project-share-panel';
import { EntityAttachments } from '@/components/attachments/entity-attachments';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getProjectById, getProjectComments, getProjectMembers, getProjectTasks } from '@/lib/queries/projects';
import { getProjectAttachments } from '@/lib/queries/attachments';
import { getProjectActivity } from '@/lib/queries/activity';
import { getProjectAccessSummary } from '@/lib/queries/access-summary';
import { safeServerCall } from '@/lib/runtime/safe-server';

export default async function ProjectDetailPage({
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

  const [project, comments, tasks, members, attachments, activity, access] = await Promise.all([
    safeServerCall('getProjectById', () => getProjectById(id), null),
    safeServerCall('getProjectComments', () => getProjectComments(id), []),
    safeServerCall('getProjectTasks', () => getProjectTasks(id), []),
    safeServerCall('getProjectMembers', () => getProjectMembers(id), []),
    safeServerCall('getProjectAttachments', () => getProjectAttachments(id), []),
    safeServerCall('getProjectActivity', () => getProjectActivity(id), []),
    safeServerCall('getProjectAccessSummary', () => getProjectAccessSummary(id), { role: null, projectMemberRole: null, canEdit: false, canManageMembers: false, canComment: false, canUploadAttachments: false, canShare: false, canCreateTask: false, canViewActivity: false }),
  ]);

  if (!project) notFound();

  const createTaskHref = `/app/tasks/new?projectId=${encodeURIComponent(project.id)}${project.client_name ? `&clientName=${encodeURIComponent(project.client_name)}` : ''}`;

  return (
    <div className="space-y-4">
      <ProjectDetailSummary project={project} currentQuery={queryString} />
      <div className="rounded-[24px] border border-slate-200/90 bg-white/[0.92] p-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Acción rápida</p>
        <h3 className="mt-2 text-lg font-bold text-slate-900">Crear tarea desde este proyecto</h3>
        <p className="mt-1 text-sm text-slate-500">Abre una tarea ya vinculada al proyecto y, si existe, con el cliente precargado.</p>
        <Link href={createTaskHref} className="mt-4 inline-flex" aria-disabled={!access.canCreateTask}>
          <Button type="button" disabled={!access.canCreateTask}>Nueva tarea vinculada</Button>
        </Link>
        {!access.canCreateTask ? <p className="mt-3 text-xs text-slate-500">Tu acceso actual no permite crear tareas desde este proyecto.</p> : null}
      </div>

      <Card className="rounded-[28px] border border-slate-200/90 bg-white/[0.94] p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
        <div className="grid gap-5 xl:grid-cols-3">
          <ProjectStatusForm projectId={project.id} status={project.status} dueDate={project.due_date} shareEnabled={project.share_enabled} shareToken={project.share_token} canEdit={access.canEdit} embedded />
          <ProjectMembers projectId={project.id} members={members} canManage={access.canManageMembers} embedded />
          {access.canShare ? <ProjectSharePanel enabled={project.share_enabled} token={project.share_token} embedded /> : <div className="text-sm text-slate-500">Activa compartir cuando quieras abrir una vista resumida del proyecto fuera de la app.</div>}
        </div>
      </Card>

      <div className="space-y-4">
        <ProjectTaskList tasks={tasks} />
        <ProjectComments projectId={project.id} comments={comments} canComment={access.canComment} />
        <EntityAttachments entityType="project" entityId={project.id} attachments={attachments} canManage={access.canUploadAttachments} />
        {access.canViewActivity ? <ActivityTimeline items={activity} title="Bitácora del proyecto" description="Cambios de estado, miembros, adjuntos y edición del proyecto." defaultVisibleCount={3} expandLabel="Ver más actividad del proyecto" collapseLabel="Ver menos actividad del proyecto" compact /> : null}
      </div>
    </div>
  );
}
