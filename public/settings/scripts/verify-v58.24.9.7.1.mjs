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

const expectedVersion = "58.24.9.7.1-important-filter-no-auto-reorder-selection-stability";
const expectedRelease = "v58.24.9.7.1 Important Filter + No Auto Reorder + Selection Stability";

const pkg = JSON.parse(read("package.json"));
if (pkg.version !== expectedVersion) failures.push("package version must be v58.24.9.7.1");
if ((pkg.scripts ?? {})["verify:current"] !== "npm run verify:v58.24.9.7.1") failures.push("verify:current must target verify:v58.24.9.7.1");
if ((pkg.scripts ?? {})["verify:v58.24.9.7.1"] !== "node scripts/verify-v58.24.9.7.1.mjs") failures.push("verify:v58.24.9.7.1 script must be available");

requireFile("scripts/verify-v58.24.9.7.1.mjs");
requireFile("docs/release/V58_24_9_7_1_IMPORTANT_FILTER_NO_AUTO_REORDER_SELECTION_STABILITY.md");
requireFile("docs/qa/FLOWTASK_V58_24_9_7_1_IMPORTANT_FILTER_NO_AUTO_REORDER_SELECTION_STABILITY_QA.md");

requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedRelease);
requireIncludes("package-lock.json", expectedVersion);
requireIncludes("README.md", "v58.24.9.7.1");

requireIncludes("src/components/tasks/task-action-list.tsx", "importantOnly");
requireIncludes("src/components/tasks/task-action-list.tsx", "Solo importantes");
requireIncludes("src/components/tasks/task-action-list.tsx", "visibleItems.slice");
requireIncludes("src/components/tasks/task-action-list.tsx", "importantPulse");
requireNotIncludes("src/components/tasks/task-action-list.tsx", "importantFirstTasks");
requireNotIncludes("src/components/tasks/task-action-list.tsx", "sortedItems");

requireIncludes("src/components/tasks/task-kanban-board.tsx", "importantPulse");
requireNotIncludes("src/components/tasks/task-kanban-board.tsx", "importantFirstTasks");

if (failures.length) {
  console.error("[verify:v58.24.9.7.1] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[verify:v58.24.9.7.1] OK — Important filter, no auto reorder and selection stability aligned.");
