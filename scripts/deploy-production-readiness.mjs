#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const expectedVersion = "58.24.9.6-task-visibility-rules-professional-actions-feedback";

function exists(rel){ return fs.existsSync(path.join(root, rel)); }
function read(rel){ return exists(rel) ? fs.readFileSync(path.join(root, rel), "utf8") : ""; }
function pass(label){ console.log(`[deploy-production-readiness] OK - ${label}`); }
function fail(label){ failures.push(label); }

const pkg = JSON.parse(read("package.json"));
const scripts = pkg.scripts ?? {};

pkg.version === expectedVersion ? pass("package version aligned") : fail(`package version must be ${expectedVersion}`);
scripts["verify:current"] === "npm run verify:v58.24.9.6" ? pass("verify current aligned") : fail("verify:current must target verify:v58.24.9.6");
scripts["verify:v58.24.9.6"] === "node scripts/verify-v58.24.9.6.mjs" ? pass("version verifier available") : fail("verify:v58.24.9.6 script missing or incorrect");

for (const [label, rel] of [
  ["verify-v58.24.9.6 script exists", "scripts/verify-v58.24.9.6.mjs"],
  ["release notes available", "docs/release/V58_24_9_6_TASK_VISIBILITY_RULES_PROFESSIONAL_ACTIONS_FEEDBACK.md"],
  ["QA document available", "docs/qa/FLOWTASK_V58_24_9_6_TASK_VISIBILITY_RULES_PROFESSIONAL_ACTIONS_FEEDBACK_QA.md"],
  ["Task query available", "src/lib/queries/tasks.ts"],
  ["Task action list available", "src/components/tasks/task-action-list.tsx"],
  ["Task detail available", "src/components/tasks/task-workspace-inline.tsx"]
]) exists(rel) ? pass(label) : fail(`${label}: missing ${rel}`);

read("src/lib/release/version.ts").includes(expectedVersion) ? pass("runtime version export aligned") : fail("src/lib/release/version.ts must export v58.24.9.6");
read("src/lib/queries/tasks.ts").includes("Main Tasks module shows all workspace tasks by default.") ? pass("Tasks query includes all workspace tasks") : fail("Tasks query visibility rule missing");
!read("src/lib/queries/tasks.ts").includes("query = query.is(\"project_id\", null)") ? pass("Standalone-only task filter removed") : fail("project_id null filter should be removed");
read("src/components/workspace/workspace-home.tsx").includes(".limit(500)") ? pass("Workspace Kanban load limit hardened") : fail("Workspace task load limit should be 500");
read("src/components/tasks/task-action-list.tsx").includes("ConfirmAction") ? pass("Task list confirmation model available") : fail("Task list confirmation model missing");
!read("src/components/tasks/task-action-list.tsx").includes("window.alert") ? pass("Task list browser alerts removed") : fail("Task list should not use window.alert");
!read("src/components/tasks/task-action-list.tsx").includes("window.confirm") ? pass("Task list browser confirms removed") : fail("Task list should not use window.confirm");
read("src/components/tasks/task-workspace-inline.tsx").includes("deleteCurrentTask") ? pass("Task detail delete action available") : fail("Task detail delete action missing");
!read("src/components/tasks/task-workspace-inline.tsx").includes("window.alert") ? pass("Task detail browser alerts removed") : fail("Task detail should not use window.alert");
!read("src/components/tasks/task-workspace-inline.tsx").includes("window.confirm") ? pass("Task detail browser confirms removed") : fail("Task detail should not use window.confirm");
read("package-lock.json").includes(expectedVersion) ? pass("package-lock version aligned") : fail("package-lock.json must include v58.24.9.6 package version");

const vercel = JSON.parse(read("vercel.json"));
vercel.framework === "nextjs" ? pass("Vercel framework aligned") : fail("vercel.json framework must be nextjs");
vercel.buildCommand === "npm run vercel:build" ? pass("Vercel build command aligned") : fail("vercel.json buildCommand must be npm run vercel:build");

if (failures.length) {
  console.error("[deploy-production-readiness] Failed checks:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[deploy-production-readiness] OK — v58.24.9.6 production readiness aligned.");
