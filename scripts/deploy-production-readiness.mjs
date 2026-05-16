#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const expectedVersion = "58.27.1-release-candidate-fixes";

function exists(rel) { return fs.existsSync(path.join(root, rel)); }
function read(rel) { return exists(rel) ? fs.readFileSync(path.join(root, rel), "utf8") : ""; }
function requireFile(rel) { if (!exists(rel)) failures.push(`Missing required file: ${rel}`); }
function requireIncludes(rel, text) { if (!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); }
function requireNotIncludes(rel, text) { if (read(rel).includes(text)) failures.push(`Did not expect '${text}' in ${rel}`); }

for (const rel of [
  "package.json",
  "package-lock.json",
  "vercel.json",
  "next.config.ts",
  ".nvmrc",
  ".env.example",
  "scripts/runtime-check.mjs",
  "scripts/validate-env.mjs",
  "scripts/design-doctor.mjs",
  "scripts/density-guard.mjs",
  "scripts/verify-v58.27.1.mjs",
  "scripts/workspace-persistence-doctor.mjs",
  "docs/release/V58_26_5_WORKSPACE_ERROR_RECOVERY_FINAL_QA_HARDENING.md",
  "docs/qa/FLOWTASK_V58_26_5_WORKSPACE_ERROR_RECOVERY_FINAL_QA.md",
  "src/components/boards/boards-home.tsx",
  "src/components/notifications/notifications-command-center.tsx",
  "src/app/(app)/app/workspace/page.tsx",
  "src/components/workspace-system/workspace-system-page.tsx",
  "src/components/workspace-system/workspace-empty-state.tsx",
  "src/components/workspace-system/workspace-command-center.tsx",
  "src/components/workspace-system/workspace-sidebar-pro.tsx",
  "src/components/workspace-system/workspace-view-tabs.tsx",
  "src/components/workspace-system/views/home-view.tsx",
  "src/components/workspace-system/views/list-view.tsx",
  "src/components/workspace-system/views/board-view.tsx",
  "src/components/workspace-system/views/timeline-view.tsx",
  "src/components/workspace-system/views/table-view.tsx",
  "src/components/workspace-system/views/canvas-view.tsx",
  "src/components/workspace-system/views/reports-view.tsx",
  "src/components/workspace-system/views/files-view.tsx",
  "src/app/globals.css"
]) requireFile(rel);

const pkg = JSON.parse(read("package.json"));
const scripts = pkg.scripts ?? {};
if (pkg.version !== expectedVersion) failures.push(`Unexpected package version: ${pkg.version}`);
if (scripts["verify:current"] !== "npm run verify:v58.27.1") failures.push("verify:current must target verify:v58.27.1");
if (scripts["verify:v58.27.1"] !== "node scripts/verify-v58.27.1.mjs") failures.push("verify:v58.27.1 must target scripts/verify-v58.27.1.mjs");

const vercel = JSON.parse(read("vercel.json"));
if (vercel.framework !== "nextjs") failures.push("vercel.json framework must be nextjs");
if (vercel.buildCommand !== "npm run vercel:build") failures.push("vercel.json buildCommand must be npm run vercel:build");

requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("package-lock.json", expectedVersion);
requireIncludes("src/components/boards/boards-home.tsx", "board-home-hero-compact-actions");
requireIncludes("src/components/boards/boards-home.tsx", "board-home-create-preview-red");
requireIncludes("src/components/notifications/notifications-command-center.tsx", "ft-notifications-hero-balanced");
requireIncludes("src/app/globals.css", "v58.27.1 — Release Candidate Fixes");
requireIncludes("src/app/(app)/app/workspace/page.tsx", "getTasks({ includeCompleted: true })");
requireIncludes("src/app/(app)/app/workspace/page.tsx", "getWorkspaceIdentity()");
requireIncludes("src/app/(app)/app/workspace/page.tsx", "invalidProjectId");
requireIncludes("src/components/workspace-system/workspace-sidebar-pro.tsx", "Espacios reales");
requireIncludes("src/components/workspace-system/workspace-view-tabs.tsx", "router.replace(`/app/workspace?");
requireIncludes("src/app/(app)/app/workspace/page.tsx", "getWorkspaceActivity");
requireIncludes("src/app/(app)/app/workspace/page.tsx", "getWorkspaceFiles");
requireIncludes("src/components/workspace-system/workspace-right-panel.tsx", "Línea de actividad");
requireIncludes("src/components/workspace-system/views/files-view.tsx", "Adjuntos recientes");
requireIncludes("src/components/workspace-system/views/files-view.tsx", "WorkspaceFilesUploadEntry");
requireFile("src/components/workspace-system/workspace-files-upload-entry.tsx");
requireFile("src/components/workspace-system/workspace-activity-timeline.tsx");
requireIncludes("src/components/workspace-system/workspace-right-panel.tsx", "WorkspaceActivityTimeline");
requireIncludes("src/components/workspace-system/workspace-files-upload-entry.tsx", `supabase.storage.from("attachments").upload`);
requireIncludes("src/components/workspace-system/workspace-files-upload-entry.tsx", `supabase.from("attachments").insert`);
requireIncludes("src/app/globals.css", "ft-ws-upload-entry");
requireIncludes("src/app/globals.css", "ft-ws-activity-timeline");
requireIncludes("src/app/globals.css", "ft-ws-file-card");

requireFile("supabase/migrations/0056_v58_25_9_workspace_persistence_foundation.sql");
requireIncludes("src/lib/workspace-system/server-data.ts", "getWorkspacePersistedSpaces");
requireIncludes("src/lib/workspace-system/server-data.ts", "getWorkspaceProjectViews");
requireIncludes("src/components/workspace-system/workspace-right-panel.tsx", "Persistencia Workspace");
requireFile("src/components/workspace-system/workspace-saved-views-manager.tsx");
requireIncludes("src/components/workspace-system/workspace-saved-views-manager.tsx", "Saved Views Manager");
requireIncludes("src/components/workspace-system/workspace-saved-views-manager.tsx", "from(\"project_views\")");
requireIncludes("src/components/workspace-system/workspace-system-page.tsx", "WorkspaceSavedViewsManager");
requireIncludes("src/components/workspace-system/workspace-system-page.tsx", "Vistas guardadas");
requireIncludes("src/app/globals.css", "ft-ws-saved-views-manager");
requireIncludes("src/app/globals.css", "ft-ws-migration-guard");
requireIncludes("src/lib/workspace-system/server-data.ts", "getWorkspacePersistenceGuardStatus");
requireIncludes("src/components/workspace-system/workspace-saved-views-manager.tsx", "Migration Guard");
requireIncludes("src/components/workspace-system/workspace-right-panel.tsx", "persistenceStatus.message");

requireFile("supabase/migrations/0057_v58_25_9_4_workspace_space_project_assignments.sql");
requireIncludes("src/lib/workspace-system/server-data.ts", "getWorkspaceProjectSpaceAssignments");
requireIncludes("src/components/workspace-system/workspace-spaces-manager.tsx", "Workspace Spaces Manager + Project Organization");
requireIncludes("src/components/workspace-system/workspace-system-page.tsx", "WorkspaceSpacesManager");
requireIncludes("src/app/globals.css", "ft-ws-spaces-manager");
requireFile("supabase/migrations/0058_v58_25_9_5_project_views_home_view_support.sql");
requireFile("supabase/migrations/0059_v58_26_1_workspace_real_environment_hardening.sql");
requireIncludes("supabase/migrations/0058_v58_25_9_5_project_views_home_view_support.sql", "project_views_view_type_check");
requireIncludes("supabase/migrations/0059_v58_26_1_workspace_real_environment_hardening.sql", "set_workspace_real_environment_updated_at");
requireIncludes("src/lib/workspace-system/view-state.ts", "\"home\"");
requireIncludes("src/lib/workspace-system/adapters.ts", "\"home\"");
requireIncludes("src/components/workspace-system/views/home-view.tsx", "Home operativo");
requireIncludes("src/components/workspace-system/views/home-view.tsx", "Tareas importantes y próximas fechas");
requireIncludes("src/components/workspace-system/workspace-system-page.tsx", "HomeView");
requireFile("src/components/workspace-system/workspace-members-permissions.tsx");
requireIncludes("src/components/workspace-system/workspace-system-page.tsx", "permissions.canCreateTask");
requireIncludes("src/lib/workspace-system/server-data.ts", "getWorkspacePermissionSummary");
requireIncludes("src/components/workspace-system/workspace-view-tabs.tsx", "label: \"Home\"");
requireIncludes("src/components/workspace-system/workspace-sidebar-pro.tsx", "Home del proyecto");
requireIncludes("src/app/globals.css", "ft-ws-home-hero");
requireIncludes("src/components/workspace-system/workspace-empty-state.tsx", "WorkspaceEmptyState");
requireIncludes("src/components/workspace-system/workspace-empty-state.tsx", "WorkspaceHealthPanel");
requireIncludes("src/components/workspace-system/workspace-system-page.tsx", "WorkspaceMigrationEmptyState");
requireIncludes("src/components/workspace-system/workspace-system-page.tsx", "Workspace sin proyectos visibles");
requireIncludes("src/components/workspace-system/workspace-right-panel.tsx", "WorkspaceHealthPanel");
requireIncludes("src/components/workspace-system/views/files-view.tsx", "WorkspacePermissionEmptyState");
requireIncludes("src/components/workspace-system/views/timeline-view.tsx", "Timeline sin fechas");
requireIncludes("src/components/workspace-system/views/reports-view.tsx", "Reportes sin tareas visibles");
requireIncludes("src/app/globals.css", "ft-ws-empty-state");
requireIncludes("src/app/globals.css", "ft-ws-health-panel");
requireIncludes("src/components/workspace-system/workspace-command-center.tsx", "WorkspaceCommandCenter");
requireIncludes("src/components/workspace-system/workspace-command-center.tsx", "Buscar tareas, proyectos, espacios, vistas, pizarras o acciones");
requireIncludes("src/components/workspace-system/workspace-system-page.tsx", "setCommandCenterOpen");
requireIncludes("src/components/workspace-system/workspace-context-header.tsx", "onOpenCommandCenter");
requireIncludes("src/app/globals.css", "ft-ws-command-palette");
requireIncludes("src/app/globals.css", "ft-ws-command-trigger");

if (failures.length) {
  console.error("[deploy-production-readiness] Failed checks:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[deploy-production-readiness] OK — v58.27.1 client final release candidate aligned.");
