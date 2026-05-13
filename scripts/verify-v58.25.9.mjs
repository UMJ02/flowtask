#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const expectedVersion = "58.25.9-workspace-persistence-foundation";
const expectedRelease = "v58.25.9 Workspace Persistence Foundation";
const exists = (rel) => fs.existsSync(path.join(root, rel));
const read = (rel) => exists(rel) ? fs.readFileSync(path.join(root, rel), "utf8") : "";
const requireFile = (rel) => { if (!exists(rel)) failures.push(`Missing required file: ${rel}`); };
const requireIncludes = (rel, text) => { if (!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); };

const pkg = JSON.parse(read("package.json"));
if (pkg.version !== expectedVersion) failures.push(`package version must be ${expectedVersion}`);
if ((pkg.scripts ?? {})["verify:current"] !== "npm run verify:v58.25.9") failures.push("verify:current must target verify:v58.25.9");
if ((pkg.scripts ?? {})["verify:v58.25.9"] !== "node scripts/verify-v58.25.9.mjs") failures.push("verify:v58.25.9 script missing");

requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedRelease);
requireIncludes("package-lock.json", expectedVersion);

requireFile("supabase/migrations/0056_v58_25_9_workspace_persistence_foundation.sql");
requireIncludes("supabase/migrations/0056_v58_25_9_workspace_persistence_foundation.sql", "create table if not exists public.workspace_spaces");
requireIncludes("supabase/migrations/0056_v58_25_9_workspace_persistence_foundation.sql", "create table if not exists public.project_views");
requireIncludes("supabase/migrations/0056_v58_25_9_workspace_persistence_foundation.sql", "alter table public.workspace_spaces enable row level security");
requireIncludes("supabase/migrations/0056_v58_25_9_workspace_persistence_foundation.sql", "alter table public.project_views enable row level security");
requireIncludes("supabase/migrations/0056_v58_25_9_workspace_persistence_foundation.sql", "workspace_spaces_select_access");
requireIncludes("supabase/migrations/0056_v58_25_9_workspace_persistence_foundation.sql", "project_views_select_access");

requireIncludes("src/lib/workspace-system/view-state.ts", "WorkspaceProjectViewPreference");
requireIncludes("src/lib/workspace-system/view-state.ts", "isPersisted");
requireIncludes("src/lib/workspace-system/server-data.ts", "getWorkspacePersistedSpaces");
requireIncludes("src/lib/workspace-system/server-data.ts", "getWorkspaceProjectViews");
requireIncludes("src/app/(app)/app/workspace/page.tsx", "getWorkspacePersistedSpaces");
requireIncludes("src/app/(app)/app/workspace/page.tsx", "getWorkspaceProjectViews");
requireIncludes("src/app/(app)/app/workspace/page.tsx", "persistedSpaces.length");
requireIncludes("src/components/workspace-system/workspace-system-page.tsx", "projectViews={projectViews}");
requireIncludes("src/components/workspace-system/workspace-view-tabs.tsx", "ft-ws-view-saved-dot");
requireIncludes("src/components/workspace-system/workspace-right-panel.tsx", "Persistencia Workspace");
requireIncludes("src/components/workspace-system/workspace-sidebar-pro.tsx", "Espacios reales / guardados");
requireIncludes("src/app/globals.css", "v58.25.9 Workspace Persistence Foundation");
requireIncludes("src/app/globals.css", "ft-ws-view-saved-dot");

requireFile("docs/release/V58_25_9_WORKSPACE_PERSISTENCE_FOUNDATION.md");
requireFile("docs/qa/FLOWTASK_V58_25_9_WORKSPACE_PERSISTENCE_FOUNDATION_QA.md");

if (failures.length) {
  console.error("[verify:v58.25.9] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[verify:v58.25.9] OK — Workspace persistence foundation aligned.");
