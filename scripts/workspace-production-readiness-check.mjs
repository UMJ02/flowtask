#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const warnings = [];
const exists = (rel) => fs.existsSync(path.join(root, rel));
const read = (rel) => exists(rel) ? fs.readFileSync(path.join(root, rel), "utf8") : "";
const requireFile = (rel) => { if (!exists(rel)) failures.push(`Missing required file: ${rel}`); };
const requireIncludes = (rel, text) => { if (!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); };

const requiredFiles = [
  "src/app/(app)/app/workspace/page.tsx",
  "src/components/workspace-system/workspace-system-page.tsx",
  "src/components/workspace-system/workspace-sidebar-pro.tsx",
  "src/components/workspace-system/workspace-context-header.tsx",
  "src/components/workspace-system/workspace-view-tabs.tsx",
  "src/components/workspace-system/workspace-command-center.tsx",
  "src/components/workspace-system/workspace-empty-state.tsx",
  "src/components/workspace-system/workspace-right-panel.tsx",
  "src/components/workspace-system/workspace-saved-views-manager.tsx",
  "src/components/workspace-system/workspace-spaces-manager.tsx",
  "src/components/workspace-system/workspace-members-permissions.tsx",
  "src/components/workspace-system/workspace-quick-create.tsx",
  "src/components/workspace-system/workspace-files-upload-entry.tsx",
  "src/components/workspace-system/workspace-activity-timeline.tsx",
  "src/components/workspace-system/views/home-view.tsx",
  "src/components/workspace-system/views/list-view.tsx",
  "src/components/workspace-system/views/board-view.tsx",
  "src/components/workspace-system/views/timeline-view.tsx",
  "src/components/workspace-system/views/table-view.tsx",
  "src/components/workspace-system/views/canvas-view.tsx",
  "src/components/workspace-system/views/files-view.tsx",
  "src/components/workspace-system/views/reports-view.tsx",
  "src/lib/workspace-system/server-data.ts",
  "src/lib/workspace-system/adapters.ts",
  "src/lib/workspace-system/view-state.ts",
  "supabase/migrations/0056_v58_25_9_workspace_persistence_foundation.sql",
  "supabase/migrations/0057_v58_25_9_4_workspace_space_project_assignments.sql",
  "supabase/migrations/0058_v58_25_9_5_project_views_home_view_support.sql",
  "docs/release/V58_26_1_WORKSPACE_PRODUCTION_QA_FIXES_REAL_ENVIRONMENT_HARDENING.md",
  "docs/qa/FLOWTASK_V58_26_1_WORKSPACE_REAL_ENVIRONMENT_QA.md",
  "docs/qa/FLOWTASK_V58_26_1_SUPABASE_REAL_ENVIRONMENT_CHECKLIST.md",
  "docs/release/FLOWTASK_WORKSPACE_MASTER_CONTEXT_V58_26_0.md",
  "scripts/workspace-persistence-doctor.mjs",
  "scripts/workspace-production-readiness-check.mjs",
  "scripts/workspace-real-environment-hardening-check.mjs",
  "supabase/migrations/0059_v58_26_1_workspace_real_environment_hardening.sql"
];
for (const rel of requiredFiles) requireFile(rel);

const pkg = JSON.parse(read("package.json"));
if (pkg.version !== "58.27.1-release-candidate-fixes") failures.push(`Unexpected package version: ${pkg.version}`);
if (pkg.scripts?.["verify:current"] !== "npm run verify:v58.27.1") failures.push("verify:current must target verify:v58.27.1");
if (pkg.scripts?.["workspace:doctor"] !== "node scripts/workspace-persistence-doctor.mjs") failures.push("workspace:doctor script missing");
if (pkg.scripts?.["workspace:production:ready"] !== "node scripts/workspace-production-readiness-check.mjs") failures.push("workspace:production:ready script missing");
if (pkg.scripts?.["workspace:real-env:ready"] !== "node scripts/workspace-real-environment-hardening-check.mjs") failures.push("workspace:real-env:ready script missing");

requireIncludes("src/lib/release/version.ts", "58.27.1-release-candidate-fixes");
requireIncludes("src/lib/release/version.ts", "v58.27.1 Release Candidate Fixes");
requireIncludes("package-lock.json", "58.27.1-release-candidate-fixes");
requireIncludes("src/app/globals.css", "v58.27.1 — Release Candidate Fixes");
requireIncludes("src/app/(app)/app/workspace/page.tsx", "getWorkspaceIdentity");
requireIncludes("src/app/(app)/app/workspace/page.tsx", "getWorkspacePersistenceGuardStatus");
requireIncludes("src/app/(app)/app/workspace/page.tsx", "getWorkspaceProjectSpaceAssignments");
requireIncludes("src/app/(app)/app/workspace/page.tsx", "getWorkspacePermissionSummary");
requireIncludes("src/components/workspace-system/workspace-system-page.tsx", "WorkspaceCommandCenter");
requireIncludes("src/components/workspace-system/workspace-system-page.tsx", "WorkspaceSavedViewsManager");
requireIncludes("src/components/workspace-system/workspace-system-page.tsx", "WorkspaceSpacesManager");
requireIncludes("src/components/workspace-system/workspace-system-page.tsx", "HomeView");
requireIncludes("src/components/workspace-system/workspace-right-panel.tsx", "WorkspaceHealthPanel");
requireIncludes("src/components/workspace-system/workspace-saved-views-manager.tsx", "persistenceStatus.projectViewsReady");
requireIncludes("src/components/workspace-system/workspace-spaces-manager.tsx", "workspace_space_projects");
requireIncludes("src/components/workspace-system/workspace-command-center.tsx", "⌘K");
requireIncludes("src/components/workspace-system/workspace-empty-state.tsx", "WorkspaceMigrationEmptyState");
requireIncludes("src/components/workspace-system/workspace-members-permissions.tsx", "WorkspacePermissionBanner");
requireIncludes("src/components/workspace-system/workspace-files-upload-entry.tsx", "attachments");
requireIncludes("supabase/migrations/0056_v58_25_9_workspace_persistence_foundation.sql", "workspace_spaces");
requireIncludes("supabase/migrations/0057_v58_25_9_4_workspace_space_project_assignments.sql", "workspace_space_projects");
requireIncludes("supabase/migrations/0058_v58_25_9_5_project_views_home_view_support.sql", "'home'");

for (const legacy of ["/app/tasks", "/app/projects", "/app/boards", "/app/reports"]) {
  if (!read("docs/qa/FLOWTASK_V58_26_1_SUPABASE_REAL_ENVIRONMENT_CHECKLIST.md").includes(legacy)) {
    warnings.push(`Checklist should mention legacy route QA for ${legacy}`);
  }
}

if (failures.length) {
  console.error("[workspace:production:ready] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("[workspace:production:ready] OK — Workspace Production Readiness checks are aligned.");
if (warnings.length) {
  console.log("[workspace:production:ready] Warnings:");
  for (const warning of warnings) console.log(`- ${warning}`);
}

