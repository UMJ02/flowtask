#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const expectedVersion = "58.25.9.4-workspace-spaces-manager-project-organization";
const expectedRelease = "v58.25.9.4 Workspace Spaces Manager + Project Organization";
const exists = (rel) => fs.existsSync(path.join(root, rel));
const read = (rel) => exists(rel) ? fs.readFileSync(path.join(root, rel), "utf8") : "";
const requireFile = (rel) => { if (!exists(rel)) failures.push(`Missing required file: ${rel}`); };
const requireIncludes = (rel, text) => { if (!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); };

const pkg = JSON.parse(read("package.json"));
if (pkg.version !== expectedVersion) failures.push(`package version must be ${expectedVersion}`);
if ((pkg.scripts ?? {})["verify:current"] !== "npm run verify:v58.25.9.4") failures.push("verify:current must target verify:v58.25.9.4");
if ((pkg.scripts ?? {})["verify:v58.25.9.4"] !== "node scripts/verify-v58.25.9.4.mjs") failures.push("verify:v58.25.9.4 script missing");

requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedRelease);
requireIncludes("package-lock.json", expectedVersion);

requireFile("supabase/migrations/0057_v58_25_9_4_workspace_space_project_assignments.sql");
requireIncludes("supabase/migrations/0057_v58_25_9_4_workspace_space_project_assignments.sql", "create table if not exists public.workspace_space_projects");
requireIncludes("supabase/migrations/0057_v58_25_9_4_workspace_space_project_assignments.sql", "workspace_space_projects_select_access");
requireIncludes("supabase/migrations/0057_v58_25_9_4_workspace_space_project_assignments.sql", "workspace_space_projects_write_access");
requireIncludes("supabase/migrations/0057_v58_25_9_4_workspace_space_project_assignments.sql", "drop trigger if exists workspace_space_projects_set_updated_at");

requireIncludes("src/lib/workspace-system/view-state.ts", "WorkspaceProjectSpaceAssignment");
requireIncludes("src/lib/workspace-system/server-data.ts", "getWorkspaceProjectSpaceAssignments");
requireIncludes("src/lib/workspace-system/server-data.ts", "workspace_space_projects");
requireIncludes("src/app/(app)/app/workspace/page.tsx", "projectSpaceAssignments");
requireIncludes("src/app/(app)/app/workspace/page.tsx", "assignedProjectIdsBySpace");
requireIncludes("src/components/workspace-system/workspace-spaces-manager.tsx", "Workspace Spaces Manager + Project Organization");
requireIncludes("src/components/workspace-system/workspace-spaces-manager.tsx", "from(\"workspace_spaces\")");
requireIncludes("src/components/workspace-system/workspace-spaces-manager.tsx", "from(\"workspace_space_projects\")");
requireIncludes("src/components/workspace-system/workspace-system-page.tsx", "WorkspaceSpacesManager");
requireIncludes("src/components/workspace-system/workspace-system-page.tsx", "Espacios");
requireIncludes("src/components/workspace-system/workspace-right-panel.tsx", "workspace_space_projects:");
requireIncludes("src/app/globals.css", "v58.25.9.4 Workspace Spaces Manager + Project Organization");
requireIncludes("src/app/globals.css", "ft-ws-spaces-manager");

requireFile("docs/release/V58_25_9_4_WORKSPACE_SPACES_MANAGER_PROJECT_ORGANIZATION.md");
requireFile("docs/qa/FLOWTASK_V58_25_9_4_WORKSPACE_SPACES_MANAGER_PROJECT_ORGANIZATION_QA.md");

if (failures.length) {
  console.error("[verify:v58.25.9.4] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[verify:v58.25.9.4] OK — Workspace spaces manager and project organization aligned.");
