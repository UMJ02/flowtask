#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const expectedVersion = "58.24.9-workspace-data-isolation-organization-lifecycle-hardening";

function exists(rel){ return fs.existsSync(path.join(root, rel)); }
function read(rel){ return exists(rel) ? fs.readFileSync(path.join(root, rel), "utf8") : ""; }
function pass(label){ console.log(`[deploy-production-readiness] OK - ${label}`); }
function fail(label){ failures.push(label); }

const pkg = JSON.parse(read("package.json"));
const scripts = pkg.scripts ?? {};

pkg.version === expectedVersion ? pass("package version aligned") : fail(`package version must be ${expectedVersion}`);
scripts["verify:current"] === "npm run verify:v58.24.9" ? pass("verify current aligned") : fail("verify:current must target verify:v58.24.9");
scripts["verify:v58.24.9"] === "node scripts/verify-v58.24.9.mjs" ? pass("version verifier available") : fail("verify:v58.24.9 script missing or incorrect");

for (const [label, rel] of [
  ["verify-v58.24.9 script exists", "scripts/verify-v58.24.9.mjs"],
  ["release notes available", "docs/release/V58_24_9_WORKSPACE_DATA_ISOLATION_ORGANIZATION_LIFECYCLE_HARDENING.md"],
  ["QA document available", "docs/qa/FLOWTASK_V58_24_9_WORKSPACE_DATA_ISOLATION_ORGANIZATION_LIFECYCLE_HARDENING_QA.md"],
  ["architecture doc available", "docs/architecture/FLOWTASK_WORKSPACE_DATA_ISOLATION_MODEL.md"],
  ["SQL migration available", "supabase/migrations/0051_v58_24_9_workspace_data_isolation_org_lifecycle.sql"]
]) exists(rel) ? pass(label) : fail(`${label}: missing ${rel}`);

read("src/lib/release/version.ts").includes(expectedVersion) ? pass("runtime version export aligned") : fail("src/lib/release/version.ts must export v58.24.9");
read("supabase/migrations/0051_v58_24_9_workspace_data_isolation_org_lifecycle.sql").includes("schedule_organization_deletion") ? pass("organization delete scheduling available") : fail("schedule_organization_deletion missing");
read("supabase/migrations/0051_v58_24_9_workspace_data_isolation_org_lifecycle.sql").includes("restore_organization") ? pass("organization restore available") : fail("restore_organization missing");
read("supabase/migrations/0051_v58_24_9_workspace_data_isolation_org_lifecycle.sql").includes("purge_organization_data") ? pass("organization purge available") : fail("purge_organization_data missing");
read("supabase/migrations/0051_v58_24_9_workspace_data_isolation_org_lifecycle.sql").includes("move_personal_project_to_organization") ? pass("personal to organization move available") : fail("move_personal_project_to_organization missing");
read("supabase/migrations/0051_v58_24_9_workspace_data_isolation_org_lifecycle.sql").includes("projects_insert_workspace_owner") ? pass("project insert scope policy available") : fail("projects_insert_workspace_owner missing");
read("supabase/migrations/0051_v58_24_9_workspace_data_isolation_org_lifecycle.sql").includes("tasks_insert_workspace_owner") ? pass("task insert scope policy available") : fail("tasks_insert_workspace_owner missing");

const vercel = JSON.parse(read("vercel.json"));
vercel.framework === "nextjs" ? pass("Vercel framework aligned") : fail("vercel.json framework must be nextjs");
vercel.buildCommand === "npm run vercel:build" ? pass("Vercel build command aligned") : fail("vercel.json buildCommand must be npm run vercel:build");
read("package-lock.json").includes(expectedVersion) ? pass("package-lock version aligned") : fail("package-lock.json must include v58.24.9 package version");

if (failures.length) {
  console.error("[deploy-production-readiness] Failed checks:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[deploy-production-readiness] OK — v58.24.9 production readiness aligned.");
