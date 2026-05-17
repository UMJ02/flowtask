#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const exists = (rel) => fs.existsSync(path.join(root, rel));
const read = (rel) => exists(rel) ? fs.readFileSync(path.join(root, rel), "utf8") : "";
const requireFile = (rel) => { if (!exists(rel)) failures.push(`Missing ${rel}`); };
const requireIncludes = (rel, text) => { if (!read(rel).includes(text)) failures.push(`Expected ${JSON.stringify(text)} in ${rel}`); };

const expectedVersions = [
  "58.27.6-workspace-pro-deep-cleanup-2026-ui-controls-system",
  "58.27.7-workspace-pro-render-diet-dead-ui-removal",
  "58.27.7.1-workspace-pro-render-diet-cli-hotfix",
  "58.27.8-workspace-pro-visual-density-final-ui-polish",
  "58.27.8.1-workspace-pro-vercel-readiness-hotfix",
  "58.27.9-workspace-pro-interaction-hardening-real-editing-flow",
  "58.28.0-workspace-pro-production-ux-final",
];
const pkg = JSON.parse(read("package.json") || "{}");
if (!expectedVersions.includes(pkg.version)) failures.push(`Unexpected package version: ${pkg.version}`);
if (!["npm run verify:v58.27.6", "npm run verify:v58.27.7", "npm run verify:v58.27.7.1", "npm run verify:v58.27.8", "npm run verify:v58.27.8.1",
  "npm run verify:v58.27.9",
  "npm run verify:v58.28.0"].includes(pkg.scripts?.["verify:current"])) failures.push("verify:current must target the active v58.27.x/v58.28.x verify script");
if (!String(pkg.scripts?.["build:preflight"] ?? "").includes("workspace:design-reset:ready")) failures.push("build:preflight must include workspace:design-reset:ready");
if (!String(pkg.scripts?.["build:preflight"] ?? "").includes("workspace:layout-cleanup:ready")) failures.push("build:preflight must include workspace:layout-cleanup:ready");

for (const rel of [
  "src/app/(app)/app/workspace/page.tsx",
  "src/components/workspace-system/workspace-system-page.tsx",
  "src/components/workspace-pro/workspace-pro-page.tsx",
  "src/lib/workspace-system/server-data.ts",
  "src/lib/workspace-system/view-state.ts",
  "src/lib/release/version.ts",
  "src/app/globals.css",
  "scripts/verify-v58.27.6.mjs",
  "scripts/workspace-pro-design-reset-check.mjs",
  "scripts/workspace-pro-layout-cleanup-check.mjs",
  "docs/release/V58_27_4_WORKSPACE_PRO_BOARD_DRAG_DROP_INLINE_EDITING.md",
  "docs/qa/FLOWTASK_V58_27_4_WORKSPACE_PRO_BOARD_DRAG_DROP_INLINE_EDITING_QA.md",
]) requireFile(rel);

if (!expectedVersions.some((version) => read("src/lib/release/version.ts").includes(version))) {
  failures.push("src/lib/release/version.ts must contain an allowed v58.27.x/v58.28.x Workspace Pro version");
}
requireIncludes("src/lib/release/version.ts", "APP_RELEASE_STAGE");
requireIncludes("src/components/workspace-system/workspace-system-page.tsx", "WorkspaceProPage");
requireIncludes("src/components/workspace-pro/workspace-pro-page.tsx", "WorkspaceProSheet");
requireIncludes("src/components/workspace-pro/workspace-pro-page.tsx", "WorkspaceProInspector");
requireIncludes("src/app/globals.css", "v58.27.6 — Workspace Pro Deep Cleanup + 2026 UI Controls System");
requireIncludes("README.md", "v58.27.2.1 — Workspace Pro Layout Simplification");

if (failures.length) {
  console.error("[build-deploy-readiness] Failed checks:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("[build-deploy-readiness] OK — v58.27.6 workspace doctor version alignment aligned.");
