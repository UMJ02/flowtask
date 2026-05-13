#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const expectedVersion = "58.25.9.2-workspace-persistence-qa-supabase-migration-guard";
const expectedRelease = "v58.25.9.2 Workspace Persistence QA + Supabase Migration Guard";
const exists = (rel) => fs.existsSync(path.join(root, rel));
const read = (rel) => exists(rel) ? fs.readFileSync(path.join(root, rel), "utf8") : "";
const requireFile = (rel) => { if (!exists(rel)) failures.push(`Missing required file: ${rel}`); };
const requireIncludes = (rel, text) => { if (!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); };

const pkg = JSON.parse(read("package.json"));
if (pkg.version !== expectedVersion) failures.push(`package version must be ${expectedVersion}`);
if ((pkg.scripts ?? {})["verify:current"] !== "npm run verify:v58.25.9.2") failures.push("verify:current must target verify:v58.25.9.2");
if ((pkg.scripts ?? {})["verify:v58.25.9.2"] !== "node scripts/verify-v58.25.9.2.mjs") failures.push("verify:v58.25.9.2 script missing");
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
requireIncludes("src/app/(app)/app/workspace/page.tsx", "persistenceStatus={persistenceGuard");
requireIncludes("src/components/workspace-system/workspace-system-page.tsx", "persistenceStatus");
requireIncludes("src/components/workspace-system/workspace-saved-views-manager.tsx", "Migration Guard");
requireIncludes("src/components/workspace-system/workspace-saved-views-manager.tsx", "persistenceStatus.projectViewsReady");
requireIncludes("src/components/workspace-system/workspace-right-panel.tsx", "persistenceStatus.message");
requireIncludes("src/components/workspace-system/workspace-right-panel.tsx", "workspace_spaces:");
requireIncludes("supabase/migrations/0056_v58_25_9_workspace_persistence_foundation.sql", "create table if not exists public.workspace_spaces");
requireIncludes("supabase/migrations/0056_v58_25_9_workspace_persistence_foundation.sql", "create table if not exists public.project_views");

requireFile("docs/release/V58_25_9_2_WORKSPACE_PERSISTENCE_QA_SUPABASE_MIGRATION_GUARD.md");
requireFile("docs/qa/FLOWTASK_V58_25_9_2_WORKSPACE_PERSISTENCE_QA_SUPABASE_MIGRATION_GUARD_QA.md");
requireIncludes("src/app/globals.css", "v58.25.9.2 Workspace Persistence QA + Supabase Migration Guard");
requireIncludes("src/app/globals.css", "ft-ws-migration-guard");

if (failures.length) {
  console.error("[verify:v58.25.9.2] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[verify:v58.25.9.2] OK — Workspace persistence QA and Supabase migration guard aligned.");
