#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
const root = process.cwd();
const failures = [];
const read = (rel) => fs.existsSync(path.join(root, rel)) ? fs.readFileSync(path.join(root, rel), "utf8") : "";
const exists = (rel) => fs.existsSync(path.join(root, rel));
const pkg = JSON.parse(read("package.json") || "{}");
if (pkg.version !== "58.27.6-workspace-pro-deep-cleanup-2026-ui-controls-system") failures.push(`Unexpected package version: ${pkg.version}`);
if (pkg.scripts?.["verify:current"] !== "npm run verify:v58.27.6") failures.push("verify:current must target verify:v58.27.6");
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
if (!read("src/lib/release/version.ts").includes("58.27.6-workspace-pro-deep-cleanup-2026-ui-controls-system")) failures.push("version.ts must include v58.27.6 slug");
if (!read("src/lib/release/version.ts").includes("APP_RELEASE_STAGE")) failures.push("version.ts must export APP_RELEASE_STAGE");
if (!read("scripts/workspace-persistence-doctor.mjs").includes("verify:v58.27.6")) failures.push("workspace doctor must expect verify:v58.27.6");
if (!read("package-lock.json").includes("58.27.6-workspace-pro-deep-cleanup-2026-ui-controls-system")) failures.push("package-lock must include v58.27.6 slug");
if (!read("README.md").includes("v58.27.6 — Workspace Pro Deep Cleanup + 2026 UI Controls System")) failures.push("README must include v58.27.6 section");
if (failures.length) {
  console.error("[verify:v58.27.6] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("[verify:v58.27.6] OK — Workspace doctor version alignment patch aligned.");
