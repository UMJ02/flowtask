#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const expectedVersion = "58.25.6.1-tasks-kanban-ui-system-migration";

function exists(rel){ return fs.existsSync(path.join(root, rel)); }
function read(rel){ return exists(rel) ? fs.readFileSync(path.join(root, rel), "utf8") : ""; }
function requireFile(rel){ if(!exists(rel)) failures.push(`Missing required file: ${rel}`); }
function requireIncludes(rel, text){ if(!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); }
function requireNotIncludes(rel, text){ if(read(rel).includes(text)) failures.push(`Did not expect '${text}' in ${rel}`); }

for (const rel of [
  "package.json",
  "package-lock.json",
  "vercel.json",
  "next.config.ts",
  ".nvmrc",
  ".env.example",
  "scripts/runtime-check.mjs",
  "scripts/validate-env.mjs",
  "scripts/design-doctor.mjs",
  "scripts/verify-v58.25.6.1.mjs",
  "docs/release/V58_25_6_1_TASKS_KANBAN_UI_SYSTEM_MIGRATION.md",
  "docs/qa/FLOWTASK_V58_25_6_1_TASKS_KANBAN_UI_SYSTEM_MIGRATION_QA.md",
  "src/components/tasks/task-action-list.tsx",
  "src/components/tasks/task-kanban-board.tsx",
  "src/components/tasks/task-filters.tsx",
  "src/components/tasks/task-form.tsx",
]) requireFile(rel);

const pkg = JSON.parse(read("package.json"));
const scripts = pkg.scripts ?? {};
if (pkg.version !== expectedVersion) failures.push(`Unexpected package version: ${pkg.version}`);
if (scripts["verify:current"] !== "npm run verify:v58.25.6.1") failures.push("verify:current must target verify:v58.25.6.1");
if (scripts["verify:v58.25.6.1"] !== "node scripts/verify-v58.25.6.1.mjs") failures.push("verify:v58.25.6.1 must target scripts/verify-v58.25.6.1.mjs");

const vercel = JSON.parse(read("vercel.json"));
if (vercel.framework !== "nextjs") failures.push("vercel.json framework must be nextjs");
if (vercel.buildCommand !== "npm run vercel:build") failures.push("vercel.json buildCommand must be npm run vercel:build");

requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("package-lock.json", expectedVersion);
requireIncludes("src/app/globals.css", "v58.25.6.1 — Tasks + Kanban UI System Migration");
requireIncludes("src/components/tasks/task-action-list.tsx", "ft-tasks-screen");
requireIncludes("src/components/tasks/task-kanban-board.tsx", "ft-kanban-grid");
requireIncludes("src/components/tasks/task-filters.tsx", "ft-task-filter-panel");
requireIncludes("src/components/tasks/task-form.tsx", "ft-task-form-panel");
requireNotIncludes("src/components/tasks/task-action-list.tsx", "animate-[importantPulse");
requireNotIncludes("src/components/tasks/task-kanban-board.tsx", "animate-[importantPulse");

if (failures.length) {
  console.error("[build-deploy-readiness] Failed checks:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[build-deploy-readiness] OK — v58.25.6.1 Tasks + Kanban UI system migration readiness aligned.");
