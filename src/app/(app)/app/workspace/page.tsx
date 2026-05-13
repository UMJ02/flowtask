export const dynamic = "force-dynamic";

import { WorkspaceSystemPage } from "@/components/workspace-system/workspace-system-page";
import { getProjects } from "@/lib/queries/projects";
import { getReportsOverview } from "@/lib/queries/reports";
import { getTasks } from "@/lib/queries/tasks";
import { safeServerCall } from "@/lib/runtime/safe-server";
import { mapProjectToWorkspaceSummary, mapTaskToWorkspaceItem, normalizeWorkspaceView } from "@/lib/workspace-system/adapters";
import type { WorkspaceContext, WorkspaceViewId } from "@/lib/workspace-system/view-state";

export default async function WorkspacePage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const params = (await searchParams) ?? {};
  const activeView = normalizeWorkspaceView(params.view) as WorkspaceViewId;
  const projectId = typeof params.projectId === "string" ? params.projectId : null;
  const spaceName = typeof params.space === "string" ? params.space : "Operación";

  const [rawTasks, rawProjects, reports] = await Promise.all([
    safeServerCall("workspace:getTasks", () => getTasks({ includeCompleted: true }), []),
    safeServerCall("workspace:getProjects", () => getProjects({}), []),
    safeServerCall("workspace:getReportsOverview", () => getReportsOverview(), null),
  ]);

  const projects = rawProjects.map(mapProjectToWorkspaceSummary);
  const activeProject = projectId ? projects.find((project) => project.id === projectId) : projects[0] ?? null;
  const scopedProjectId = projectId ?? activeProject?.id ?? null;
  const tasks = rawTasks
    .filter((task) => (projectId ? task.project_id === projectId : true))
    .map(mapTaskToWorkspaceItem);

  const context: WorkspaceContext = {
    workspaceId: "active-workspace",
    workspaceName: "FlowTask Workspace",
    mode: "personal",
    spaceId: spaceName.toLowerCase().replaceAll(" ", "-"),
    spaceName,
    projectId: scopedProjectId,
    projectTitle: activeProject?.title ?? "Workspace operativo",
  };

  return <WorkspaceSystemPage activeView={activeView} tasks={tasks} projects={projects} reports={reports} context={context} />;
}
