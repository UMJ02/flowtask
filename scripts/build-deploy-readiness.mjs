#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const expectedVersion = "58.24.9.3-workspace-kanban-status-isolation-important-tasks-performance";
const expectedReleaseLabel = "v58.24.9.3 Workspace Kanban Status Isolation + Important Tasks Performance";

function exists(rel){ return fs.existsSync(path.join(root, rel)); }
function read(rel){ return exists(rel) ? fs.readFileSync(path.join(root, rel), "utf8") : ""; }
function requireFile(rel){ if(!exists(rel)) failures.push(`Missing required file: ${rel}`); }
function requireIncludes(rel, text){ if(!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); }
function requireNotIncludes(rel, text){ if(read(rel).includes(text)) failures.push(`Did not expect '${text}' in ${rel}`); }

for (const rel of [
  "package.json","package-lock.json","vercel.json","next.config.ts",".nvmrc",".env.example",
  "scripts/runtime-check.mjs","scripts/validate-env.mjs","scripts/verify-v58.24.9.3.mjs",
  "docs/release/V58_24_9_3_WORKSPACE_KANBAN_STATUS_ISOLATION_IMPORTANT_TASKS_PERFORMANCE.md",
  "docs/qa/FLOWTASK_V58_24_9_3_WORKSPACE_KANBAN_STATUS_ISOLATION_IMPORTANT_TASKS_PERFORMANCE_QA.md",
  "src/components/tasks/task-kanban-board.tsx",
  "src/components/workspace/workspace-home.tsx"
]) requireFile(rel);

const pkg = JSON.parse(read("package.json"));
const scripts = pkg.scripts ?? {};
for (const scriptName of ["build","vercel:build","deploy:readiness","build:preflight","verify:current","deploy:production:ready","verify:v58.24.9.3"]) {
  if (!scripts[scriptName]) failures.push(`Missing package script: ${scriptName}`);
}

if (pkg.version !== expectedVersion) failures.push(`Unexpected package version: ${pkg.version}`);
if (scripts["verify:current"] !== "npm run verify:v58.24.9.3") failures.push("verify:current must target verify:v58.24.9.3");
if (scripts["verify:v58.24.9.3"] !== "node scripts/verify-v58.24.9.3.mjs") failures.push("verify:v58.24.9.3 must target scripts/verify-v58.24.9.3.mjs");

const vercel = JSON.parse(read("vercel.json"));
if (vercel.framework !== "nextjs") failures.push("vercel.json framework must be nextjs");
if (vercel.buildCommand !== "npm run vercel:build") failures.push("vercel.json buildCommand must be npm run vercel:build");

requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedReleaseLabel);
requireIncludes("package-lock.json", expectedVersion);
requireIncludes("src/components/tasks/task-kanban-board.tsx", "Keep each task in its real persisted status.");
requireIncludes("src/components/tasks/task-kanban-board.tsx", "toggleImportant");
requireIncludes("src/components/tasks/task-kanban-board.tsx", "priority: nextPriority");
requireIncludes("src/components/workspace/workspace-home.tsx", "importantCount");
requireIncludes("src/components/workspace/workspace-home.tsx", "label=\"Importantes\"");
requireNotIncludes("src/components/workspace/workspace-home.tsx", "flowtask.memory.v1");

if (failures.length) {
  console.error("[build-deploy-readiness] Failed checks:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[build-deploy-readiness] OK — v58.24.9.3 Kanban status isolation and important tasks readiness aligned.");
