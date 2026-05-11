#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const expectedVersion = "58.24.9-workspace-data-isolation-organization-lifecycle-hardening";
const expectedReleaseLabel = "v58.24.9 Workspace Data Isolation + Organization Lifecycle Hardening";

function exists(rel){ return fs.existsSync(path.join(root, rel)); }
function read(rel){ return exists(rel) ? fs.readFileSync(path.join(root, rel), "utf8") : ""; }
function requireFile(rel){ if(!exists(rel)) failures.push(`Missing required file: ${rel}`); }
function requireIncludes(rel, text){ if(!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); }

for (const rel of [
  "package.json","package-lock.json","vercel.json","next.config.ts",".nvmrc",".env.example",
  "scripts/runtime-check.mjs","scripts/validate-env.mjs","scripts/verify-v58.24.9.mjs",
  "supabase/migrations/0051_v58_24_9_workspace_data_isolation_org_lifecycle.sql",
  "docs/architecture/FLOWTASK_WORKSPACE_DATA_ISOLATION_MODEL.md",
  "docs/release/V58_24_9_WORKSPACE_DATA_ISOLATION_ORGANIZATION_LIFECYCLE_HARDENING.md",
  "docs/qa/FLOWTASK_V58_24_9_WORKSPACE_DATA_ISOLATION_ORGANIZATION_LIFECYCLE_HARDENING_QA.md",
  "src/components/boards/boards-home.tsx",
  "src/components/boards/board-toolbox.tsx"
]) requireFile(rel);

const pkg = JSON.parse(read("package.json"));
const scripts = pkg.scripts ?? {};
for (const scriptName of ["build","vercel:build","deploy:readiness","build:preflight","verify:current","deploy:production:ready","verify:v58.24.9"]) {
  if (!scripts[scriptName]) failures.push(`Missing package script: ${scriptName}`);
}

if (pkg.version !== expectedVersion) failures.push(`Unexpected package version: ${pkg.version}`);
if (scripts["verify:current"] !== "npm run verify:v58.24.9") failures.push("verify:current must target verify:v58.24.9");
if (scripts["verify:v58.24.9"] !== "node scripts/verify-v58.24.9.mjs") failures.push("verify:v58.24.9 must target scripts/verify-v58.24.9.mjs");

const vercel = JSON.parse(read("vercel.json"));
if (vercel.framework !== "nextjs") failures.push("vercel.json framework must be nextjs");
if (vercel.buildCommand !== "npm run vercel:build") failures.push("vercel.json buildCommand must be npm run vercel:build");

requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedReleaseLabel);
requireIncludes("package-lock.json", expectedVersion);
requireIncludes("supabase/migrations/0051_v58_24_9_workspace_data_isolation_org_lifecycle.sql", "schedule_organization_deletion");
requireIncludes("supabase/migrations/0051_v58_24_9_workspace_data_isolation_org_lifecycle.sql", "restore_organization");
requireIncludes("supabase/migrations/0051_v58_24_9_workspace_data_isolation_org_lifecycle.sql", "purge_organization_data");
requireIncludes("supabase/migrations/0051_v58_24_9_workspace_data_isolation_org_lifecycle.sql", "move_personal_project_to_organization");
requireIncludes("supabase/migrations/0051_v58_24_9_workspace_data_isolation_org_lifecycle.sql", "tasks_insert_workspace_owner");
requireIncludes("supabase/migrations/0051_v58_24_9_workspace_data_isolation_org_lifecycle.sql", "projects_insert_workspace_owner");

if (failures.length) {
  console.error("[build-deploy-readiness] Failed checks:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[build-deploy-readiness] OK — v58.24.9 workspace data isolation and organization lifecycle readiness aligned.");
