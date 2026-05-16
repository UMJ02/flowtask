#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const expectedVersion = "58.26.5-workspace-error-recovery-final-qa-hardening";
const expectedRelease = "v58.26.5 Workspace Error Recovery + Final QA Hardening";
const exists = (rel) => fs.existsSync(path.join(root, rel));
const read = (rel) => exists(rel) ? fs.readFileSync(path.join(root, rel), "utf8") : "";
const requireFile = (rel) => { if (!exists(rel)) failures.push(`Missing required file: ${rel}`); };
const requireIncludes = (rel, text) => { if (!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); };

const pkg = JSON.parse(read("package.json") || "{}");
if (pkg.version !== expectedVersion) failures.push(`package version must be ${expectedVersion}`);
if ((pkg.scripts ?? {})["verify:current"] !== "npm run verify:v58.26.5") failures.push("verify:current must target verify:v58.26.5");
if ((pkg.scripts ?? {})["verify:v58.26.5"] !== "node scripts/verify-v58.26.5.mjs") failures.push("verify:v58.26.5 script missing");
if ((pkg.scripts ?? {})["workspace:error-recovery:ready"] !== "node scripts/workspace-error-recovery-final-qa-check.mjs") failures.push("workspace:error-recovery:ready script missing");

for (const rel of [
  "scripts/verify-v58.26.5.mjs",
  "scripts/workspace-error-recovery-final-qa-check.mjs",
  "src/components/workspace-system/workspace-recovery-panel.tsx",
  "src/app/(app)/app/workspace/error.tsx",
  "src/app/(app)/app/workspace/loading.tsx",
  "src/components/workspace-system/workspace-system-page.tsx",
  "src/lib/workspace-system/view-state.ts",
  "docs/release/V58_26_5_WORKSPACE_ERROR_RECOVERY_FINAL_QA_HARDENING.md",
  "docs/qa/FLOWTASK_V58_26_5_WORKSPACE_ERROR_RECOVERY_FINAL_QA.md",
]) requireFile(rel);

requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedRelease);
requireIncludes("package-lock.json", expectedVersion);
requireIncludes("src/components/workspace-system/workspace-recovery-panel.tsx", "WorkspaceRecoveryPanel");
requireIncludes("src/app/(app)/app/workspace/error.tsx", "workspace:error-boundary");
requireIncludes("src/app/(app)/app/workspace/loading.tsx", "WorkspaceLoading");
requireIncludes("src/components/workspace-system/workspace-system-page.tsx", "WorkspaceRecoveryPanel");
requireIncludes("src/components/workspace-system/workspace-system-page.tsx", "invalidSavedViewId");
requireIncludes("src/app/globals.css", "ft-ws-recovery-action");
requireIncludes("README.md", "v58.26.5");

if (failures.length) {
  console.error("[verify:v58.26.5] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("[verify:v58.26.5] OK — Workspace Error Recovery + Final QA Hardening aligned.");
