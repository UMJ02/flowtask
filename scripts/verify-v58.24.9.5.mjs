#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const read = (rel) => fs.existsSync(path.join(root, rel)) ? fs.readFileSync(path.join(root, rel), "utf8") : "";
const exists = (rel) => fs.existsSync(path.join(root, rel));
const requireFile = (rel) => { if (!exists(rel)) failures.push(`Missing required file: ${rel}`); };
const requireIncludes = (rel, text) => { if (!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); };

const expectedVersion = "58.24.9.5-important-tasks-ux-analytics-separation";
const expectedRelease = "v58.24.9.5 Important Tasks UX + Analytics Separation";

const pkg = JSON.parse(read("package.json"));
if (pkg.version !== expectedVersion) failures.push("package version must be v58.24.9.5");
if ((pkg.scripts ?? {})["verify:current"] !== "npm run verify:v58.24.9.5") failures.push("verify:current must target verify:v58.24.9.5");
if ((pkg.scripts ?? {})["verify:v58.24.9.5"] !== "node scripts/verify-v58.24.9.5.mjs") failures.push("verify:v58.24.9.5 script must be available");

requireFile("scripts/verify-v58.24.9.5.mjs");
requireFile("docs/release/V58_24_9_5_IMPORTANT_TASKS_UX_ANALYTICS_SEPARATION.md");
requireFile("docs/qa/FLOWTASK_V58_24_9_5_IMPORTANT_TASKS_UX_ANALYTICS_SEPARATION_QA.md");

requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedRelease);
requireIncludes("package-lock.json", expectedVersion);
requireIncludes("README.md", "v58.24.9.5");

requireIncludes("src/components/tasks/task-kanban-board.tsx", "onTaskPriorityChange");
requireIncludes("src/components/tasks/task-kanban-board.tsx", ".select(\"id,priority,updated_at\")");
requireIncludes("src/components/tasks/task-kanban-board.tsx", "onTaskPriorityChange?.(taskId, confirmedPriority)");
requireIncludes("src/components/workspace/workspace-home.tsx", "handleTaskPriorityChange");
requireIncludes("src/components/workspace/workspace-home.tsx", "Foco, no avance");
requireIncludes("src/components/tasks/task-action-list.tsx", "importantOnly");
requireIncludes("src/components/tasks/task-action-list.tsx", "Solo importantes");
requireIncludes("src/components/tasks/task-action-list.tsx", "visibleItems");

if (failures.length) {
  console.error("[verify:v58.24.9.5] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[verify:v58.24.9.5] OK — Important tasks UX and analytics separation aligned.");
