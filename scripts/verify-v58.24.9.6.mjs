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

const expectedVersion = "58.24.9.6-task-visibility-rules-professional-actions-feedback";
const expectedRelease = "v58.24.9.6 Task Visibility Rules + Professional Actions Feedback";

const pkg = JSON.parse(read("package.json"));
if (pkg.version !== expectedVersion) failures.push("package version must be v58.24.9.6");
if ((pkg.scripts ?? {})["verify:current"] !== "npm run verify:v58.24.9.6") failures.push("verify:current must target verify:v58.24.9.6");
if ((pkg.scripts ?? {})["verify:v58.24.9.6"] !== "node scripts/verify-v58.24.9.6.mjs") failures.push("verify:v58.24.9.6 script must be available");

requireFile("scripts/verify-v58.24.9.6.mjs");
requireFile("docs/release/V58_24_9_6_TASK_VISIBILITY_RULES_PROFESSIONAL_ACTIONS_FEEDBACK.md");
requireFile("docs/qa/FLOWTASK_V58_24_9_6_TASK_VISIBILITY_RULES_PROFESSIONAL_ACTIONS_FEEDBACK_QA.md");

requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedRelease);
requireIncludes("package-lock.json", expectedVersion);
requireIncludes("README.md", "v58.24.9.6");

requireIncludes("src/lib/queries/tasks.ts", "Main Tasks module shows all workspace tasks by default.");
requireNotIncludes("src/lib/queries/tasks.ts", "query = query.is(\"project_id\", null)");
requireIncludes("src/app/(app)/app/tasks/page.tsx", "todas las tareas del workspace");
requireIncludes("src/components/workspace/workspace-home.tsx", ".limit(500)");
requireIncludes("src/components/tasks/task-action-list.tsx", "ConfirmAction");
requireIncludes("src/components/tasks/task-action-list.tsx", "confirmPendingAction");
requireIncludes("src/components/tasks/task-action-list.tsx", "requestDeleteTask");
requireIncludes("src/components/tasks/task-action-list.tsx", "requestBulkDeleteSelected");
requireNotIncludes("src/components/tasks/task-action-list.tsx", "window.alert");
requireNotIncludes("src/components/tasks/task-action-list.tsx", "window.confirm");
requireIncludes("src/components/tasks/task-workspace-inline.tsx", "confirmDeleteOpen");
requireIncludes("src/components/tasks/task-workspace-inline.tsx", "deleteCurrentTask");
requireIncludes("src/components/tasks/task-workspace-inline.tsx", "Eliminar");
requireNotIncludes("src/components/tasks/task-workspace-inline.tsx", "window.alert");
requireNotIncludes("src/components/tasks/task-workspace-inline.tsx", "window.confirm");

if (failures.length) {
  console.error("[verify:v58.24.9.6] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[verify:v58.24.9.6] OK — Task visibility rules and professional action feedback aligned.");
