#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const expectedVersion = "58.24.9.6-task-visibility-rules-professional-actions-feedback";
const expectedReleaseLabel = "v58.24.9.6 Task Visibility Rules + Professional Actions Feedback";

function exists(rel){ return fs.existsSync(path.join(root, rel)); }
function read(rel){ return exists(rel) ? fs.readFileSync(path.join(root, rel), "utf8") : ""; }
function requireFile(rel){ if(!exists(rel)) failures.push(`Missing required file: ${rel}`); }
function requireIncludes(rel, text){ if(!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); }
function requireNotIncludes(rel, text){ if(read(rel).includes(text)) failures.push(`Did not expect '${text}' in ${rel}`); }

for (const rel of [
  "package.json","package-lock.json","vercel.json","next.config.ts",".nvmrc",".env.example",
  "scripts/runtime-check.mjs","scripts/validate-env.mjs","scripts/verify-v58.24.9.6.mjs",
  "docs/release/V58_24_9_6_TASK_VISIBILITY_RULES_PROFESSIONAL_ACTIONS_FEEDBACK.md",
  "docs/qa/FLOWTASK_V58_24_9_6_TASK_VISIBILITY_RULES_PROFESSIONAL_ACTIONS_FEEDBACK_QA.md",
  "src/lib/queries/tasks.ts",
  "src/components/tasks/task-action-list.tsx",
  "src/components/tasks/task-workspace-inline.tsx",
  "src/components/workspace/workspace-home.tsx"
]) requireFile(rel);

const pkg = JSON.parse(read("package.json"));
const scripts = pkg.scripts ?? {};
for (const scriptName of ["build","vercel:build","deploy:readiness","build:preflight","verify:current","deploy:production:ready","verify:v58.24.9.6"]) {
  if (!scripts[scriptName]) failures.push(`Missing package script: ${scriptName}`);
}

if (pkg.version !== expectedVersion) failures.push(`Unexpected package version: ${pkg.version}`);
if (scripts["verify:current"] !== "npm run verify:v58.24.9.6") failures.push("verify:current must target verify:v58.24.9.6");
if (scripts["verify:v58.24.9.6"] !== "node scripts/verify-v58.24.9.6.mjs") failures.push("verify:v58.24.9.6 must target scripts/verify-v58.24.9.6.mjs");

const vercel = JSON.parse(read("vercel.json"));
if (vercel.framework !== "nextjs") failures.push("vercel.json framework must be nextjs");
if (vercel.buildCommand !== "npm run vercel:build") failures.push("vercel.json buildCommand must be npm run vercel:build");

requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedReleaseLabel);
requireIncludes("package-lock.json", expectedVersion);
requireIncludes("src/lib/queries/tasks.ts", "Main Tasks module shows all workspace tasks by default.");
requireNotIncludes("src/lib/queries/tasks.ts", "query = query.is(\"project_id\", null)");
requireIncludes("src/components/workspace/workspace-home.tsx", ".limit(500)");
requireIncludes("src/components/tasks/task-action-list.tsx", "ConfirmAction");
requireNotIncludes("src/components/tasks/task-action-list.tsx", "window.alert");
requireNotIncludes("src/components/tasks/task-action-list.tsx", "window.confirm");
requireIncludes("src/components/tasks/task-workspace-inline.tsx", "confirmDeleteOpen");
requireIncludes("src/components/tasks/task-workspace-inline.tsx", "deleteCurrentTask");
requireNotIncludes("src/components/tasks/task-workspace-inline.tsx", "window.alert");
requireNotIncludes("src/components/tasks/task-workspace-inline.tsx", "window.confirm");

if (failures.length) {
  console.error("[build-deploy-readiness] Failed checks:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[build-deploy-readiness] OK — v58.24.9.6 task visibility and professional actions readiness aligned.");
