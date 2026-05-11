#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const read = (rel) => fs.existsSync(path.join(root, rel)) ? fs.readFileSync(path.join(root, rel), "utf8") : "";
const exists = (rel) => fs.existsSync(path.join(root, rel));
const requireFile = (rel) => { if (!exists(rel)) failures.push(`Missing required file: ${rel}`); };
const requireIncludes = (rel, text) => { if (!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); };

const expectedVersion = "58.24.9-workspace-data-isolation-organization-lifecycle-hardening";
const expectedRelease = "v58.24.9 Workspace Data Isolation + Organization Lifecycle Hardening";

const pkg = JSON.parse(read("package.json"));
if (pkg.version !== expectedVersion) failures.push("package version must be v58.24.9 workspace data isolation");
if ((pkg.scripts ?? {})["verify:current"] !== "npm run verify:v58.24.9") failures.push("verify:current must target verify:v58.24.9");
if ((pkg.scripts ?? {})["verify:v58.24.9"] !== "node scripts/verify-v58.24.9.mjs") failures.push("verify:v58.24.9 script must be available");

requireFile("scripts/verify-v58.24.9.mjs");
requireFile("supabase/migrations/0051_v58_24_9_workspace_data_isolation_org_lifecycle.sql");
requireFile("docs/architecture/FLOWTASK_WORKSPACE_DATA_ISOLATION_MODEL.md");
requireFile("docs/release/V58_24_9_WORKSPACE_DATA_ISOLATION_ORGANIZATION_LIFECYCLE_HARDENING.md");
requireFile("docs/qa/FLOWTASK_V58_24_9_WORKSPACE_DATA_ISOLATION_ORGANIZATION_LIFECYCLE_HARDENING_QA.md");

requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedRelease);
requireIncludes("package-lock.json", expectedVersion);
requireIncludes("README.md", "v58.24.9");
requireIncludes("supabase/migrations/0051_v58_24_9_workspace_data_isolation_org_lifecycle.sql", "create or replace function public.schedule_organization_deletion");
requireIncludes("supabase/migrations/0051_v58_24_9_workspace_data_isolation_org_lifecycle.sql", "create or replace function public.restore_organization");
requireIncludes("supabase/migrations/0051_v58_24_9_workspace_data_isolation_org_lifecycle.sql", "create or replace function public.purge_organization_data");
requireIncludes("supabase/migrations/0051_v58_24_9_workspace_data_isolation_org_lifecycle.sql", "create or replace function public.purge_expired_organizations");
requireIncludes("supabase/migrations/0051_v58_24_9_workspace_data_isolation_org_lifecycle.sql", "create or replace function public.move_personal_project_to_organization");
requireIncludes("supabase/migrations/0051_v58_24_9_workspace_data_isolation_org_lifecycle.sql", "projects_insert_workspace_owner");
requireIncludes("supabase/migrations/0051_v58_24_9_workspace_data_isolation_org_lifecycle.sql", "tasks_insert_workspace_owner");
requireIncludes("docs/architecture/FLOWTASK_WORKSPACE_DATA_ISOLATION_MODEL.md", "Workspace personal");
requireIncludes("docs/architecture/FLOWTASK_WORKSPACE_DATA_ISOLATION_MODEL.md", "Workspace organización");

if (failures.length) {
  console.error("[verify:v58.24.9] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[verify:v58.24.9] OK — Workspace data isolation and organization lifecycle hardening aligned.");
