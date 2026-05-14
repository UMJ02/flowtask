#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const warnings = [];
const exists = (rel) => fs.existsSync(path.join(root, rel));
const read = (rel) => exists(rel) ? fs.readFileSync(path.join(root, rel), "utf8") : "";
const requireFile = (rel) => { if (!exists(rel)) failures.push(`Missing ${rel}`); };
const requireIncludes = (rel, text) => { if (!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); };

for (const rel of [
  "supabase/migrations/0056_v58_25_9_workspace_persistence_foundation.sql",
  "src/app/(app)/app/workspace/page.tsx",
  "src/lib/workspace-system/server-data.ts",
  "src/lib/workspace-system/view-state.ts",
  "src/components/workspace-system/workspace-system-page.tsx",
  "src/components/workspace-system/workspace-saved-views-manager.tsx",
  "src/components/workspace-system/workspace-right-panel.tsx",
  "src/components/workspace-system/workspace-empty-state.tsx",
  "src/components/workspace-system/workspace-command-center.tsx",
  "src/components/workspace-system/views/home-view.tsx",
  "src/components/workspace-system/views/list-view.tsx",
  "src/components/workspace-system/views/board-view.tsx",
  "src/components/workspace-system/views/timeline-view.tsx",
  "src/components/workspace-system/views/table-view.tsx",
  "src/components/workspace-system/views/canvas-view.tsx",
  "src/components/workspace-system/views/files-view.tsx",
  "src/components/workspace-system/views/reports-view.tsx"
]) requireFile(rel);

requireIncludes("supabase/migrations/0056_v58_25_9_workspace_persistence_foundation.sql", "create table if not exists public.workspace_spaces");
requireIncludes("supabase/migrations/0056_v58_25_9_workspace_persistence_foundation.sql", "create table if not exists public.project_views");
requireIncludes("supabase/migrations/0056_v58_25_9_workspace_persistence_foundation.sql", "workspace_spaces_select_access");
requireIncludes("supabase/migrations/0056_v58_25_9_workspace_persistence_foundation.sql", "project_views_write_access");
requireIncludes("src/lib/workspace-system/server-data.ts", "getWorkspacePersistenceGuardStatus");
requireIncludes("src/lib/workspace-system/server-data.ts", "isMissingPersistenceRelation");
requireIncludes("src/lib/workspace-system/server-data.ts", "workspace_spaces");
requireIncludes("src/lib/workspace-system/server-data.ts", "project_views");
requireIncludes("src/app/(app)/app/workspace/page.tsx", "persistenceGuard?.workspaceSpacesReady");
requireIncludes("src/app/(app)/app/workspace/page.tsx", "persistenceGuard?.projectViewsReady");
requireIncludes("src/app/(app)/app/workspace/page.tsx", "persistenceStatus=");
requireIncludes("src/components/workspace-system/workspace-saved-views-manager.tsx", "persistenceStatus.projectViewsReady");
requireIncludes("src/components/workspace-system/workspace-saved-views-manager.tsx", "Migration Guard");
requireIncludes("src/components/workspace-system/workspace-right-panel.tsx", "persistenceStatus.message");
requireIncludes("src/components/workspace-system/workspace-right-panel.tsx", "workspace_spaces:");
requireIncludes("src/app/(app)/app/workspace/page.tsx", "requestedSavedViewId");
requireIncludes("src/app/(app)/app/workspace/page.tsx", "defaultSavedView");
requireIncludes("src/components/workspace-system/workspace-saved-views-manager.tsx", "applySavedViewParams");

const pkg = JSON.parse(read("package.json"));
if (pkg.scripts?.["workspace:doctor"] !== "node scripts/workspace-persistence-doctor.mjs") failures.push("package.json must expose workspace:doctor");
if (pkg.scripts?.["verify:current"] !== "npm run verify:v58.25.9.8") failures.push("verify:current must target v58.25.9.8");

const migration = read("supabase/migrations/0056_v58_25_9_workspace_persistence_foundation.sql");
for (const fn of ["public.is_org_admin_or_manager", "public.is_project_member", "public.has_project_role", "public.set_updated_at"]) {
  if (!migration.includes(fn)) warnings.push(`Migration 0056 depends on existing ${fn}; validate it in Supabase before applying to a new project.`);
}

requireFile("supabase/migrations/0057_v58_25_9_4_workspace_space_project_assignments.sql");
requireFile("supabase/migrations/0058_v58_25_9_5_project_views_home_view_support.sql");
requireIncludes("supabase/migrations/0058_v58_25_9_5_project_views_home_view_support.sql", "project_views_view_type_check");
requireIncludes("supabase/migrations/0058_v58_25_9_5_project_views_home_view_support.sql", "'home'");
requireIncludes("src/lib/workspace-system/server-data.ts", "getWorkspaceProjectSpaceAssignments");
requireIncludes("src/components/workspace-system/workspace-spaces-manager.tsx", "Workspace Spaces Manager + Project Organization");
requireIncludes("src/components/workspace-system/workspace-system-page.tsx", "WorkspaceSpacesManager");
requireIncludes("src/app/globals.css", "ft-ws-spaces-manager");
requireIncludes("src/app/globals.css", "v58.25.9.8 — Workspace Navigation + Search Command Center");
requireIncludes("src/components/workspace-system/views/home-view.tsx", "Home operativo");
requireIncludes("src/components/workspace-system/workspace-system-page.tsx", "HomeView");
requireIncludes("src/components/workspace-system/workspace-system-page.tsx", "permissions.canCreateTask");
requireFile("src/components/workspace-system/workspace-members-permissions.tsx");
requireIncludes("src/lib/workspace-system/server-data.ts", "getWorkspacePermissionSummary");
requireIncludes("src/components/workspace-system/workspace-empty-state.tsx", "WorkspaceEmptyState");
requireIncludes("src/components/workspace-system/workspace-empty-state.tsx", "WorkspaceHealthPanel");
requireIncludes("src/components/workspace-system/workspace-system-page.tsx", "WorkspaceMigrationEmptyState");
requireIncludes("src/components/workspace-system/workspace-right-panel.tsx", "WorkspaceHealthPanel");
requireIncludes("src/app/globals.css", "ft-ws-empty-state");
requireIncludes("src/app/globals.css", "ft-ws-health-panel");

requireIncludes("src/components/workspace-system/workspace-command-center.tsx", "WorkspaceCommandCenter");
requireIncludes("src/components/workspace-system/workspace-system-page.tsx", "setCommandCenterOpen");
requireIncludes("src/components/workspace-system/workspace-context-header.tsx", "onOpenCommandCenter");
requireIncludes("src/app/globals.css", "ft-ws-command-palette");

if (failures.length) {
  console.error("[workspace:doctor] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[workspace:doctor] OK — Workspace persistence, spaces, saved views, Home dashboard, permission UX, empty states, and QA health checks are present.");
if (warnings.length) {
  console.log("[workspace:doctor] Warnings:");
  for (const warning of warnings) console.log(`- ${warning}`);
}
