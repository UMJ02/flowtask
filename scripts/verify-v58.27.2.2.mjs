#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
const root = process.cwd();
const failures = [];
const read = (rel) => fs.existsSync(path.join(root, rel)) ? fs.readFileSync(path.join(root, rel), "utf8") : "";
const exists = (rel) => fs.existsSync(path.join(root, rel));
const pkg = JSON.parse(read("package.json") || "{}");
if (pkg.version !== "58.27.5-workspace-pro-files-reports-crud-polish") failures.push(`Unexpected package version: ${pkg.version}`);
if (pkg.scripts?.["verify:current"] !== "npm run verify:v58.27.5") failures.push("verify:current must target verify:v58.27.5");
for (const rel of [
  "src/lib/release/version.ts",
  "scripts/workspace-persistence-doctor.mjs",
  "scripts/workspace-production-readiness-check.mjs",
  "scripts/workspace-real-environment-hardening-check.mjs",
  "scripts/workspace-performance-readiness-check.mjs",
  "scripts/workspace-notifications-automation-readiness-check.mjs",
  "scripts/workspace-collaboration-share-readiness-check.mjs",
  "scripts/workspace-error-recovery-final-qa-check.mjs",
  "scripts/workspace-release-candidate-readiness-check.mjs",
  "scripts/workspace-release-candidate-fixes-check.mjs",
  "scripts/workspace-pro-design-reset-check.mjs",
  "scripts/workspace-pro-layout-cleanup-check.mjs",
  "docs/release/V58_27_4_WORKSPACE_PRO_BOARD_DRAG_DROP_INLINE_EDITING.md",
  "docs/qa/FLOWTASK_V58_27_4_WORKSPACE_PRO_BOARD_DRAG_DROP_INLINE_EDITING_QA.md",
]) { if (!exists(rel)) failures.push(`Missing ${rel}`); }
if (!read("src/lib/release/version.ts").includes("58.27.5-workspace-pro-files-reports-crud-polish")) failures.push("version.ts must include v58.27.5 slug");
if (!read("src/lib/release/version.ts").includes("APP_RELEASE_STAGE")) failures.push("version.ts must export APP_RELEASE_STAGE");
if (!read("scripts/workspace-persistence-doctor.mjs").includes("verify:v58.27.5")) failures.push("workspace doctor must expect verify:v58.27.5");
if (!read("package-lock.json").includes("58.27.5-workspace-pro-files-reports-crud-polish")) failures.push("package-lock must include v58.27.5 slug");
if (!read("README.md").includes("v58.27.5 — Workspace Pro Files + Reports CRUD Polish")) failures.push("README must include v58.27.5 section");
if (failures.length) {
  console.error("[verify:v58.27.5] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("[verify:v58.27.5] OK — Workspace doctor version alignment patch aligned.");
