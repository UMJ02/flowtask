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
import { getWorkspaceActivity, getWorkspaceBoards, getWorkspaceFiles, getWorkspaceIdentity, getWorkspacePersistedSpaces, getWorkspacePersistenceGuardStatus, getWorkspaceProjectViews } from "@/lib/workspace-system/server-data";
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

  const [workspaceIdentity, rawProjects, rawTasks, reports, workspaceBoards, persistenceGuard] = await Promise.all([
    safeServerCall("workspace:getIdentity", () => getWorkspaceIdentity(), null),
    safeServerCall("workspace:getProjects", () => getProjects({}), []),
    safeServerCall("workspace:getTasks", () => getTasks({ includeCompleted: true }), []),
    safeServerCall("workspace:getReportsOverview", () => getReportsOverview(), null),
    safeServerCall("workspace:getBoards", () => getWorkspaceBoards(), []),
    safeServerCall("workspace:persistenceGuard", () => getWorkspacePersistenceGuardStatus(), null),
  ]);

  const persistedSpaces = persistenceGuard?.workspaceSpacesReady
    ? await safeServerCall("workspace:getPersistedSpaces", () => getWorkspacePersistedSpaces(), [])
    : [];

  const projectsAll = rawProjects.map(mapProjectToWorkspaceSummary);
  const projectTitleById = new Map(projectsAll.map((project) => [project.id, project.title]));
  const tasksAll = rawTasks.map((task) => mapTaskToWorkspaceItem(task, projectTitleById));

  const generatedSpaces = buildWorkspaceSpaces(tasksAll, projectsAll);
  const spaces = persistedSpaces.length ? [...persistedSpaces, ...generatedSpaces.filter((space) => !persistedSpaces.some((persisted) => persisted.slug === space.slug))].slice(0, 12) : generatedSpaces;
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

  const [workspaceActivity, workspaceFiles, projectViews] = await Promise.all([
    safeServerCall("workspace:getActivity", () => getWorkspaceActivity(activeProject?.id ?? null), []),
    safeServerCall("workspace:getFiles", () => getWorkspaceFiles({
      projectId: activeProject?.id ?? null,
      projectIds: projectsInSpace.map((project) => project.id),
      taskIds: tasks.map((task) => task.id),
    }), []),
    persistenceGuard?.projectViewsReady
      ? safeServerCall("workspace:getProjectViews", () => getWorkspaceProjectViews(activeProject?.id ?? null), [])
      : Promise.resolve([]),
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

  return <WorkspaceSystemPage activeView={activeView} tasks={tasks} projects={projectsInSpace} spaces={spaces} reports={reports} boards={workspaceBoards} files={workspaceFiles} activity={workspaceActivity} projectViews={projectViews} persistenceStatus={persistenceGuard ?? { enabled: false, status: "unknown", workspaceSpacesReady: false, projectViewsReady: false, message: "Workspace persistence guard could not run.", checkedAt: null }} context={context} />;
}
