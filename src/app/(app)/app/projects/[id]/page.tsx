import { notFound } from "next/navigation";
import { EntityAttachments } from "@/components/attachments/entity-attachments";
import { ProjectClientMetrics } from "@/components/projects/project-client-metrics";
import { ProjectCommentsLive } from "@/components/projects/project-comments-live";
import { ProjectSectionPermissions } from "@/components/projects/project-section-permissions";
import { ProjectDetailSummary } from "@/components/projects/project-detail-summary";
import { ProjectMembers } from "@/components/projects/project-members";
import { ProjectSharePanel } from "@/components/projects/project-share-panel";
import { ProjectStatusForm } from "@/components/projects/project-status-form";
import { ProjectTaskListLive } from "@/components/projects/project-task-list-live";
import {
  getProjectById,
  getProjectClientMetrics,
  getProjectComments,
  getProjectMembers,
  getProjectTasks,
} from "@/lib/queries/projects";
import { getProjectAttachments, getProjectSectionPermissions } from "@/lib/queries/attachments";
import { getProjectActivity } from "@/lib/queries/activity";
import { ActivityTimeline } from "@/components/activity/activity-timeline";
import { EntityRecentTracker } from '@/components/entities/entity-recent-tracker';

export default async function ProjectDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const filters = (await searchParams) ?? {};
  const currentQuery = new URLSearchParams(Object.entries(filters).flatMap(([key, value]) => typeof value === "string" && value.length > 0 ? [[key, value]] : [])).toString();
  const [project, comments, members, tasks, clientMetrics, attachments, permissions, activity] = await Promise.all([
    getProjectById(id),
    getProjectComments(id),
    getProjectMembers(id),
    getProjectTasks(id),
    getProjectClientMetrics(id),
    getProjectAttachments(id),
    getProjectSectionPermissions(id),
    getProjectActivity(id),
  ]);

  if (!project) notFound();

  return (
    <div className="space-y-4">
      <EntityRecentTracker entity={{ id: project.id, type: 'project', title: project.title, subtitle: project.client_name || 'Proyecto', href: `/app/projects/${project.id}`, updatedAt: new Date().toISOString() }} />
      <ProjectDetailSummary currentQuery={currentQuery} project={project} />
      <div className="grid gap-4 lg:grid-cols-2">
        <ProjectStatusForm
          projectId={project.id}
          status={project.status}
          dueDate={project.due_date}
          shareEnabled={project.share_enabled}
          shareToken={project.share_token}
        />
        <ProjectSharePanel enabled={project.share_enabled} token={project.share_token} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <ProjectTaskListLive projectId={project.id} tasks={tasks} />
        <ProjectMembers projectId={project.id} members={members} />
      </div>
      <ProjectClientMetrics items={clientMetrics} />
      <div className="grid gap-4 lg:grid-cols-2">
        <EntityAttachments entityType="project" entityId={project.id} attachments={attachments} />
        <ActivityTimeline items={activity} title="Bitácora del proyecto" description="Trazabilidad y cambios recientes del proyecto." />
      </div>
      <ProjectSectionPermissions projectId={project.id} members={members} permissions={permissions} />
      <ProjectCommentsLive projectId={project.id} comments={comments} />
    </div>
  );
}
