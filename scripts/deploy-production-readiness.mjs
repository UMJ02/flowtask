#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const expectedVersion = "58.24.9.5-important-tasks-ux-analytics-separation";

function exists(rel){ return fs.existsSync(path.join(root, rel)); }
function read(rel){ return exists(rel) ? fs.readFileSync(path.join(root, rel), "utf8") : ""; }
function pass(label){ console.log(`[deploy-production-readiness] OK - ${label}`); }
function fail(label){ failures.push(label); }

const pkg = JSON.parse(read("package.json"));
const scripts = pkg.scripts ?? {};

pkg.version === expectedVersion ? pass("package version aligned") : fail(`package version must be ${expectedVersion}`);
scripts["verify:current"] === "npm run verify:v58.24.9.5" ? pass("verify current aligned") : fail("verify:current must target verify:v58.24.9.5");
scripts["verify:v58.24.9.5"] === "node scripts/verify-v58.24.9.5.mjs" ? pass("version verifier available") : fail("verify:v58.24.9.5 script missing or incorrect");

for (const [label, rel] of [
  ["verify-v58.24.9.5 script exists", "scripts/verify-v58.24.9.5.mjs"],
  ["release notes available", "docs/release/V58_24_9_5_IMPORTANT_TASKS_UX_ANALYTICS_SEPARATION.md"],
  ["QA document available", "docs/qa/FLOWTASK_V58_24_9_5_IMPORTANT_TASKS_UX_ANALYTICS_SEPARATION_QA.md"],
  ["Kanban component available", "src/components/tasks/task-kanban-board.tsx"],
  ["Workspace home available", "src/components/workspace/workspace-home.tsx"],
  ["Task action list available", "src/components/tasks/task-action-list.tsx"]
]) exists(rel) ? pass(label) : fail(`${label}: missing ${rel}`);

read("src/lib/release/version.ts").includes(expectedVersion) ? pass("runtime version export aligned") : fail("src/lib/release/version.ts must export v58.24.9.5");
read("src/components/tasks/task-kanban-board.tsx").includes("onTaskPriorityChange") ? pass("Kanban priority callback available") : fail("Kanban priority callback missing");
read("src/components/tasks/task-kanban-board.tsx").includes(".select(\"id,priority,updated_at\")") ? pass("Kanban priority mutation confirms row") : fail("Kanban priority confirmation missing");
read("src/components/workspace/workspace-home.tsx").includes("handleTaskPriorityChange") ? pass("Workspace important KPI updates locally") : fail("Workspace important KPI local update missing");
read("src/components/workspace/workspace-home.tsx").includes("Foco, no avance") ? pass("Analytics separation label available") : fail("Analytics separation helper missing");
read("src/components/tasks/task-action-list.tsx").includes("importantOnly") ? pass("Important-only list state available") : fail("importantOnly state missing");
read("src/components/tasks/task-action-list.tsx").includes("Solo importantes") ? pass("Important-only filter available") : fail("Solo importantes filter missing");
read("package-lock.json").includes(expectedVersion) ? pass("package-lock version aligned") : fail("package-lock.json must include v58.24.9.5 package version");

const vercel = JSON.parse(read("vercel.json"));
vercel.framework === "nextjs" ? pass("Vercel framework aligned") : fail("vercel.json framework must be nextjs");
vercel.buildCommand === "npm run vercel:build" ? pass("Vercel build command aligned") : fail("vercel.json buildCommand must be npm run vercel:build");

if (failures.length) {
  console.error("[deploy-production-readiness] Failed checks:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[deploy-production-readiness] OK — v58.24.9.5 production readiness aligned.");
