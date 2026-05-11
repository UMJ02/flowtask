#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const expectedVersion = "58.24.9.1-organization-manage-rpc-alignment-service-role-guard";

function exists(rel){ return fs.existsSync(path.join(root, rel)); }
function read(rel){ return exists(rel) ? fs.readFileSync(path.join(root, rel), "utf8") : ""; }
function pass(label){ console.log(`[deploy-production-readiness] OK - ${label}`); }
function fail(label){ failures.push(label); }

const pkg = JSON.parse(read("package.json"));
const scripts = pkg.scripts ?? {};

pkg.version === expectedVersion ? pass("package version aligned") : fail(`package version must be ${expectedVersion}`);
scripts["verify:current"] === "npm run verify:v58.24.9.1" ? pass("verify current aligned") : fail("verify:current must target verify:v58.24.9.1");
scripts["verify:v58.24.9.1"] === "node scripts/verify-v58.24.9.1.mjs" ? pass("version verifier available") : fail("verify:v58.24.9.1 script missing or incorrect");

for (const [label, rel] of [
  ["verify-v58.24.9.1 script exists", "scripts/verify-v58.24.9.1.mjs"],
  ["release notes available", "docs/release/V58_24_9_1_ORGANIZATION_MANAGE_RPC_ALIGNMENT_SERVICE_ROLE_GUARD.md"],
  ["QA document available", "docs/qa/FLOWTASK_V58_24_9_1_ORGANIZATION_MANAGE_RPC_ALIGNMENT_SERVICE_ROLE_GUARD_QA.md"],
  ["organization manage API available", "src/app/api/organization/manage/route.ts"],
  ["service role guard available", "src/lib/supabase/admin.ts"]
]) exists(rel) ? pass(label) : fail(`${label}: missing ${rel}`);

read("src/lib/release/version.ts").includes(expectedVersion) ? pass("runtime version export aligned") : fail("src/lib/release/version.ts must export v58.24.9.1");
read("src/app/api/organization/manage/route.ts").includes("schedule_organization_deletion") ? pass("schedule delete RPC aligned") : fail("schedule_organization_deletion missing from organization manage API");
read("src/app/api/organization/manage/route.ts").includes("restore_organization") ? pass("restore RPC aligned") : fail("restore_organization missing from organization manage API");
read("src/app/api/organization/manage/route.ts").includes("purge_organization_data") ? pass("purge RPC aligned") : fail("purge_organization_data missing from organization manage API");
!read("src/app/api/organization/manage/route.ts").includes("createAdminClient") ? pass("organization manage no longer uses admin client") : fail("organization manage should not use createAdminClient");
read("src/lib/organization/purge.ts").includes("purge_expired_organizations") ? pass("cron purge RPC aligned") : fail("purge_expired_organizations missing from cron purge helper");
read("src/lib/supabase/admin.ts").includes("assertServiceRoleKey") ? pass("service role guard available") : fail("assertServiceRoleKey missing");
read("scripts/runtime-check.mjs").includes("SUPABASE_SERVICE_ROLE_KEY project ref does not match") ? pass("runtime service key ref guard available") : fail("runtime service key ref guard missing");
read("package-lock.json").includes(expectedVersion) ? pass("package-lock version aligned") : fail("package-lock.json must include v58.24.9.1 package version");

const vercel = JSON.parse(read("vercel.json"));
vercel.framework === "nextjs" ? pass("Vercel framework aligned") : fail("vercel.json framework must be nextjs");
vercel.buildCommand === "npm run vercel:build" ? pass("Vercel build command aligned") : fail("vercel.json buildCommand must be npm run vercel:build");

if (failures.length) {
  console.error("[deploy-production-readiness] Failed checks:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[deploy-production-readiness] OK — v58.24.9.1 production readiness aligned.");
