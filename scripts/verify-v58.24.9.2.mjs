#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const read = (rel) => fs.existsSync(path.join(root, rel)) ? fs.readFileSync(path.join(root, rel), "utf8") : "";
const exists = (rel) => fs.existsSync(path.join(root, rel));
const requireFile = (rel) => { if (!exists(rel)) failures.push(`Missing required file: ${rel}`); };
const requireIncludes = (rel, text) => { if (!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); };

const expectedVersion = "58.24.9.2-organization-delete-rpc-schema-and-workspace-switch-fix";
const expectedRelease = "v58.24.9.2 Organization Delete RPC Schema + Workspace Switch Fix";

const pkg = JSON.parse(read("package.json"));
if (pkg.version !== expectedVersion) failures.push("package version must be v58.24.9.2 organization delete RPC schema fix");
if ((pkg.scripts ?? {})["verify:current"] !== "npm run verify:v58.24.9.2") failures.push("verify:current must target verify:v58.24.9.2");
if ((pkg.scripts ?? {})["verify:v58.24.9.2"] !== "node scripts/verify-v58.24.9.2.mjs") failures.push("verify:v58.24.9.2 script must be available");

requireFile("scripts/verify-v58.24.9.2.mjs");
requireFile("docs/release/V58_24_9_2_ORGANIZATION_DELETE_RPC_SCHEMA_AND_WORKSPACE_SWITCH_FIX.md");
requireFile("docs/qa/FLOWTASK_V58_24_9_2_ORGANIZATION_DELETE_RPC_SCHEMA_AND_WORKSPACE_SWITCH_FIX_QA.md");

requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedRelease);
requireIncludes("package-lock.json", expectedVersion);
requireIncludes("README.md", "v58.24.9.2");
requireIncludes("src/app/api/organization/manage/route.ts", "isMissingRpcError");
requireIncludes("src/app/api/organization/manage/route.ts", "fallbackScheduleOrganizationDeletion");
requireIncludes("src/app/api/organization/manage/route.ts", "fallbackRestoreOrganization");
requireIncludes("src/app/api/organization/manage/route.ts", "PGRST202");
requireIncludes("src/components/layout/organization-switcher.tsx", "persistWorkspaceCookie");
requireIncludes("src/components/layout/organization-switcher.tsx", "navigateAfterWorkspaceSwitch");
requireIncludes("src/components/layout/organization-switcher.tsx", "window.location.assign");

if (failures.length) {
  console.error("[verify:v58.24.9.2] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[verify:v58.24.9.2] OK — Organization delete RPC schema fallback and workspace switch refresh aligned.");
