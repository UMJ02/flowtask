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

const expectedVersion = "58.24.9.4-task-priority-sync-fresh-detail-state-attachment-icons-loader-cleanup";
const expectedRelease = "v58.24.9.4 Task Priority Sync + Fresh Detail State + Attachment Icons + Loader Cleanup";

const pkg = JSON.parse(read("package.json"));
if (pkg.version !== expectedVersion) failures.push("package version must be v58.24.9.4");
if ((pkg.scripts ?? {})["verify:current"] !== "npm run verify:v58.24.9.4") failures.push("verify:current must target verify:v58.24.9.4");
if ((pkg.scripts ?? {})["verify:v58.24.9.4"] !== "node scripts/verify-v58.24.9.4.mjs") failures.push("verify:v58.24.9.4 script must be available");

requireFile("scripts/verify-v58.24.9.4.mjs");
requireFile("docs/release/V58_24_9_4_TASK_PRIORITY_SYNC_FRESH_DETAIL_STATE_ATTACHMENT_ICONS_LOADER_CLEANUP.md");
requireFile("docs/qa/FLOWTASK_V58_24_9_4_TASK_PRIORITY_SYNC_FRESH_DETAIL_STATE_ATTACHMENT_ICONS_LOADER_CLEANUP_QA.md");

requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedRelease);
requireIncludes("package-lock.json", expectedVersion);
requireIncludes("README.md", "v58.24.9.4");

requireIncludes("src/components/tasks/task-action-list.tsx", "toggleImportant");
requireIncludes("src/components/tasks/task-action-list.tsx", "importantFirstTasks");
requireIncludes("src/components/tasks/task-action-list.tsx", "priority: nextPriority");
requireIncludes("src/components/tasks/task-action-list.tsx", "Marcar como importante");
requireIncludes("src/components/tasks/task-kanban-board.tsx", "importantFirstTasks");
requireIncludes("src/components/tasks/task-workspace-inline.tsx", "localTask");
requireIncludes("src/components/tasks/task-workspace-inline.tsx", "setLocalTask");
requireIncludes("src/components/tasks/task-workspace-inline.tsx", "AttachmentPreviewIcon");
requireIncludes("src/components/attachments/entity-attachments.tsx", "AttachmentTypeIcon");

requireIncludes("src/app/(app)/app/loading.tsx", "animate-pulse");
requireIncludes("src/app/(public)/login/loading.tsx", "return null");
requireIncludes("src/app/(public)/loading.tsx", "return null");
requireNotIncludes("src/components/public/public-transition-link.tsx", "AuthPremiumLoader");
requireNotIncludes("src/components/public/public-transition-link.tsx", "PUBLIC_TRANSITION_MS");

if (failures.length) {
  console.error("[verify:v58.24.9.4] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[verify:v58.24.9.4] OK — Task priority sync, fresh detail state, attachment icons and loader cleanup aligned.");
