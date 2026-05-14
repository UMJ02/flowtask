#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const expectedVersion = "58.26.2-workspace-performance-query-optimization";
const expectedRelease = "v58.26.2 Workspace Performance + Query Optimization";
const exists = (rel) => fs.existsSync(path.join(root, rel));
const read = (rel) => exists(rel) ? fs.readFileSync(path.join(root, rel), "utf8") : "";
const requireFile = (rel) => { if (!exists(rel)) failures.push(`Missing required file: ${rel}`); };
const requireIncludes = (rel, text) => { if (!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); };

const pkg = JSON.parse(read("package.json") || "{}");
if (pkg.version !== expectedVersion) failures.push(`package version must be ${expectedVersion}`);
if ((pkg.scripts ?? {})["verify:current"] !== "npm run verify:v58.26.2") failures.push("verify:current must target verify:v58.26.2");
if ((pkg.scripts ?? {})["verify:v58.26.2"] !== "node scripts/verify-v58.26.2.mjs") failures.push("verify:v58.26.2 script missing");
if ((pkg.scripts ?? {})["workspace:performance:ready"] !== "node scripts/workspace-performance-readiness-check.mjs") failures.push("workspace:performance:ready script missing");

for (const rel of [
  "scripts/verify-v58.26.2.mjs",
  "scripts/workspace-performance-readiness-check.mjs",
  "src/lib/workspace-system/performance.ts",
  "src/app/(app)/app/workspace/page.tsx",
  "src/lib/workspace-system/server-data.ts",
  "docs/release/V58_26_2_WORKSPACE_PERFORMANCE_QUERY_OPTIMIZATION.md",
  "docs/qa/FLOWTASK_V58_26_2_WORKSPACE_PERFORMANCE_QA.md",
]) requireFile(rel);

requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedRelease);
requireIncludes("package-lock.json", expectedVersion);
requireIncludes("src/app/globals.css", "v58.26.2 — Workspace Performance + Query Optimization");
requireIncludes("src/app/(app)/app/workspace/page.tsx", "buildWorkspaceLoadPlan");
requireIncludes("src/app/(app)/app/workspace/page.tsx", "loadPlan.reports");
requireIncludes("src/lib/workspace-system/performance.ts", "WORKSPACE_QUERY_LIMITS");
requireIncludes("scripts/workspace-performance-readiness-check.mjs", "workspace:performance:ready");
requireIncludes("README.md", "v58.26.2");

if (failures.length) {
  console.error("[verify:v58.26.2] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[verify:v58.26.2] OK — Workspace Performance + Query Optimization aligned.");
