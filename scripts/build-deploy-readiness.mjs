#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const expectedVersion = "58.24.9.8-client-final-readiness-global-modal-system-trash-recovery";
const expectedReleaseLabel = "v58.24.9.8 Client Final Readiness + Global Modal System + Trash Recovery";

function exists(rel){ return fs.existsSync(path.join(root, rel)); }
function read(rel){ return exists(rel) ? fs.readFileSync(path.join(root, rel), "utf8") : ""; }
function requireFile(rel){ if(!exists(rel)) failures.push(`Missing required file: ${rel}`); }
function requireIncludes(rel, text){ if(!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); }

for (const rel of [
  "package.json","package-lock.json","vercel.json","next.config.ts",".nvmrc",".env.example",
  "scripts/runtime-check.mjs","scripts/validate-env.mjs","scripts/verify-v58.24.9.8.mjs","scripts/db-doctor.mjs",
  "docs/release/V58_24_9_8_CLIENT_FINAL_READINESS_GLOBAL_MODAL_SYSTEM_TRASH_RECOVERY.md",
  "docs/qa/FLOWTASK_V58_24_9_8_CLIENT_FINAL_READINESS_GLOBAL_MODAL_SYSTEM_TRASH_RECOVERY_QA.md",
  "supabase/migrations/0053_v58_24_9_8_task_trash_recovery_rpc.sql",
  "src/components/ui/action-modal.tsx",
  "src/components/tasks/task-trash-recovery.tsx",
  "src/app/(app)/app/tasks/trash/page.tsx",
  "src/lib/queries/tasks.ts"
]) requireFile(rel);

const pkg = JSON.parse(read("package.json"));
const scripts = pkg.scripts ?? {};
for (const scriptName of ["build","vercel:build","deploy:readiness","build:preflight","verify:current","deploy:production:ready","verify:v58.24.9.8","db:doctor"]) {
  if (!scripts[scriptName]) failures.push(`Missing package script: ${scriptName}`);
}

if (pkg.version !== expectedVersion) failures.push(`Unexpected package version: ${pkg.version}`);
if (scripts["verify:current"] !== "npm run verify:v58.24.9.8") failures.push("verify:current must target verify:v58.24.9.8");

const vercel = JSON.parse(read("vercel.json"));
if (vercel.framework !== "nextjs") failures.push("vercel.json framework must be nextjs");
if (vercel.buildCommand !== "npm run vercel:build") failures.push("vercel.json buildCommand must be npm run vercel:build");

requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedReleaseLabel);
requireIncludes("package-lock.json", expectedVersion);
requireIncludes("supabase/migrations/0053_v58_24_9_8_task_trash_recovery_rpc.sql", "restore_deleted_task");
requireIncludes("supabase/migrations/0053_v58_24_9_8_task_trash_recovery_rpc.sql", "purge_deleted_task");
requireIncludes("src/components/ui/action-modal.tsx", "ConfirmDialog");
requireIncludes("src/components/ui/action-modal.tsx", "PromptModal");
requireIncludes("src/lib/queries/tasks.ts", "getDeletedTasks");
requireIncludes("src/components/tasks/task-trash-recovery.tsx", "TaskTrashRecovery");
requireIncludes("src/app/(app)/app/tasks/page.tsx", "/app/tasks/trash");
requireIncludes("scripts/db-doctor.mjs", "tasks.deleted_at is queryable");

if (failures.length) {
  console.error("[build-deploy-readiness] Failed checks:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[build-deploy-readiness] OK — v58.24.9.8 client final readiness and trash recovery aligned.");
