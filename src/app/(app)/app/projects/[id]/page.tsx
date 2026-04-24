export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { ProjectDetailPro } from '@/components/projects/project-detail-pro';
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
    <ProjectDetailPro
      project={project}
      tasks={tasks}
      members={members}
      attachments={attachments}
      activity={access.canViewActivity ? activity : []}
      currentQuery={queryString}
      createTaskHref={createTaskHref}
      canCreateTask={access.canCreateTask}
    />
  );
}
