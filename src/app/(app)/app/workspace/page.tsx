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
import {
  getWorkspaceActivity,
  getWorkspaceBoards,
  getWorkspaceFiles,
  getWorkspaceIdentity,
  getWorkspacePersistedSpaces,
  getWorkspacePersistenceGuardStatus,
  getWorkspaceProjectViews,
} from "@/lib/workspace-system/server-data";
import type {
  WorkspaceContext,
  WorkspaceGroupBy,
  WorkspaceProjectViewPreference,
  WorkspaceSortKey,
  WorkspaceViewId,
} from "@/lib/workspace-system/view-state";

function getParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = params[key];
  return Array.isArray(value) ? (value[0] ?? null) : (value ?? null);
}

function normalizeGroupBy(value?: string | null): WorkspaceGroupBy {
  return value === "priority" || value === "project" || value === "none"
    ? value
    : "status";
}

function normalizeSort(value?: string | null): WorkspaceSortKey {
  return value === "due_date" || value === "priority" || value === "title"
    ? value
    : "updated";
}

function parseColumns(value?: string | null) {
  return (value ?? "")
    .split(",")
    .map((column) => column.trim())
    .filter(Boolean)
    .slice(0, 12);
}

function getSavedViewFilters(view?: WorkspaceProjectViewPreference | null) {
  const filters = view?.config?.filters;
  return filters && typeof filters === "object" ? filters : {};
}

function sortWorkspaceTasks(
  tasks: ReturnType<typeof mapTaskToWorkspaceItem>[],
  sort: WorkspaceSortKey,
) {
  const priorityRank: Record<string, number> = { alta: 0, media: 1, baja: 2 };
  const sorted = [...tasks];
  return sorted.sort((a, b) => {
    if (sort === "title") return a.title.localeCompare(b.title);
    if (sort === "priority")
      return (
        (priorityRank[String(a.priority ?? "media").toLowerCase()] ?? 9) -
        (priorityRank[String(b.priority ?? "media").toLowerCase()] ?? 9)
      );
    if (sort === "due_date")
      return String(a.dueDate ?? "9999-12-31").localeCompare(
        String(b.dueDate ?? "9999-12-31"),
      );
    return String(b.dueDate ?? "").localeCompare(String(a.dueDate ?? ""));
  });
}

export default async function WorkspacePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const requestedView = getParam(params, "view");
  const requestedSavedViewId = getParam(params, "savedViewId");
  const requestedProjectId = getParam(params, "projectId");
  const requestedSpace = getParam(params, "space");
  const requestedStatus = getParam(params, "status");
  const requestedGroupBy = getParam(params, "groupBy");
  const requestedSort = getParam(params, "sort");
  const requestedColumns = getParam(params, "columns");

  const [
    workspaceIdentity,
    rawProjects,
    rawTasks,
    reports,
    workspaceBoards,
    persistenceGuard,
  ] = await Promise.all([
    safeServerCall("workspace:getIdentity", () => getWorkspaceIdentity(), null),
    safeServerCall("workspace:getProjects", () => getProjects({}), []),
    safeServerCall(
      "workspace:getTasks",
      () => getTasks({ includeCompleted: true }),
      [],
    ),
    safeServerCall(
      "workspace:getReportsOverview",
      () => getReportsOverview(),
      null,
    ),
    safeServerCall("workspace:getBoards", () => getWorkspaceBoards(), []),
    safeServerCall(
      "workspace:persistenceGuard",
      () => getWorkspacePersistenceGuardStatus(),
      null,
    ),
  ]);

  const persistedSpaces = persistenceGuard?.workspaceSpacesReady
    ? await safeServerCall(
        "workspace:getPersistedSpaces",
        () => getWorkspacePersistedSpaces(),
        [],
      )
    : [];

  const projectsAll = rawProjects.map(mapProjectToWorkspaceSummary);
  const projectTitleById = new Map(
    projectsAll.map((project) => [project.id, project.title]),
  );
  const tasksAll = rawTasks.map((task) =>
    mapTaskToWorkspaceItem(task, projectTitleById),
  );

  const generatedSpaces = buildWorkspaceSpaces(tasksAll, projectsAll);
  const spaces = persistedSpaces.length
    ? [
        ...persistedSpaces,
        ...generatedSpaces.filter(
          (space) =>
            !persistedSpaces.some((persisted) => persisted.slug === space.slug),
        ),
      ].slice(0, 12)
    : generatedSpaces;
  const spaceSlug = requestedSpace
    ? slugifyWorkspaceValue(requestedSpace)
    : null;
  const activeSpace = spaceSlug
    ? (spaces.find((space) => space.slug === spaceSlug) ?? null)
    : null;
  const projectsInSpace = filterProjectsForWorkspace(projectsAll, {
    spaceSlug: activeSpace?.slug ?? null,
  });
  const activeProject = requestedProjectId
    ? (projectsInSpace.find((project) => project.id === requestedProjectId) ??
      null)
    : null;
  const invalidProjectId =
    requestedProjectId && !activeProject ? requestedProjectId : null;

  const projectViews = persistenceGuard?.projectViewsReady
    ? await safeServerCall(
        "workspace:getProjectViews",
        () => getWorkspaceProjectViews(activeProject?.id ?? null),
        [],
      )
    : [];

  const requestedSavedView = requestedSavedViewId
    ? (projectViews.find((view) => view.id === requestedSavedViewId) ?? null)
    : null;
  const defaultSavedView =
    !requestedView && !requestedSavedView
      ? (projectViews.find((view) => view.isDefault) ?? null)
      : null;
  const activeSavedView = requestedSavedView ?? defaultSavedView;
  const savedFilters = getSavedViewFilters(activeSavedView);

  const activeView = normalizeWorkspaceView(
    requestedView ?? savedFilters.view ?? activeSavedView?.viewType ?? "list",
  ) as WorkspaceViewId;
  const effectiveStatus = requestedStatus ?? savedFilters.status ?? null;
  const effectiveGroupBy = normalizeGroupBy(
    requestedGroupBy ?? savedFilters.groupBy ?? null,
  );
  const effectiveSort = normalizeSort(
    requestedSort ?? savedFilters.sort ?? null,
  );
  const effectiveColumns = parseColumns(
    requestedColumns ??
      (Array.isArray(savedFilters.columns)
        ? savedFilters.columns.join(",")
        : null),
  );

  const tasks = invalidProjectId
    ? []
    : sortWorkspaceTasks(
        filterTasksForWorkspace(tasksAll, {
          projectId: activeProject?.id ?? null,
          spaceSlug: activeSpace?.slug ?? null,
          status: effectiveStatus,
        }),
        effectiveSort,
      );

  const [workspaceActivity, workspaceFiles] = await Promise.all([
    safeServerCall(
      "workspace:getActivity",
      () => getWorkspaceActivity(activeProject?.id ?? null),
      [],
    ),
    safeServerCall(
      "workspace:getFiles",
      () =>
        getWorkspaceFiles({
          projectId: activeProject?.id ?? null,
          projectIds: projectsInSpace.map((project) => project.id),
          taskIds: tasks.map((task) => task.id),
        }),
      [],
    ),
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
    projectTitle:
      activeProject?.title ??
      (invalidProjectId ? "Proyecto no disponible" : "Todos los proyectos"),
    hasProjectFilter: Boolean(activeProject),
    invalidProjectId,
    activeFilters: {
      view: activeView,
      space: activeSpace?.slug ?? null,
      projectId: activeProject?.id ?? null,
      status: effectiveStatus ?? null,
      groupBy: effectiveGroupBy,
      sort: effectiveSort,
      columns: effectiveColumns,
      savedViewId: activeSavedView?.id ?? null,
      defaultApplied: Boolean(defaultSavedView && !requestedSavedView),
    },
    activeSavedView: activeSavedView
      ? {
          id: activeSavedView.id,
          title: activeSavedView.title,
          viewType: activeSavedView.viewType,
          isDefault: activeSavedView.isDefault,
        }
      : null,
  };

  return (
    <WorkspaceSystemPage
      activeView={activeView}
      tasks={tasks}
      projects={projectsInSpace}
      spaces={spaces}
      reports={reports}
      boards={workspaceBoards}
      files={workspaceFiles}
      activity={workspaceActivity}
      projectViews={projectViews}
      persistenceStatus={
        persistenceGuard ?? {
          enabled: false,
          status: "unknown",
          workspaceSpacesReady: false,
          projectViewsReady: false,
          message: "Workspace persistence guard could not run.",
          checkedAt: null,
        }
      }
      context={context}
    />
  );
}
