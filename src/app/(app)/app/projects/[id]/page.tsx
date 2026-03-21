import { notFound } from "next/navigation";
import { ProjectCommentsLive } from "@/components/projects/project-comments-live";
import { ProjectDetailSummary } from "@/components/projects/project-detail-summary";
import { ProjectMembers } from "@/components/projects/project-members";
import { ProjectSharePanel } from "@/components/projects/project-share-panel";
import { ProjectStatusForm } from "@/components/projects/project-status-form";
import { ProjectTaskListLive } from "@/components/projects/project-task-list-live";
import {
  getProjectById,
  getProjectComments,
  getProjectMembers,
  getProjectTasks,
} from "@/lib/queries/projects";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [project, comments, members, tasks] = await Promise.all([
    getProjectById(id),
    getProjectComments(id),
    getProjectMembers(id),
    getProjectTasks(id),
  ]);

  if (!project) notFound();

  return (
    <div className="space-y-4">
      <ProjectDetailSummary project={project} />
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
      <ProjectCommentsLive projectId={project.id} comments={comments} />
    </div>
  );
}
