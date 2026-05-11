#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const expectedVersion = "58.24.9.3-workspace-kanban-status-isolation-important-tasks-performance";

function exists(rel){ return fs.existsSync(path.join(root, rel)); }
function read(rel){ return exists(rel) ? fs.readFileSync(path.join(root, rel), "utf8") : ""; }
function pass(label){ console.log(`[deploy-production-readiness] OK - ${label}`); }
function fail(label){ failures.push(label); }

const pkg = JSON.parse(read("package.json"));
const scripts = pkg.scripts ?? {};

pkg.version === expectedVersion ? pass("package version aligned") : fail(`package version must be ${expectedVersion}`);
scripts["verify:current"] === "npm run verify:v58.24.9.3" ? pass("verify current aligned") : fail("verify:current must target verify:v58.24.9.3");
scripts["verify:v58.24.9.3"] === "node scripts/verify-v58.24.9.3.mjs" ? pass("version verifier available") : fail("verify:v58.24.9.3 script missing or incorrect");

for (const [label, rel] of [
  ["verify-v58.24.9.3 script exists", "scripts/verify-v58.24.9.3.mjs"],
  ["release notes available", "docs/release/V58_24_9_3_WORKSPACE_KANBAN_STATUS_ISOLATION_IMPORTANT_TASKS_PERFORMANCE.md"],
  ["QA document available", "docs/qa/FLOWTASK_V58_24_9_3_WORKSPACE_KANBAN_STATUS_ISOLATION_IMPORTANT_TASKS_PERFORMANCE_QA.md"],
  ["Kanban component available", "src/components/tasks/task-kanban-board.tsx"],
  ["Workspace home available", "src/components/workspace/workspace-home.tsx"]
]) exists(rel) ? pass(label) : fail(`${label}: missing ${rel}`);

read("src/lib/release/version.ts").includes(expectedVersion) ? pass("runtime version export aligned") : fail("src/lib/release/version.ts must export v58.24.9.3");
read("src/components/tasks/task-kanban-board.tsx").includes("Keep each task in its real persisted status.") ? pass("hidden status remap removed") : fail("hidden status remap fix missing");
read("src/components/tasks/task-kanban-board.tsx").includes("toggleImportant") ? pass("Kanban important toggle available") : fail("Kanban important toggle missing");
read("src/components/workspace/workspace-home.tsx").includes("importantCount") ? pass("Important KPI available") : fail("Important KPI missing");
!read("src/components/workspace/workspace-home.tsx").includes("flowtask.memory.v1") ? pass("localStorage favorite KPI removed") : fail("localStorage favorite KPI should not be used");
read("package-lock.json").includes(expectedVersion) ? pass("package-lock version aligned") : fail("package-lock.json must include v58.24.9.3 package version");

const vercel = JSON.parse(read("vercel.json"));
vercel.framework === "nextjs" ? pass("Vercel framework aligned") : fail("vercel.json framework must be nextjs");
vercel.buildCommand === "npm run vercel:build" ? pass("Vercel build command aligned") : fail("vercel.json buildCommand must be npm run vercel:build");

if (failures.length) {
  console.error("[deploy-production-readiness] Failed checks:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[deploy-production-readiness] OK — v58.24.9.3 production readiness aligned.");
