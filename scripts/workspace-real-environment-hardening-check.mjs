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

const pkg = JSON.parse(read("package.json") || "{}");
if (pkg.version !== "58.26.2-workspace-performance-query-optimization") failures.push(`Unexpected package version: ${pkg.version}`);
if (pkg.scripts?.["workspace:real-env:ready"] !== "node scripts/workspace-real-environment-hardening-check.mjs") failures.push("workspace:real-env:ready script missing");
if (!String(pkg.scripts?.["build:preflight"] ?? "").includes("workspace:real-env:ready")) failures.push("build:preflight must include workspace:real-env:ready");

for (const rel of [
  "supabase/migrations/0056_v58_25_9_workspace_persistence_foundation.sql",
  "supabase/migrations/0057_v58_25_9_4_workspace_space_project_assignments.sql",
  "supabase/migrations/0058_v58_25_9_5_project_views_home_view_support.sql",
  "supabase/migrations/0059_v58_26_1_workspace_real_environment_hardening.sql",
  "docs/release/V58_26_1_WORKSPACE_PRODUCTION_QA_FIXES_REAL_ENVIRONMENT_HARDENING.md",
  "docs/qa/FLOWTASK_V58_26_1_WORKSPACE_REAL_ENVIRONMENT_QA.md",
  "docs/qa/FLOWTASK_V58_26_1_SUPABASE_REAL_ENVIRONMENT_CHECKLIST.md",
  "scripts/verify-v58.26.1.mjs",
  "scripts/workspace-real-environment-hardening-check.mjs",
]) requireFile(rel);

requireIncludes("supabase/migrations/0056_v58_25_9_workspace_persistence_foundation.sql", "drop trigger if exists workspace_spaces_set_updated_at");
requireIncludes("supabase/migrations/0056_v58_25_9_workspace_persistence_foundation.sql", "drop trigger if exists project_views_set_updated_at");
requireIncludes("supabase/migrations/0057_v58_25_9_4_workspace_space_project_assignments.sql", "drop trigger if exists workspace_space_projects_set_updated_at");
requireIncludes("supabase/migrations/0059_v58_26_1_workspace_real_environment_hardening.sql", "set_workspace_real_environment_updated_at");
requireIncludes("supabase/migrations/0059_v58_26_1_workspace_real_environment_hardening.sql", "drop trigger if exists workspace_spaces_set_updated_at");
requireIncludes("supabase/migrations/0059_v58_26_1_workspace_real_environment_hardening.sql", "drop trigger if exists project_views_set_updated_at");
requireIncludes("supabase/migrations/0059_v58_26_1_workspace_real_environment_hardening.sql", "drop trigger if exists workspace_space_projects_set_updated_at");
requireIncludes("supabase/migrations/0059_v58_26_1_workspace_real_environment_hardening.sql", "view_type in ('home','list','board','timeline','table','canvas','files','reports')");
requireIncludes("src/lib/release/version.ts", "58.26.2-workspace-performance-query-optimization");
requireIncludes("src/lib/release/version.ts", "v58.26.2 Workspace Performance + Query Optimization");
requireIncludes("src/app/globals.css", "v58.26.2 — Workspace Performance + Query Optimization");
requireIncludes("package-lock.json", "58.26.2-workspace-performance-query-optimization");

const nvmrc = read(".nvmrc").trim();
if (nvmrc !== "20") warnings.push(`.nvmrc is '${nvmrc}', expected Node 20 for deploy parity.`);

const envExample = read(".env.example");
for (const env of ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY", "NEXT_PUBLIC_APP_URL"]) {
  if (!envExample.includes(env)) warnings.push(`.env.example should mention ${env}.`);
}

if (failures.length) {
  console.error("[workspace:real-env:ready] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[workspace:real-env:ready] OK — real environment hardening, idempotent triggers, and Supabase QA assets are aligned.");
if (warnings.length) {
  console.log("[workspace:real-env:ready] Warnings:");
  for (const warning of warnings) console.log(`- ${warning}`);
}
