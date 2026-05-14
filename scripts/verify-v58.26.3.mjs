#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const expectedVersion = "58.26.3-workspace-notifications-activity-automation-polish";
const expectedRelease = "v58.26.3 Workspace Notifications + Activity Automation Polish";
const exists = (rel) => fs.existsSync(path.join(root, rel));
const read = (rel) => exists(rel) ? fs.readFileSync(path.join(root, rel), "utf8") : "";
const requireFile = (rel) => { if (!exists(rel)) failures.push(`Missing required file: ${rel}`); };
const requireIncludes = (rel, text) => { if (!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); };

const pkg = JSON.parse(read("package.json") || "{}");
if (pkg.version !== expectedVersion) failures.push(`package version must be ${expectedVersion}`);
if ((pkg.scripts ?? {})["verify:current"] !== "npm run verify:v58.26.3") failures.push("verify:current must target verify:v58.26.3");
if ((pkg.scripts ?? {})["verify:v58.26.3"] !== "node scripts/verify-v58.26.3.mjs") failures.push("verify:v58.26.3 script missing");
if ((pkg.scripts ?? {})["workspace:automation:ready"] !== "node scripts/workspace-notifications-automation-readiness-check.mjs") failures.push("workspace:automation:ready script missing");

for (const rel of [
  "scripts/verify-v58.26.3.mjs",
  "scripts/workspace-notifications-automation-readiness-check.mjs",
  "src/components/workspace-system/workspace-notifications-automation.tsx",
  "src/components/workspace-system/workspace-right-panel.tsx",
  "src/lib/workspace-system/server-data.ts",
  "src/lib/workspace-system/performance.ts",
  "src/lib/workspace-system/view-state.ts",
  "docs/release/V58_26_3_WORKSPACE_NOTIFICATIONS_ACTIVITY_AUTOMATION_POLISH.md",
  "docs/qa/FLOWTASK_V58_26_3_WORKSPACE_NOTIFICATIONS_ACTIVITY_AUTOMATION_QA.md",
]) requireFile(rel);

requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedRelease);
requireIncludes("package-lock.json", expectedVersion);
requireIncludes("src/components/workspace-system/workspace-notifications-automation.tsx", "WorkspaceNotificationsAutomationPanel");
requireIncludes("src/lib/workspace-system/server-data.ts", "notifications");
requireIncludes("src/app/(app)/app/workspace/page.tsx", "workspaceNotifications");
requireIncludes("src/app/globals.css", "ft-ws-automation-signal");
requireIncludes("README.md", "v58.26.3");

if (failures.length) {
  console.error("[verify:v58.26.3] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[verify:v58.26.3] OK — Workspace Notifications + Activity Automation Polish aligned.");
