"use client";

import type { ReportsOverview } from "@/lib/queries/reports";
import { WorkspaceProPage } from "@/components/workspace-pro/workspace-pro-page";
import type {
  WorkspaceActivityItem,
  WorkspaceBoardSummary,
  WorkspaceContext,
  WorkspaceFileSummary,
  WorkspaceMemberSummary,
  WorkspaceNotificationSummary,
  WorkspacePermissionSummary,
  WorkspacePersistenceGuardStatus,
  WorkspaceProjectSpaceAssignment,
  WorkspaceProjectSummary,
  WorkspaceProjectViewPreference,
  WorkspaceSpaceSummary,
  WorkspaceTaskItem,
  WorkspaceViewId,
} from "@/lib/workspace-system/view-state";

export function WorkspaceSystemPage(props: {
  activeView: WorkspaceViewId;
  tasks: WorkspaceTaskItem[];
  projects: WorkspaceProjectSummary[];
  spaces: WorkspaceSpaceSummary[];
  reports: ReportsOverview | null;
  boards: WorkspaceBoardSummary[];
  files: WorkspaceFileSummary[];
  activity: WorkspaceActivityItem[];
  projectViews: WorkspaceProjectViewPreference[];
  projectSpaceAssignments: WorkspaceProjectSpaceAssignment[];
  members: WorkspaceMemberSummary[];
  permissions: WorkspacePermissionSummary;
  persistenceStatus: WorkspacePersistenceGuardStatus;
  notifications: WorkspaceNotificationSummary;
  context: WorkspaceContext;
}) {
  return <WorkspaceProPage {...props} />;
}
