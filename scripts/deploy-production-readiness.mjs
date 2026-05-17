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
];
const pkg = JSON.parse(read("package.json") || "{}");
if (!expectedVersions.includes(pkg.version)) failures.push(`Unexpected package version: ${pkg.version}`);
for (const rel of [
  "package.json",
  "package-lock.json",
  "src/lib/release/version.ts",
  "src/components/workspace-pro/workspace-pro-page.tsx",
  "src/components/workspace-system/workspace-system-page.tsx",
  "scripts/workspace-pro-design-reset-check.mjs",
  "scripts/workspace-pro-layout-cleanup-check.mjs",
]) requireFile(rel);
if (!expectedVersions.some((version) => read("src/lib/release/version.ts").includes(version))) {
  failures.push("src/lib/release/version.ts must contain an allowed v58.27.x Workspace Pro version");
}
requireIncludes("src/lib/release/version.ts", "APP_RELEASE_STAGE");
requireIncludes("src/components/workspace-pro/workspace-pro-page.tsx", "WorkspaceProInspector");
requireIncludes("src/components/workspace-pro/workspace-pro-page.tsx", "WorkspaceProSheet");
requireIncludes("src/app/globals.css", "ws-pro-primary-button");

if (failures.length) {
  console.error("[deploy-production-readiness] Failed checks:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("[deploy-production-readiness] OK — v58.27.6 workspace doctor version alignment aligned.");
