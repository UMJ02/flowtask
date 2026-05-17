#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const read = (rel) => fs.existsSync(path.join(root, rel)) ? fs.readFileSync(path.join(root, rel), "utf8") : "";
const exists = (rel) => fs.existsSync(path.join(root, rel));
const requireFile = (rel) => { if (!exists(rel)) failures.push(`Missing ${rel}`); };
const requireIncludes = (rel, text) => { if (!read(rel).includes(text)) failures.push(`Expected ${JSON.stringify(text)} in ${rel}`); };

const pkg = JSON.parse(read("package.json") || "{}");
const allowedVersions = [
  "58.27.6-workspace-pro-deep-cleanup-2026-ui-controls-system",
  "58.27.7-workspace-pro-render-diet-dead-ui-removal",
  "58.27.7.1-workspace-pro-render-diet-cli-hotfix",
  "58.27.8-workspace-pro-visual-density-final-ui-polish",
  "58.27.8.1-workspace-pro-vercel-readiness-hotfix",
];
const allowedVerifyTargets = ["npm run verify:v58.27.6", "npm run verify:v58.27.7", "npm run verify:v58.27.7.1", "npm run verify:v58.27.8", "npm run verify:v58.27.8.1"];
if (!allowedVersions.includes(String(pkg.version ?? ""))) failures.push(`Unexpected package version: ${pkg.version}`);
if (!allowedVerifyTargets.includes(pkg.scripts?.["verify:current"])) failures.push("verify:current must target the active v58.27.x verify script");

for (const rel of [
  "src/app/(app)/app/workspace/page.tsx",
  "src/components/workspace-system/workspace-system-page.tsx",
  "src/components/workspace-pro/workspace-pro-page.tsx",
  "src/lib/workspace-system/server-data.ts",
  "src/lib/workspace-system/performance.ts",
  "src/lib/release/version.ts",
  "src/app/globals.css",
]) requireFile(rel);

if (!allowedVersions.some((version) => read("src/lib/release/version.ts").includes(version))) {
  failures.push("src/lib/release/version.ts must contain an allowed v58.27.x Workspace Pro version");
}
requireIncludes("src/lib/release/version.ts", "APP_RELEASE_STAGE");
requireIncludes("src/components/workspace-system/workspace-system-page.tsx", "WorkspaceProPage");
requireIncludes("src/components/workspace-pro/workspace-pro-page.tsx", "ws-pro-shell");
requireIncludes("src/app/globals.css", "ws-pro-primary-button");

if (failures.length) {
  console.error("[workspace:automation:ready] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("[workspace:automation:ready] OK — Workspace notifications and automation readiness aligned.");
