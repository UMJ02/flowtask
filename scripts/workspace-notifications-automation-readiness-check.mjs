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
if (pkg.scripts?.["workspace:automation:ready"] !== "node scripts/workspace-notifications-automation-readiness-check.mjs") failures.push("workspace:automation:ready script missing");
if (!String(pkg.scripts?.["build:preflight"] ?? "").includes("workspace:automation:ready")) failures.push("build:preflight must include workspace:automation:ready");

for (const rel of [
  "src/components/workspace-system/workspace-notifications-automation.tsx",
  "src/components/workspace-system/workspace-right-panel.tsx",
  "src/lib/workspace-system/server-data.ts",
  "src/lib/workspace-system/performance.ts",
  "src/lib/workspace-system/view-state.ts",
  "src/app/(app)/app/workspace/page.tsx",
  "docs/release/V58_26_3_WORKSPACE_NOTIFICATIONS_ACTIVITY_AUTOMATION_POLISH.md",
  "docs/qa/FLOWTASK_V58_26_3_WORKSPACE_NOTIFICATIONS_ACTIVITY_AUTOMATION_QA.md",
]) requireFile(rel);

requireIncludes("src/lib/workspace-system/view-state.ts", "WorkspaceNotificationSummary");
requireIncludes("src/lib/workspace-system/server-data.ts", "getWorkspaceNotificationDigest");
requireIncludes("src/lib/workspace-system/performance.ts", "notifications: boolean");
requireIncludes("src/lib/workspace-system/performance.ts", "WORKSPACE_QUERY_LIMITS");
requireIncludes("src/app/(app)/app/workspace/page.tsx", "loadPlan.notifications");
requireIncludes("src/app/(app)/app/workspace/page.tsx", "getWorkspaceNotificationDigest");
requireIncludes("src/components/workspace-system/workspace-right-panel.tsx", "WorkspaceNotificationsAutomationPanel");
requireIncludes("src/app/globals.css", "v58.26.3 — Workspace Notifications + Activity Automation Polish");
requireIncludes("src/lib/release/version.ts", "58.26.3-workspace-notifications-activity-automation-polish");
requireIncludes("README.md", "v58.26.3");

if (failures.length) {
  console.error("[workspace:automation:ready] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("[workspace:automation:ready] OK — Workspace notifications and activity automation polish aligned.");
