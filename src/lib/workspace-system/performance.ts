import type { WorkspaceViewId } from "@/lib/workspace-system/view-state";

export type WorkspaceLoadPlan = {
  reports: boolean;
  boards: boolean;
  files: boolean;
  activity: boolean;
  reason: string;
};

const HOME_HEAVY_VIEWS = new Set<WorkspaceViewId>(["home"]);
const BOARD_VIEWS = new Set<WorkspaceViewId>(["home", "canvas", "files"]);
const FILE_VIEWS = new Set<WorkspaceViewId>(["home", "files"]);
const ACTIVITY_VIEWS = new Set<WorkspaceViewId>(["home", "files"]);
const REPORT_VIEWS = new Set<WorkspaceViewId>(["home", "reports"]);

export function buildWorkspaceLoadPlan(
  view: WorkspaceViewId,
  options: { hasActiveProject?: boolean; commandCenter?: boolean } = {},
): WorkspaceLoadPlan {
  const commandCenterHints = Boolean(options.commandCenter && HOME_HEAVY_VIEWS.has(view));
  return {
    reports: REPORT_VIEWS.has(view),
    boards: BOARD_VIEWS.has(view) || commandCenterHints,
    files: FILE_VIEWS.has(view),
    activity: ACTIVITY_VIEWS.has(view),
    reason: options.hasActiveProject
      ? `project-scoped:${view}`
      : `workspace-scoped:${view}`,
  };
}

export const WORKSPACE_QUERY_LIMITS = {
  boards: 18,
  activity: 18,
  files: 24,
  projectViews: 80,
  projectSpaceAssignments: 500,
} as const;
