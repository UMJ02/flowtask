import { notFound } from 'next/navigation';
import { ProjectDetailSummary } from '@/components/projects/project-detail-summary';
import { ProjectStatusForm } from '@/components/projects/project-status-form';
import { ProjectMembers } from '@/components/projects/project-members';
import { ProjectSharePanel } from '@/components/projects/project-share-panel';
import { ProjectTaskList } from '@/components/projects/project-task-list';
import { ProjectHealthStrip } from '@/components/projects/project-health-strip';
import { ProjectTaskListLive } from '@/components/projects/project-task-list-live';
import { ProjectComments } from '@/components/projects/project-comments';
import { ProjectCommentsLive } from '@/components/projects/project-comments-live';
import { ProjectClientMetrics } from '@/components/projects/project-client-metrics';
import { ProjectSectionPermissions } from '@/components/projects/project-section-permissions';
import { EntityAttachments } from '@/components/attachments/entity-attachments';
import { ActivityTimeline } from '@/components/activity/activity-timeline';
import { safeServerCall } from '@/lib/runtime/safe-server';
import { getProjectById, getProjectTasks, getProjectComments, getProjectMembers, getProjectClientMetrics } from '@/lib/queries/projects';
import { getProjectAttachments, getProjectSectionPermissions } from '@/lib/queries/attachments';
import { getProjectActivity } from '@/lib/queries/activity';

export default async function ProjectDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const { id } = await params;
  const query = (await searchParams) ?? {};
  const queryString = new URLSearchParams(Object.entries(query).flatMap(([key, value]) => typeof value === 'string' ? [[key, value]] : Array.isArray(value) ? value.map((item) => [key, item]) : [])).toString();
  const project = await safeServerCall('getProjectById', () => getProjectById(id), null);
  if (!project) notFound();

  const [tasks, comments, members, metrics, attachments, permissions, activity] = await Promise.all([
    safeServerCall('getProjectTasks', () => getProjectTasks(id), []),
    safeServerCall('getProjectComments', () => getProjectComments(id), []),
    safeServerCall('getProjectMembers', () => getProjectMembers(id), []),
    safeServerCall('getProjectClientMetrics', () => getProjectClientMetrics(id), []),
    safeServerCall('getProjectAttachments', () => getProjectAttachments(id), []),
    safeServerCall('getProjectSectionPermissions', () => getProjectSectionPermissions(id), []),
    safeServerCall('getProjectActivity', () => getProjectActivity(id), []),
  ]);

  return (
    <div className="space-y-4">
      <ProjectDetailSummary project={project} currentQuery={queryString} />
      <ProjectHealthStrip tasks={tasks} />
      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-4">
          <ProjectTaskList tasks={tasks} />
          <ProjectTaskListLive projectId={id} tasks={tasks} />
          <ProjectComments projectId={id} comments={comments} />
          <ProjectCommentsLive projectId={id} comments={comments} />
          <EntityAttachments entityType="project" entityId={id} attachments={attachments} />
          <ActivityTimeline items={activity} />
        </div>
        <div className="space-y-4">
          <ProjectStatusForm projectId={id} status={project.status} dueDate={project.due_date} shareEnabled={project.share_enabled} shareToken={project.share_token} />
          <ProjectMembers projectId={id} members={members} />
          <ProjectClientMetrics items={metrics} />
          <ProjectSectionPermissions projectId={id} members={members} permissions={permissions} />
          <ProjectSharePanel enabled={project.share_enabled} token={project.share_token} />
        </div>
      </div>
    </div>
  );
}
