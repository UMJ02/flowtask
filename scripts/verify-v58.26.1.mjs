#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const expectedVersion = "58.26.1-workspace-production-qa-fixes-real-environment-hardening";
const expectedRelease = "v58.26.1 Workspace Production QA Fixes + Real Environment Hardening";
const exists = (rel) => fs.existsSync(path.join(root, rel));
const read = (rel) => exists(rel) ? fs.readFileSync(path.join(root, rel), "utf8") : "";
const requireFile = (rel) => { if (!exists(rel)) failures.push(`Missing required file: ${rel}`); };
const requireIncludes = (rel, text) => { if (!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); };

const pkg = JSON.parse(read("package.json") || "{}");
if (pkg.version !== expectedVersion) failures.push(`package version must be ${expectedVersion}`);
if ((pkg.scripts ?? {})["verify:current"] !== "npm run verify:v58.26.1") failures.push("verify:current must target verify:v58.26.1");
if ((pkg.scripts ?? {})["verify:v58.26.1"] !== "node scripts/verify-v58.26.1.mjs") failures.push("verify:v58.26.1 script missing");
if ((pkg.scripts ?? {})["workspace:real-env:ready"] !== "node scripts/workspace-real-environment-hardening-check.mjs") failures.push("workspace:real-env:ready script missing");

requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedRelease);
requireIncludes("package-lock.json", expectedVersion);
requireIncludes("src/app/globals.css", "v58.26.1 — Workspace Production QA Fixes + Real Environment Hardening");

for (const rel of [
  "scripts/verify-v58.26.1.mjs",
  "scripts/workspace-real-environment-hardening-check.mjs",
  "scripts/workspace-production-readiness-check.mjs",
  "scripts/workspace-persistence-doctor.mjs",
  "supabase/migrations/0056_v58_25_9_workspace_persistence_foundation.sql",
  "supabase/migrations/0057_v58_25_9_4_workspace_space_project_assignments.sql",
  "supabase/migrations/0058_v58_25_9_5_project_views_home_view_support.sql",
  "supabase/migrations/0059_v58_26_1_workspace_real_environment_hardening.sql",
  "docs/release/V58_26_1_WORKSPACE_PRODUCTION_QA_FIXES_REAL_ENVIRONMENT_HARDENING.md",
  "docs/qa/FLOWTASK_V58_26_1_WORKSPACE_REAL_ENVIRONMENT_QA.md",
  "docs/qa/FLOWTASK_V58_26_1_SUPABASE_REAL_ENVIRONMENT_CHECKLIST.md",
  "src/app/(app)/app/workspace/page.tsx",
  "src/components/workspace-system/workspace-system-page.tsx",
  "src/components/workspace-system/workspace-right-panel.tsx",
  "src/components/workspace-system/workspace-command-center.tsx",
  "src/components/workspace-system/workspace-empty-state.tsx",
  "src/components/workspace-system/views/home-view.tsx",
]) requireFile(rel);

requireIncludes("supabase/migrations/0059_v58_26_1_workspace_real_environment_hardening.sql", "workspace_spaces_set_updated_at");
requireIncludes("supabase/migrations/0059_v58_26_1_workspace_real_environment_hardening.sql", "project_views_set_updated_at");
requireIncludes("supabase/migrations/0059_v58_26_1_workspace_real_environment_hardening.sql", "workspace_space_projects_set_updated_at");
requireIncludes("scripts/workspace-real-environment-hardening-check.mjs", "workspace:real-env:ready");
requireIncludes("docs/qa/FLOWTASK_V58_26_1_SUPABASE_REAL_ENVIRONMENT_CHECKLIST.md", "workspace_spaces_set_updated_at");
requireIncludes("docs/qa/FLOWTASK_V58_26_1_SUPABASE_REAL_ENVIRONMENT_CHECKLIST.md", "project_views_view_type_check");
requireIncludes("README.md", "v58.26.1");

if (failures.length) {
  console.error("[verify:v58.26.1] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[verify:v58.26.1] OK — Workspace Production QA Fixes + Real Environment Hardening aligned.");
