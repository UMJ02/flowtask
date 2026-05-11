#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const expectedVersion = "58.24.9.2-organization-delete-rpc-schema-and-workspace-switch-fix";

function exists(rel){ return fs.existsSync(path.join(root, rel)); }
function read(rel){ return exists(rel) ? fs.readFileSync(path.join(root, rel), "utf8") : ""; }
function pass(label){ console.log(`[deploy-production-readiness] OK - ${label}`); }
function fail(label){ failures.push(label); }

const pkg = JSON.parse(read("package.json"));
const scripts = pkg.scripts ?? {};

pkg.version === expectedVersion ? pass("package version aligned") : fail(`package version must be ${expectedVersion}`);
scripts["verify:current"] === "npm run verify:v58.24.9.2" ? pass("verify current aligned") : fail("verify:current must target verify:v58.24.9.2");
scripts["verify:v58.24.9.2"] === "node scripts/verify-v58.24.9.2.mjs" ? pass("version verifier available") : fail("verify:v58.24.9.2 script missing or incorrect");

for (const [label, rel] of [
  ["verify-v58.24.9.2 script exists", "scripts/verify-v58.24.9.2.mjs"],
  ["release notes available", "docs/release/V58_24_9_2_ORGANIZATION_DELETE_RPC_SCHEMA_AND_WORKSPACE_SWITCH_FIX.md"],
  ["QA document available", "docs/qa/FLOWTASK_V58_24_9_2_ORGANIZATION_DELETE_RPC_SCHEMA_AND_WORKSPACE_SWITCH_FIX_QA.md"],
  ["organization manage API available", "src/app/api/organization/manage/route.ts"],
  ["workspace switcher available", "src/components/layout/organization-switcher.tsx"]
]) exists(rel) ? pass(label) : fail(`${label}: missing ${rel}`);

read("src/lib/release/version.ts").includes(expectedVersion) ? pass("runtime version export aligned") : fail("src/lib/release/version.ts must export v58.24.9.2");
read("src/app/api/organization/manage/route.ts").includes("fallbackScheduleOrganizationDeletion") ? pass("schedule fallback available") : fail("schedule fallback missing");
read("src/app/api/organization/manage/route.ts").includes("fallbackRestoreOrganization") ? pass("restore fallback available") : fail("restore fallback missing");
read("src/app/api/organization/manage/route.ts").includes("isMissingRpcError") ? pass("missing RPC detection available") : fail("missing RPC detection missing");
read("src/components/layout/organization-switcher.tsx").includes("persistWorkspaceCookie") ? pass("client workspace cookie update available") : fail("client workspace cookie update missing");
read("src/components/layout/organization-switcher.tsx").includes("window.location.assign") ? pass("workspace switch hard navigation available") : fail("workspace switch hard navigation missing");
read("package-lock.json").includes(expectedVersion) ? pass("package-lock version aligned") : fail("package-lock.json must include v58.24.9.2 package version");

const vercel = JSON.parse(read("vercel.json"));
vercel.framework === "nextjs" ? pass("Vercel framework aligned") : fail("vercel.json framework must be nextjs");
vercel.buildCommand === "npm run vercel:build" ? pass("Vercel build command aligned") : fail("vercel.json buildCommand must be npm run vercel:build");

if (failures.length) {
  console.error("[deploy-production-readiness] Failed checks:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[deploy-production-readiness] OK — v58.24.9.2 production readiness aligned.");
