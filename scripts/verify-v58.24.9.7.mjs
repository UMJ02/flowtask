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

const expectedVersion = "58.24.9.7-task-action-modal-polish-safe-delete-kanban-scale-hardening";
const expectedRelease = "v58.24.9.7 Task Action Modal Polish + Safe Delete + Kanban Scale Hardening";

const pkg = JSON.parse(read("package.json"));
if (pkg.version !== expectedVersion) failures.push("package version must be v58.24.9.7");
if ((pkg.scripts ?? {})["verify:current"] !== "npm run verify:v58.24.9.7") failures.push("verify:current must target verify:v58.24.9.7");
if ((pkg.scripts ?? {})["verify:v58.24.9.7"] !== "node scripts/verify-v58.24.9.7.mjs") failures.push("verify:v58.24.9.7 script must be available");

requireFile("scripts/verify-v58.24.9.7.mjs");
requireFile("docs/release/V58_24_9_7_TASK_ACTION_MODAL_POLISH_SAFE_DELETE_KANBAN_SCALE_HARDENING.md");
requireFile("docs/qa/FLOWTASK_V58_24_9_7_TASK_ACTION_MODAL_POLISH_SAFE_DELETE_KANBAN_SCALE_HARDENING_QA.md");
requireFile("supabase/migrations/0052_v58_24_9_7_task_safe_delete_indexes.sql");
requireFile("src/lib/tasks/safe-delete-client.ts");

requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedRelease);
requireIncludes("package-lock.json", expectedVersion);
requireIncludes("README.md", "v58.24.9.7");

requireIncludes("supabase/migrations/0052_v58_24_9_7_task_safe_delete_indexes.sql", "add column if not exists deleted_at");
requireIncludes("supabase/migrations/0052_v58_24_9_7_task_safe_delete_indexes.sql", "create or replace function public.safe_delete_task");
requireIncludes("src/lib/tasks/safe-delete-client.ts", "safeDeleteTaskClient");
requireIncludes("src/lib/tasks/safe-delete-client.ts", "safeDeleteTasksClient");
requireIncludes("src/lib/queries/tasks.ts", "query = query.is(\"deleted_at\", null)");
requireIncludes("src/components/workspace/workspace-home.tsx", ".is('deleted_at', null)");
requireIncludes("src/components/tasks/task-action-list.tsx", "newViewModalOpen");
requireIncludes("src/components/tasks/task-action-list.tsx", "openNewSavedViewModal");
requireIncludes("src/components/tasks/task-action-list.tsx", "safeDeleteTaskClient");
requireIncludes("src/components/tasks/task-workspace-inline.tsx", "safeDeleteTaskClient");
requireNotIncludes("src/components/tasks/task-action-list.tsx", "window.alert");
requireNotIncludes("src/components/tasks/task-action-list.tsx", "window.confirm");
requireNotIncludes("src/components/tasks/task-action-list.tsx", "window.prompt");
requireNotIncludes("src/components/tasks/task-action-list.tsx", ".from(\"tasks\").delete()");
requireNotIncludes("src/components/tasks/task-workspace-inline.tsx", ".from(\"tasks\").delete()");

if (failures.length) {
  console.error("[verify:v58.24.9.7] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[verify:v58.24.9.7] OK — Task action modal polish, safe delete and Kanban scale hardening aligned.");
