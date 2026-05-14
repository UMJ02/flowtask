#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const exists = (rel) => fs.existsSync(path.join(root, rel));
const read = (rel) => exists(rel) ? fs.readFileSync(path.join(root, rel), "utf8") : "";
const requireFile = (rel) => { if (!exists(rel)) failures.push(`Missing required file: ${rel}`); };
const requireIncludes = (rel, text) => { if (!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); };

const pkg = JSON.parse(read("package.json") || "{}");
if (pkg.version !== "58.26.3-workspace-notifications-activity-automation-polish") failures.push(`Unexpected package version: ${pkg.version}`);
if (pkg.scripts?.["workspace:performance:ready"] !== "node scripts/workspace-performance-readiness-check.mjs") failures.push("workspace:performance:ready script missing");
if (!String(pkg.scripts?.["build:preflight"] ?? "").includes("workspace:performance:ready")) failures.push("build:preflight must include workspace:performance:ready");

for (const rel of [
  "src/lib/workspace-system/performance.ts",
  "src/app/(app)/app/workspace/page.tsx",
  "src/lib/workspace-system/server-data.ts",
  "docs/release/V58_26_3_WORKSPACE_NOTIFICATIONS_ACTIVITY_AUTOMATION_POLISH.md",
  "docs/qa/FLOWTASK_V58_26_3_WORKSPACE_NOTIFICATIONS_ACTIVITY_AUTOMATION_QA.md",
  "scripts/verify-v58.26.3.mjs",
]) requireFile(rel);

requireIncludes("src/lib/workspace-system/performance.ts", "buildWorkspaceLoadPlan");
requireIncludes("src/lib/workspace-system/performance.ts", "WORKSPACE_QUERY_LIMITS");
requireIncludes("src/app/(app)/app/workspace/page.tsx", "buildWorkspaceLoadPlan");
requireIncludes("src/app/(app)/app/workspace/page.tsx", "loadPlan.reports");
requireIncludes("src/app/(app)/app/workspace/page.tsx", "loadPlan.boards");
requireIncludes("src/app/(app)/app/workspace/page.tsx", "loadPlan.files");
requireIncludes("src/app/(app)/app/workspace/page.tsx", "loadPlan.activity");
requireIncludes("src/app/(app)/app/workspace/page.tsx", "loadPlan.notifications");
requireIncludes("src/lib/workspace-system/server-data.ts", "WORKSPACE_QUERY_LIMITS.boards");
requireIncludes("src/lib/workspace-system/server-data.ts", "WORKSPACE_QUERY_LIMITS.activity");
requireIncludes("src/lib/workspace-system/server-data.ts", "WORKSPACE_QUERY_LIMITS.files");
requireIncludes("src/lib/workspace-system/server-data.ts", "WORKSPACE_QUERY_LIMITS.notifications");
requireIncludes("src/lib/release/version.ts", "58.26.3-workspace-notifications-activity-automation-polish");
requireIncludes("src/lib/release/version.ts", "v58.26.3 Workspace Notifications + Activity Automation Polish");
requireIncludes("src/app/globals.css", "v58.26.3 — Workspace Notifications + Activity Automation Polish");
requireIncludes("README.md", "v58.26.3");

if (failures.length) {
  console.error("[workspace:performance:ready] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("[workspace:performance:ready] OK — Workspace notifications, automation, and query limits are aligned.");
