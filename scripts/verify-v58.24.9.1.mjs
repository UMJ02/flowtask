#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const read = (rel) => fs.existsSync(path.join(root, rel)) ? fs.readFileSync(path.join(root, rel), "utf8") : "";
const exists = (rel) => fs.existsSync(path.join(root, rel));
const requireFile = (rel) => { if (!exists(rel)) failures.push(`Missing required file: ${rel}`); };
const requireIncludes = (rel, text) => { if (!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); };
const requireNotIncludes = (rel, text) => { if (read(rel).includes(text)) failures.push(`Did not expect '${text}' in ${rel}`); };

const expectedVersion = "58.24.9.1-organization-manage-rpc-alignment-service-role-guard";
const expectedRelease = "v58.24.9.1 Organization Manage RPC Alignment + Service Role Guard";

const pkg = JSON.parse(read("package.json"));
if (pkg.version !== expectedVersion) failures.push("package version must be v58.24.9.1 organization manage RPC alignment");
if ((pkg.scripts ?? {})["verify:current"] !== "npm run verify:v58.24.9.1") failures.push("verify:current must target verify:v58.24.9.1");
if ((pkg.scripts ?? {})["verify:v58.24.9.1"] !== "node scripts/verify-v58.24.9.1.mjs") failures.push("verify:v58.24.9.1 script must be available");

requireFile("scripts/verify-v58.24.9.1.mjs");
requireFile("docs/release/V58_24_9_1_ORGANIZATION_MANAGE_RPC_ALIGNMENT_SERVICE_ROLE_GUARD.md");
requireFile("docs/qa/FLOWTASK_V58_24_9_1_ORGANIZATION_MANAGE_RPC_ALIGNMENT_SERVICE_ROLE_GUARD_QA.md");
requireFile("supabase/migrations/0051_v58_24_9_workspace_data_isolation_org_lifecycle.sql");

requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedRelease);
requireIncludes("package-lock.json", expectedVersion);
requireIncludes("README.md", "v58.24.9.1");

requireIncludes("src/app/api/organization/manage/route.ts", "schedule_organization_deletion");
requireIncludes("src/app/api/organization/manage/route.ts", "restore_organization");
requireIncludes("src/app/api/organization/manage/route.ts", "purge_organization_data");
requireNotIncludes("src/app/api/organization/manage/route.ts", "createAdminClient");
requireIncludes("src/lib/organization/purge.ts", "purge_expired_organizations");
requireIncludes("src/lib/supabase/admin.ts", "assertServiceRoleKey");
requireIncludes("src/lib/supabase/admin.ts", "SUPABASE_SERVICE_ROLE_KEY belongs to project");
requireIncludes("scripts/runtime-check.mjs", "SUPABASE_SERVICE_ROLE_KEY project ref does not match");
requireIncludes("scripts/runtime-check.mjs", "SUPABASE_SERVICE_ROLE_KEY is not a service_role key");

if (failures.length) {
  console.error("[verify:v58.24.9.1] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[verify:v58.24.9.1] OK — Organization manage RPC alignment and service role guard aligned.");
