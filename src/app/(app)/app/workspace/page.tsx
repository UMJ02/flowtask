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
import { buildWorkspaceLoadPlan } from "@/lib/workspace-system/performance";
import {
  getWorkspaceActivity,
  getWorkspaceBoards,
  getWorkspaceFiles,
  getWorkspaceIdentity,
  getWorkspacePersistedSpaces,
  getWorkspacePersistenceGuardStatus,
  getWorkspacePermissionSummary,
  getWorkspaceProjectMembers,
  getWorkspaceProjectSpaceAssignments,
  getWorkspaceProjectViews,
} from "@/lib/workspace-system/server-data";
import type {
  WorkspaceContext,
  WorkspaceGroupBy,
  WorkspaceProjectViewPreference,
  WorkspaceProjectSpaceAssignment,
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
  const projectSpaceAssignments: WorkspaceProjectSpaceAssignment[] = persistenceGuard?.projectSpaceLinksReady
    ? await safeServerCall(
        "workspace:getProjectSpaceAssignments",
        () => getWorkspaceProjectSpaceAssignments(),
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
  const assignedProjectIdsBySpace = new Map<string, Set<string>>();
  for (const assignment of projectSpaceAssignments) {
    const current = assignedProjectIdsBySpace.get(assignment.spaceId) ?? new Set<string>();
    current.add(assignment.projectId);
    assignedProjectIdsBySpace.set(assignment.spaceId, current);
  }
  const persistedSpacesWithCounts = persistedSpaces.map((space) => {
    const projectIds = assignedProjectIdsBySpace.get(space.id) ?? new Set<string>();
    const projectCount = projectIds.size;
    const taskCount = tasksAll.filter((task) => task.projectId && projectIds.has(task.projectId)).length;
    return { ...space, projectCount, taskCount };
  });
  const spaces = persistedSpacesWithCounts.length
    ? [
        ...persistedSpacesWithCounts,
        ...generatedSpaces.filter(
          (space) =>
            !persistedSpacesWithCounts.some((persisted) => persisted.slug === space.slug),
        ),
      ].slice(0, 16)
    : generatedSpaces;
  const spaceSlug = requestedSpace
    ? slugifyWorkspaceValue(requestedSpace)
    : null;
  const activeSpace = spaceSlug
    ? (spaces.find((space) => space.slug === spaceSlug) ?? null)
    : null;
  const activePersistedProjectIds = activeSpace?.isPersisted
    ? (assignedProjectIdsBySpace.get(activeSpace.id) ?? new Set<string>())
    : null;
  const projectsInSpace = activePersistedProjectIds
    ? projectsAll.filter((project) => activePersistedProjectIds.has(project.id))
    : filterProjectsForWorkspace(projectsAll, {
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

  const [workspaceMembers, workspacePermissions] = await Promise.all([
    safeServerCall(
      "workspace:getProjectMembers",
      () => getWorkspaceProjectMembers(activeProject?.id ?? null),
      [],
    ),
    safeServerCall(
      "workspace:getPermissionSummary",
      () => getWorkspacePermissionSummary(activeProject?.id ?? null),
      {
        role: null,
        projectMemberRole: null,
        organizationRole: null,
        isProjectOwner: false,
        isOrgManager: false,
        canEdit: false,
        canManageMembers: false,
        canCreateTask: false,
        canUploadFiles: false,
        canSaveViews: false,
        canManageSpaces: false,
        canAssignProjectsToSpaces: false,
        canEditTasks: false,
        canShare: false,
        canViewActivity: false,
        isReadOnly: true,
        message: "No se pudo validar permisos del workspace.",
      },
    ),
  ]);

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
    requestedView ?? savedFilters.view ?? activeSavedView?.viewType ?? "home",
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
          spaceSlug: activeSpace?.isPersisted ? null : activeSpace?.slug ?? null,
          status: effectiveStatus,
        }),
        effectiveSort,
      ).filter((task) =>
        activePersistedProjectIds && !activeProject
          ? Boolean(task.projectId && activePersistedProjectIds.has(task.projectId))
          : true,
      );

  const loadPlan = buildWorkspaceLoadPlan(activeView, {
    hasActiveProject: Boolean(activeProject),
    commandCenter: true,
  });

  const [reports, workspaceBoards, workspaceActivity, workspaceFiles] = await Promise.all([
    loadPlan.reports
      ? safeServerCall(
          "workspace:getReportsOverview",
          () => getReportsOverview(),
          null,
        )
      : Promise.resolve(null),
    loadPlan.boards
      ? safeServerCall(
          "workspace:getBoards",
          () => getWorkspaceBoards(activeProject?.id ?? null),
          [],
        )
      : Promise.resolve([]),
    loadPlan.activity
      ? safeServerCall(
          "workspace:getActivity",
          () => getWorkspaceActivity(activeProject?.id ?? null),
          [],
        )
      : Promise.resolve([]),
    loadPlan.files
      ? safeServerCall(
          "workspace:getFiles",
          () =>
            getWorkspaceFiles({
              projectId: activeProject?.id ?? null,
              projectIds: projectsInSpace.map((project) => project.id),
              taskIds: tasks.map((task) => task.id),
            }),
          [],
        )
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
      projectSpaceAssignments={projectSpaceAssignments}
      members={workspaceMembers}
      permissions={workspacePermissions}
      persistenceStatus={
        persistenceGuard ?? {
          enabled: false,
          status: "unknown",
          workspaceSpacesReady: false,
          projectViewsReady: false,
          projectSpaceLinksReady: false,
          message: "Workspace persistence guard could not run.",
          checkedAt: null,
        }
      }
      context={context}
    />
  );
}
