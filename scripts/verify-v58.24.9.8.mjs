#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const read = (rel) => fs.existsSync(path.join(root, rel)) ? fs.readFileSync(path.join(root, rel), "utf8") : "";
const exists = (rel) => fs.existsSync(path.join(root, rel));
const requireFile = (rel) => { if (!exists(rel)) failures.push(`Missing required file: ${rel}`); };
const requireIncludes = (rel, text) => { if (!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); };

const expectedVersion = "58.24.9.8-client-final-readiness-global-modal-system-trash-recovery";
const expectedRelease = "v58.24.9.8 Client Final Readiness + Global Modal System + Trash Recovery";

const pkg = JSON.parse(read("package.json"));
if (pkg.version !== expectedVersion) failures.push("package version must be v58.24.9.8");
if ((pkg.scripts ?? {})["verify:current"] !== "npm run verify:v58.24.9.8") failures.push("verify:current must target verify:v58.24.9.8");
if ((pkg.scripts ?? {})["verify:v58.24.9.8"] !== "node scripts/verify-v58.24.9.8.mjs") failures.push("verify:v58.24.9.8 script must be available");
if ((pkg.scripts ?? {})["db:doctor"] !== "node scripts/db-doctor.mjs") failures.push("db:doctor script must be available");

requireFile("scripts/verify-v58.24.9.8.mjs");
requireFile("scripts/db-doctor.mjs");
requireFile("docs/release/V58_24_9_8_CLIENT_FINAL_READINESS_GLOBAL_MODAL_SYSTEM_TRASH_RECOVERY.md");
requireFile("docs/qa/FLOWTASK_V58_24_9_8_CLIENT_FINAL_READINESS_GLOBAL_MODAL_SYSTEM_TRASH_RECOVERY_QA.md");
requireFile("supabase/migrations/0053_v58_24_9_8_task_trash_recovery_rpc.sql");
requireFile("src/components/ui/action-modal.tsx");
requireFile("src/components/tasks/task-trash-recovery.tsx");
requireFile("src/app/(app)/app/tasks/trash/page.tsx");

requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedRelease);
requireIncludes("package-lock.json", expectedVersion);
requireIncludes("README.md", "v58.24.9.8");

requireIncludes("supabase/migrations/0053_v58_24_9_8_task_trash_recovery_rpc.sql", "restore_deleted_task");
requireIncludes("supabase/migrations/0053_v58_24_9_8_task_trash_recovery_rpc.sql", "purge_deleted_task");
requireIncludes("src/components/ui/action-modal.tsx", "ActionNotice");
requireIncludes("src/components/ui/action-modal.tsx", "ConfirmDialog");
requireIncludes("src/components/ui/action-modal.tsx", "PromptModal");
requireIncludes("src/lib/queries/tasks.ts", "getDeletedTasks");
requireIncludes("src/components/tasks/task-trash-recovery.tsx", "restore_deleted_task");
requireIncludes("src/components/tasks/task-trash-recovery.tsx", "purge_deleted_task");
requireIncludes("src/app/(app)/app/tasks/page.tsx", "/app/tasks/trash");
requireIncludes("scripts/db-doctor.mjs", "tasks.deleted_at is queryable");

if (failures.length) {
  console.error("[verify:v58.24.9.8] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[verify:v58.24.9.8] OK — Client final readiness, global modal system and trash recovery aligned.");
