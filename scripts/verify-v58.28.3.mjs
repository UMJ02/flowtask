#!/usr/bin/env node
import fs from "node:fs";
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const version = "58.28.3-workspace-pro-user-language-timeline-flow",
  "58.28.4-workspace-pro-board-overlay-status-alignment",
  "58.28.5-workspace-pro-brand-accent-pro-navigation-identity",
  "58.28.6-workspace-pro-completed-filter-anchored-actions",
  "58.28.7-workspace-pro-performance-pass-fast-view-switching";
const verifyTarget = "npm run verify:v58.28.3", "npm run verify:v58.28.4", "npm run verify:v58.28.5",
  "npm run verify:v58.28.6",
  "npm run verify:v58.28.7";
const failures = [];
if (pkg.version !== version) failures.push(`Unexpected package version: ${pkg.version}`);
if (pkg.scripts?.["verify:current"] !== verifyTarget) failures.push("verify:current must target verify:v58.28.3");
const checks = [
  ["src/lib/release/version.ts", "v58.28.3 Workspace Pro User Language + Timeline Flow"],
  ["src/components/workspace-pro/workspace-pro-page.tsx", "v58.28.3 — Workspace Pro User Language + Timeline Flow"],
  ["src/components/workspace-system/workspace-spaces-manager.tsx", "v58.28.3 Workspace Spaces User-Facing Cleanup"],
  ["src/app/globals.css", "v58.28.3 — Workspace Pro User Language + Timeline Flow"],
  ["docs/release/V58_28_3_WORKSPACE_PRO_USER_LANGUAGE_TIMELINE_FLOW.md", "v58.28.3"],
  ["docs/qa/FLOWTASK_V58_28_3_WORKSPACE_PRO_USER_LANGUAGE_TIMELINE_FLOW_QA.md", "v58.28.3"],
];
for (const [file, marker] of checks) {
  if (!fs.existsSync(file)) failures.push(`Missing ${file}`);
  else if (!fs.readFileSync(file, "utf8").includes(marker)) failures.push(`Missing marker in ${file}: ${marker}`);
}
if (failures.length) {
  console.error("[verify:v58.28.3] FAIL");
  for (const item of failures) console.error(`- ${item}`);
  process.exit(1);
}
console.log("[verify:v58.28.3] OK — Workspace Pro user language and timeline flow aligned.");
