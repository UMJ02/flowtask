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
if (!String(pkg.version ?? "").includes("58.27.3")) failures.push(`Unexpected package version: ${pkg.version}`);
if (pkg.scripts?.["verify:current"] !== "npm run verify:v58.27.3") failures.push("verify:current must target verify:v58.27.3");

for (const rel of [
  "src/app/(app)/app/workspace/page.tsx",
  "src/components/workspace-system/workspace-system-page.tsx",
  "src/components/workspace-pro/workspace-pro-page.tsx",
  "src/lib/workspace-system/server-data.ts",
  "src/lib/workspace-system/performance.ts",
  "src/lib/release/version.ts",
  "src/app/globals.css",
]) requireFile(rel);

requireIncludes("src/lib/release/version.ts", "58.27.3-workspace-pro-interaction-model-task-project-ux");
requireIncludes("src/lib/release/version.ts", "APP_RELEASE_STAGE");
requireIncludes("src/components/workspace-system/workspace-system-page.tsx", "WorkspaceProPage");
requireIncludes("src/components/workspace-pro/workspace-pro-page.tsx", "ws-pro-shell");
requireIncludes("src/app/globals.css", "ws-pro-primary-button");

if (failures.length) {
  console.error("[workspace:performance:ready] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("[workspace:performance:ready] OK — Workspace performance readiness aligned.");
