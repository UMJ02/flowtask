#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const exists = (rel) => fs.existsSync(path.join(root, rel));
const read = (rel) => exists(rel) ? fs.readFileSync(path.join(root, rel), "utf8") : "";
const requireFile = (rel) => { if (!exists(rel)) failures.push(`Missing ${rel}`); };
const requireIncludes = (rel, text) => { if (!read(rel).includes(text)) failures.push(`Expected ${JSON.stringify(text)} in ${rel}`); };

const expectedVersion = "58.27.3-workspace-pro-interaction-model-task-project-ux";
const pkg = JSON.parse(read("package.json") || "{}");
if (pkg.version !== expectedVersion) failures.push(`Unexpected package version: ${pkg.version}`);
for (const rel of [
  "package.json",
  "package-lock.json",
  "src/lib/release/version.ts",
  "src/components/workspace-pro/workspace-pro-page.tsx",
  "src/components/workspace-system/workspace-system-page.tsx",
  "scripts/workspace-pro-design-reset-check.mjs",
  "scripts/workspace-pro-layout-cleanup-check.mjs",
]) requireFile(rel);
requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("src/lib/release/version.ts", "APP_RELEASE_STAGE");
requireIncludes("src/components/workspace-pro/workspace-pro-page.tsx", "WorkspaceProInspector");
requireIncludes("src/components/workspace-pro/workspace-pro-page.tsx", "WorkspaceProSheet");
requireIncludes("src/app/globals.css", "ws-pro-primary-button");

if (failures.length) {
  console.error("[deploy-production-readiness] Failed checks:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("[deploy-production-readiness] OK — v58.27.3 workspace doctor version alignment aligned.");
