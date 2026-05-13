export const dynamic = "force-dynamic";

import { WorkspaceSystemPage } from "@/components/workspace-system/workspace-system-page";
import { getProjects } from "@/lib/queries/projects";
import { getReportsOverview } from "@/lib/queries/reports";
import { getTasks } from "@/lib/queries/tasks";
import { safeServerCall } from "@/lib/runtime/safe-server";
import {
  buildWorkspaceSpaces,
  filterProjectsForWorkspace,
  filterTasksForWorkspace,
  mapProjectToWorkspaceSummary,
  mapTaskToWorkspaceItem,
  normalizeWorkspaceView,
  slugifyWorkspaceValue,
} from "@/lib/workspace-system/adapters";
import { getWorkspaceActivity, getWorkspaceBoards, getWorkspaceFiles, getWorkspaceIdentity } from "@/lib/workspace-system/server-data";
import type { WorkspaceContext, WorkspaceViewId } from "@/lib/workspace-system/view-state";

function getParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

export default async function WorkspacePage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const params = (await searchParams) ?? {};
  const activeView = normalizeWorkspaceView(params.view) as WorkspaceViewId;
  const requestedProjectId = getParam(params, "projectId");
  const requestedSpace = getParam(params, "space");
  const requestedStatus = getParam(params, "status");

  const [workspaceIdentity, rawProjects, rawTasks, reports, workspaceBoards] = await Promise.all([
    safeServerCall("workspace:getIdentity", () => getWorkspaceIdentity(), null),
    safeServerCall("workspace:getProjects", () => getProjects({}), []),
    safeServerCall("workspace:getTasks", () => getTasks({ includeCompleted: true }), []),
    safeServerCall("workspace:getReportsOverview", () => getReportsOverview(), null),
    safeServerCall("workspace:getBoards", () => getWorkspaceBoards(), []),
  ]);

  const projectsAll = rawProjects.map(mapProjectToWorkspaceSummary);
  const projectTitleById = new Map(projectsAll.map((project) => [project.id, project.title]));
  const tasksAll = rawTasks.map((task) => mapTaskToWorkspaceItem(task, projectTitleById));

  const spaces = buildWorkspaceSpaces(tasksAll, projectsAll);
  const spaceSlug = requestedSpace ? slugifyWorkspaceValue(requestedSpace) : null;
  const activeSpace = spaceSlug ? spaces.find((space) => space.slug === spaceSlug) ?? null : null;
  const projectsInSpace = filterProjectsForWorkspace(projectsAll, { spaceSlug: activeSpace?.slug ?? null });
  const activeProject = requestedProjectId ? projectsInSpace.find((project) => project.id === requestedProjectId) ?? null : null;
  const invalidProjectId = requestedProjectId && !activeProject ? requestedProjectId : null;

  const tasks = invalidProjectId
    ? []
    : filterTasksForWorkspace(tasksAll, {
        projectId: activeProject?.id ?? null,
        spaceSlug: activeSpace?.slug ?? null,
        status: requestedStatus,
      });

  const [workspaceActivity, workspaceFiles] = await Promise.all([
    safeServerCall("workspace:getActivity", () => getWorkspaceActivity(activeProject?.id ?? null), []),
    safeServerCall("workspace:getFiles", () => getWorkspaceFiles({
      projectId: activeProject?.id ?? null,
      projectIds: projectsInSpace.map((project) => project.id),
      taskIds: tasks.map((task) => task.id),
    }), []),
  ]);

  const context: WorkspaceContext = {
    workspaceId: workspaceIdentity?.workspaceId ?? "active-workspace",
    workspaceName: workspaceIdentity?.workspaceName ?? "FlowTask Workspace",
    mode: workspaceIdentity?.mode ?? "personal",
    organizationId: workspaceIdentity?.organizationId ?? null,
    userId: workspaceIdentity?.userId ?? null,
    spaceId: activeSpace?.id ?? null,
    spaceName: activeSpace?.name ?? "Todo el workspace",
    projectId: activeProject?.id ?? null,
    projectTitle: activeProject?.title ?? (invalidProjectId ? "Proyecto no disponible" : "Todos los proyectos"),
    hasProjectFilter: Boolean(activeProject),
    invalidProjectId,
    activeFilters: {
      view: activeView,
      space: activeSpace?.slug ?? null,
      projectId: activeProject?.id ?? null,
      status: requestedStatus ?? null,
    },
  };

  return <WorkspaceSystemPage activeView={activeView} tasks={tasks} projects={projectsInSpace} spaces={spaces} reports={reports} boards={workspaceBoards} files={workspaceFiles} activity={workspaceActivity} context={context} />;
}
