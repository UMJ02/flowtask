#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const expectedVersion = "58.24.9.8-client-final-readiness-global-modal-system-trash-recovery";

function exists(rel){ return fs.existsSync(path.join(root, rel)); }
function read(rel){ return exists(rel) ? fs.readFileSync(path.join(root, rel), "utf8") : ""; }
function pass(label){ console.log(`[deploy-production-readiness] OK - ${label}`); }
function fail(label){ failures.push(label); }

const pkg = JSON.parse(read("package.json"));
const scripts = pkg.scripts ?? {};

pkg.version === expectedVersion ? pass("package version aligned") : fail(`package version must be ${expectedVersion}`);
scripts["verify:current"] === "npm run verify:v58.24.9.8" ? pass("verify current aligned") : fail("verify:current must target verify:v58.24.9.8");
scripts["verify:v58.24.9.8"] === "node scripts/verify-v58.24.9.8.mjs" ? pass("version verifier available") : fail("verify:v58.24.9.8 script missing or incorrect");
scripts["db:doctor"] === "node scripts/db-doctor.mjs" ? pass("db doctor available") : fail("db:doctor script missing");

for (const [label, rel] of [
  ["verify script exists", "scripts/verify-v58.24.9.8.mjs"],
  ["release notes available", "docs/release/V58_24_9_8_CLIENT_FINAL_READINESS_GLOBAL_MODAL_SYSTEM_TRASH_RECOVERY.md"],
  ["QA document available", "docs/qa/FLOWTASK_V58_24_9_8_CLIENT_FINAL_READINESS_GLOBAL_MODAL_SYSTEM_TRASH_RECOVERY_QA.md"],
  ["trash migration available", "supabase/migrations/0053_v58_24_9_8_task_trash_recovery_rpc.sql"],
  ["modal system available", "src/components/ui/action-modal.tsx"],
  ["trash recovery component available", "src/components/tasks/task-trash-recovery.tsx"],
  ["trash route available", "src/app/(app)/app/tasks/trash/page.tsx"]
]) exists(rel) ? pass(label) : fail(`${label}: missing ${rel}`);

read("src/lib/release/version.ts").includes(expectedVersion) ? pass("runtime version export aligned") : fail("src/lib/release/version.ts must export v58.24.9.8");
read("supabase/migrations/0053_v58_24_9_8_task_trash_recovery_rpc.sql").includes("restore_deleted_task") ? pass("restore deleted task RPC available") : fail("restore_deleted_task missing");
read("supabase/migrations/0053_v58_24_9_8_task_trash_recovery_rpc.sql").includes("purge_deleted_task") ? pass("purge deleted task RPC available") : fail("purge_deleted_task missing");
read("src/components/ui/action-modal.tsx").includes("ConfirmDialog") ? pass("ConfirmDialog available") : fail("ConfirmDialog missing");
read("src/components/ui/action-modal.tsx").includes("PromptModal") ? pass("PromptModal available") : fail("PromptModal missing");
read("src/lib/queries/tasks.ts").includes("getDeletedTasks") ? pass("deleted task query available") : fail("getDeletedTasks missing");
read("src/components/tasks/task-trash-recovery.tsx").includes("TaskTrashRecovery") ? pass("trash recovery UI available") : fail("trash recovery UI missing");
read("src/app/(app)/app/tasks/page.tsx").includes("/app/tasks/trash") ? pass("tasks page links to trash") : fail("tasks page trash link missing");
read("package-lock.json").includes(expectedVersion) ? pass("package-lock version aligned") : fail("package-lock.json must include v58.24.9.8 package version");

const vercel = JSON.parse(read("vercel.json"));
vercel.framework === "nextjs" ? pass("Vercel framework aligned") : fail("vercel.json framework must be nextjs");
vercel.buildCommand === "npm run vercel:build" ? pass("Vercel build command aligned") : fail("vercel.json buildCommand must be npm run vercel:build");

if (failures.length) {
  console.error("[deploy-production-readiness] Failed checks:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[deploy-production-readiness] OK — v58.24.9.8 production readiness aligned.");
