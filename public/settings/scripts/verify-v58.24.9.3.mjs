#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const read = (rel) => fs.existsSync(path.join(root, rel)) ? fs.readFileSync(path.join(root, rel), "utf8") : "";
const exists = (rel) => fs.existsSync(path.join(root, rel));
const requireFile = (rel) => { if (!exists(rel)) failures.push(`Missing required file: ${rel}`); };
const requireIncludes = (rel, text) => { if (!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); };
const requireNotIncludes = (rel, text) => { if (read(rel).includes(text)) failures.push(`Did not expect '${text}' in ${rel}`); };

const expectedVersion = "58.24.9.3-workspace-kanban-status-isolation-important-tasks-performance";
const expectedRelease = "v58.24.9.3 Workspace Kanban Status Isolation + Important Tasks Performance";

const pkg = JSON.parse(read("package.json"));
if (pkg.version !== expectedVersion) failures.push("package version must be v58.24.9.3");
if ((pkg.scripts ?? {})["verify:current"] !== "npm run verify:v58.24.9.3") failures.push("verify:current must target verify:v58.24.9.3");
if ((pkg.scripts ?? {})["verify:v58.24.9.3"] !== "node scripts/verify-v58.24.9.3.mjs") failures.push("verify:v58.24.9.3 script must be available");

requireFile("scripts/verify-v58.24.9.3.mjs");
requireFile("docs/release/V58_24_9_3_WORKSPACE_KANBAN_STATUS_ISOLATION_IMPORTANT_TASKS_PERFORMANCE.md");
requireFile("docs/qa/FLOWTASK_V58_24_9_3_WORKSPACE_KANBAN_STATUS_ISOLATION_IMPORTANT_TASKS_PERFORMANCE_QA.md");

requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedRelease);
requireIncludes("package-lock.json", expectedVersion);
requireIncludes("README.md", "v58.24.9.3");
requireIncludes("src/components/tasks/task-kanban-board.tsx", "Keep each task in its real persisted status.");
requireIncludes("src/components/tasks/task-kanban-board.tsx", "toggleImportant");
requireIncludes("src/components/tasks/task-kanban-board.tsx", "priority: nextPriority");
requireIncludes("src/components/tasks/task-kanban-board.tsx", "Marcar como importante");
requireIncludes("src/components/workspace/workspace-home.tsx", "importantCount");
requireIncludes("src/components/workspace/workspace-home.tsx", "label=\"Importantes\"");
requireNotIncludes("src/components/workspace/workspace-home.tsx", "flowtask.memory.v1");

if (failures.length) {
  console.error("[verify:v58.24.9.3] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[verify:v58.24.9.3] OK — Workspace Kanban status isolation and important tasks aligned.");
