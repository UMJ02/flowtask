#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const expectedVersion = "58.24.9.1-organization-manage-rpc-alignment-service-role-guard";
const expectedReleaseLabel = "v58.24.9.1 Organization Manage RPC Alignment + Service Role Guard";

function exists(rel){ return fs.existsSync(path.join(root, rel)); }
function read(rel){ return exists(rel) ? fs.readFileSync(path.join(root, rel), "utf8") : ""; }
function requireFile(rel){ if(!exists(rel)) failures.push(`Missing required file: ${rel}`); }
function requireIncludes(rel, text){ if(!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); }
function requireNotIncludes(rel, text){ if(read(rel).includes(text)) failures.push(`Did not expect '${text}' in ${rel}`); }

for (const rel of [
  "package.json","package-lock.json","vercel.json","next.config.ts",".nvmrc",".env.example",
  "scripts/runtime-check.mjs","scripts/validate-env.mjs","scripts/verify-v58.24.9.1.mjs",
  "docs/release/V58_24_9_1_ORGANIZATION_MANAGE_RPC_ALIGNMENT_SERVICE_ROLE_GUARD.md",
  "docs/qa/FLOWTASK_V58_24_9_1_ORGANIZATION_MANAGE_RPC_ALIGNMENT_SERVICE_ROLE_GUARD_QA.md",
  "src/app/api/organization/manage/route.ts",
  "src/lib/organization/purge.ts",
  "src/lib/supabase/admin.ts"
]) requireFile(rel);

const pkg = JSON.parse(read("package.json"));
const scripts = pkg.scripts ?? {};
for (const scriptName of ["build","vercel:build","deploy:readiness","build:preflight","verify:current","deploy:production:ready","verify:v58.24.9.1"]) {
  if (!scripts[scriptName]) failures.push(`Missing package script: ${scriptName}`);
}

if (pkg.version !== expectedVersion) failures.push(`Unexpected package version: ${pkg.version}`);
if (scripts["verify:current"] !== "npm run verify:v58.24.9.1") failures.push("verify:current must target verify:v58.24.9.1");
if (scripts["verify:v58.24.9.1"] !== "node scripts/verify-v58.24.9.1.mjs") failures.push("verify:v58.24.9.1 must target scripts/verify-v58.24.9.1.mjs");

const vercel = JSON.parse(read("vercel.json"));
if (vercel.framework !== "nextjs") failures.push("vercel.json framework must be nextjs");
if (vercel.buildCommand !== "npm run vercel:build") failures.push("vercel.json buildCommand must be npm run vercel:build");

requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedReleaseLabel);
requireIncludes("package-lock.json", expectedVersion);
requireIncludes("src/app/api/organization/manage/route.ts", "schedule_organization_deletion");
requireIncludes("src/app/api/organization/manage/route.ts", "restore_organization");
requireIncludes("src/app/api/organization/manage/route.ts", "purge_organization_data");
requireNotIncludes("src/app/api/organization/manage/route.ts", "createAdminClient");
requireIncludes("src/lib/organization/purge.ts", "purge_expired_organizations");
requireIncludes("src/lib/supabase/admin.ts", "assertServiceRoleKey");
requireIncludes("scripts/runtime-check.mjs", "SUPABASE_SERVICE_ROLE_KEY project ref does not match");

if (failures.length) {
  console.error("[build-deploy-readiness] Failed checks:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[build-deploy-readiness] OK — v58.24.9.1 organization manage RPC and service role guard readiness aligned.");
