
export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { ProjectDetailSummary } from '@/components/projects/project-detail-summary';
import { ProjectStatusForm } from '@/components/projects/project-status-form';
import { ProjectTaskList } from '@/components/projects/project-task-list';
import { ProjectComments } from '@/components/projects/project-comments';
import { ProjectMembers } from '@/components/projects/project-members';
import { ProjectSharePanel } from '@/components/projects/project-share-panel';
import { getProjectById, getProjectComments, getProjectMembers, getProjectTasks } from '@/lib/queries/projects';
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

  const [project, comments, tasks, members] = await Promise.all([
    safeServerCall('getProjectById', () => getProjectById(id), null),
    safeServerCall('getProjectComments', () => getProjectComments(id), []),
    safeServerCall('getProjectTasks', () => getProjectTasks(id), []),
    safeServerCall('getProjectMembers', () => getProjectMembers(id), []),
  ]);

  if (!project) notFound();

  return (
    <div className="space-y-4">
      <ProjectDetailSummary project={project} currentQuery={queryString} />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-4">
          <ProjectTaskList tasks={tasks} />
          <ProjectComments projectId={project.id} comments={comments} />
        </div>
        <div className="space-y-4">
          <ProjectStatusForm projectId={project.id} status={project.status} dueDate={project.due_date} shareEnabled={project.share_enabled} shareToken={project.share_token} />
          <ProjectMembers projectId={project.id} members={members} />
          <ProjectSharePanel enabled={project.share_enabled} token={project.share_token} />
        </div>
      </div>
    </div>
  );
}
