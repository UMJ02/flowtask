#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const expectedVersion = "58.25.9.1-workspace-persistence-ui-saved-views-manager";
const expectedRelease = "v58.25.9.1 Workspace Persistence UI + Saved Views Manager";
const exists = (rel) => fs.existsSync(path.join(root, rel));
const read = (rel) => exists(rel) ? fs.readFileSync(path.join(root, rel), "utf8") : "";
const requireFile = (rel) => { if (!exists(rel)) failures.push(`Missing required file: ${rel}`); };
const requireIncludes = (rel, text) => { if (!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); };

const pkg = JSON.parse(read("package.json"));
if (pkg.version !== expectedVersion) failures.push(`package version must be ${expectedVersion}`);
if ((pkg.scripts ?? {})["verify:current"] !== "npm run verify:v58.25.9.1") failures.push("verify:current must target verify:v58.25.9.1");
if ((pkg.scripts ?? {})["verify:v58.25.9.1"] !== "node scripts/verify-v58.25.9.1.mjs") failures.push("verify:v58.25.9.1 script missing");

requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedRelease);
requireIncludes("package-lock.json", expectedVersion);

requireFile("src/components/workspace-system/workspace-saved-views-manager.tsx");
requireIncludes("src/components/workspace-system/workspace-saved-views-manager.tsx", "WorkspaceSavedViewsManager");
requireIncludes("src/components/workspace-system/workspace-saved-views-manager.tsx", "supabase.from(\"project_views\").insert");
requireIncludes("src/components/workspace-system/workspace-saved-views-manager.tsx", "supabase.from(\"project_views\").update");
requireIncludes("src/components/workspace-system/workspace-saved-views-manager.tsx", "supabase.from(\"project_views\").delete");
requireIncludes("src/components/workspace-system/workspace-saved-views-manager.tsx", "Saved Views Manager");

requireIncludes("src/components/workspace-system/workspace-system-page.tsx", "WorkspaceSavedViewsManager");
requireIncludes("src/components/workspace-system/workspace-system-page.tsx", "Vistas guardadas");
requireIncludes("src/components/workspace-system/workspace-view-tabs.tsx", "ft-ws-view-saved-dot");
requireIncludes("src/lib/workspace-system/server-data.ts", "getWorkspaceProjectViews");
requireIncludes("supabase/migrations/0056_v58_25_9_workspace_persistence_foundation.sql", "create table if not exists public.project_views");

requireIncludes("src/app/globals.css", "v58.25.9.1 Workspace Persistence UI + Saved Views Manager");
requireIncludes("src/app/globals.css", "ft-ws-saved-views-manager");
requireIncludes("src/app/globals.css", "ft-ws-saved-view-card");

requireFile("docs/release/V58_25_9_1_WORKSPACE_PERSISTENCE_UI_SAVED_VIEWS_MANAGER.md");
requireFile("docs/qa/FLOWTASK_V58_25_9_1_WORKSPACE_PERSISTENCE_UI_SAVED_VIEWS_MANAGER_QA.md");

if (failures.length) {
  console.error("[verify:v58.25.9.1] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[verify:v58.25.9.1] OK — Workspace persistence UI and saved views manager aligned.");
