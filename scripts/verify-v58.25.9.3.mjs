#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const expectedVersion = "58.25.9.3-workspace-saved-views-defaults-filters-persistence";
const expectedRelease = "v58.25.9.3 Workspace Saved Views Defaults + Filters Persistence";
const exists = (rel) => fs.existsSync(path.join(root, rel));
const read = (rel) => exists(rel) ? fs.readFileSync(path.join(root, rel), "utf8") : "";
const requireFile = (rel) => { if (!exists(rel)) failures.push(`Missing required file: ${rel}`); };
const requireIncludes = (rel, text) => { if (!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); };

const pkg = JSON.parse(read("package.json"));
if (pkg.version !== expectedVersion) failures.push(`package version must be ${expectedVersion}`);
if ((pkg.scripts ?? {})["verify:current"] !== "npm run verify:v58.25.9.3") failures.push("verify:current must target verify:v58.25.9.3");
if ((pkg.scripts ?? {})["verify:v58.25.9.3"] !== "node scripts/verify-v58.25.9.3.mjs") failures.push("verify:v58.25.9.3 script missing");
if ((pkg.scripts ?? {})["workspace:doctor"] !== "node scripts/workspace-persistence-doctor.mjs") failures.push("workspace:doctor script missing");

requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedRelease);
requireIncludes("package-lock.json", expectedVersion);

requireFile("scripts/workspace-persistence-doctor.mjs");
requireIncludes("src/lib/workspace-system/view-state.ts", "WorkspacePersistenceGuardStatus");
requireIncludes("src/lib/workspace-system/server-data.ts", "getWorkspacePersistenceGuardStatus");
requireIncludes("src/lib/workspace-system/server-data.ts", "isMissingPersistenceRelation");
requireIncludes("src/lib/workspace-system/server-data.ts", "Migration 0056 has not been applied yet");
requireIncludes("src/app/(app)/app/workspace/page.tsx", "persistenceGuard?.workspaceSpacesReady");
requireIncludes("src/app/(app)/app/workspace/page.tsx", "persistenceGuard?.projectViewsReady");
requireIncludes("src/app/(app)/app/workspace/page.tsx", "persistenceStatus=");
requireIncludes("src/components/workspace-system/workspace-system-page.tsx", "persistenceStatus");
requireIncludes("src/components/workspace-system/workspace-saved-views-manager.tsx", "Migration Guard");
requireIncludes("src/components/workspace-system/workspace-saved-views-manager.tsx", "persistenceStatus.projectViewsReady");
requireIncludes("src/components/workspace-system/workspace-right-panel.tsx", "persistenceStatus.message");
requireIncludes("src/components/workspace-system/workspace-right-panel.tsx", "workspace_spaces:");
requireIncludes("supabase/migrations/0056_v58_25_9_workspace_persistence_foundation.sql", "create table if not exists public.workspace_spaces");
requireIncludes("supabase/migrations/0056_v58_25_9_workspace_persistence_foundation.sql", "create table if not exists public.project_views");


requireIncludes("src/app/(app)/app/workspace/page.tsx", "requestedSavedViewId");
requireIncludes("src/app/(app)/app/workspace/page.tsx", "defaultSavedView");
requireIncludes("src/app/(app)/app/workspace/page.tsx", "effectiveGroupBy");
requireIncludes("src/app/(app)/app/workspace/page.tsx", "effectiveSort");
requireIncludes("src/components/workspace-system/workspace-system-page.tsx", "groupByParam");
requireIncludes("src/components/workspace-system/workspace-system-page.tsx", "sortParam");
requireIncludes("src/components/workspace-system/workspace-saved-views-manager.tsx", "applySavedViewParams");
requireIncludes("src/components/workspace-system/workspace-saved-views-manager.tsx", "Workspace Saved Views Defaults + Filters Persistence");
requireIncludes("src/components/workspace-system/workspace-view-tabs.tsx", "ft-ws-view-default-dot");

requireFile("docs/release/V58_25_9_3_WORKSPACE_SAVED_VIEWS_DEFAULTS_FILTERS_PERSISTENCE.md");
requireFile("docs/qa/FLOWTASK_V58_25_9_3_WORKSPACE_SAVED_VIEWS_DEFAULTS_FILTERS_PERSISTENCE_QA.md");
requireIncludes("src/app/globals.css", "v58.25.9.3 Workspace Saved Views Defaults + Filters Persistence");
requireIncludes("src/app/globals.css", "ft-ws-migration-guard");

if (failures.length) {
  console.error("[verify:v58.25.9.3] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[verify:v58.25.9.3] OK — Workspace saved views defaults and filters persistence aligned.");
