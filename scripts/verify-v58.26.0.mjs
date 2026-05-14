#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const expectedVersion = "58.26.0-workspace-production-readiness";
const expectedRelease = "v58.26.0 Workspace Production Readiness";
const exists = (rel) => fs.existsSync(path.join(root, rel));
const read = (rel) => exists(rel) ? fs.readFileSync(path.join(root, rel), "utf8") : "";
const requireFile = (rel) => { if (!exists(rel)) failures.push(`Missing required file: ${rel}`); };
const requireIncludes = (rel, text) => { if (!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); };

const pkg = JSON.parse(read("package.json"));
if (pkg.version !== expectedVersion) failures.push(`package version must be ${expectedVersion}`);
if ((pkg.scripts ?? {})["verify:current"] !== "npm run verify:v58.26.0") failures.push("verify:current must target verify:v58.26.0");
if ((pkg.scripts ?? {})["verify:v58.26.0"] !== "node scripts/verify-v58.26.0.mjs") failures.push("verify:v58.26.0 script missing");
if ((pkg.scripts ?? {})["workspace:production:ready"] !== "node scripts/workspace-production-readiness-check.mjs") failures.push("workspace:production:ready script missing");

requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedRelease);
requireIncludes("package-lock.json", expectedVersion);
requireIncludes("src/app/globals.css", "v58.26.0 — Workspace Production Readiness");

for (const rel of [
  "scripts/workspace-production-readiness-check.mjs",
  "scripts/workspace-persistence-doctor.mjs",
  "docs/release/V58_26_0_WORKSPACE_PRODUCTION_READINESS.md",
  "docs/qa/FLOWTASK_V58_26_0_WORKSPACE_PRODUCTION_READINESS_QA.md",
  "docs/qa/FLOWTASK_V58_26_0_WORKSPACE_PRODUCTION_CHECKLIST.md",
  "docs/release/FLOWTASK_WORKSPACE_MASTER_CONTEXT_V58_26_0.md",
  "src/components/workspace-system/workspace-command-center.tsx",
  "src/components/workspace-system/workspace-empty-state.tsx",
  "src/components/workspace-system/workspace-members-permissions.tsx",
  "src/components/workspace-system/workspace-spaces-manager.tsx",
  "src/components/workspace-system/workspace-saved-views-manager.tsx",
  "src/components/workspace-system/views/home-view.tsx",
  "supabase/migrations/0056_v58_25_9_workspace_persistence_foundation.sql",
  "supabase/migrations/0057_v58_25_9_4_workspace_space_project_assignments.sql",
  "supabase/migrations/0058_v58_25_9_5_project_views_home_view_support.sql"
]) requireFile(rel);

requireIncludes("docs/qa/FLOWTASK_V58_26_0_WORKSPACE_PRODUCTION_CHECKLIST.md", "/app/tasks");
requireIncludes("docs/qa/FLOWTASK_V58_26_0_WORKSPACE_PRODUCTION_CHECKLIST.md", "/app/projects");
requireIncludes("docs/qa/FLOWTASK_V58_26_0_WORKSPACE_PRODUCTION_CHECKLIST.md", "/app/boards");
requireIncludes("docs/qa/FLOWTASK_V58_26_0_WORKSPACE_PRODUCTION_CHECKLIST.md", "/app/reports");
requireIncludes("scripts/workspace-production-readiness-check.mjs", "workspace_space_projects");
requireIncludes("scripts/workspace-production-readiness-check.mjs", "Workspace Production Readiness");

if (failures.length) {
  console.error("[verify:v58.26.0] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[verify:v58.26.0] OK — Workspace Production Readiness aligned.");
