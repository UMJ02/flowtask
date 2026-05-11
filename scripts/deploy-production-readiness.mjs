#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const expectedVersion = "58.24.9.7-task-action-modal-polish-safe-delete-kanban-scale-hardening";

function exists(rel){ return fs.existsSync(path.join(root, rel)); }
function read(rel){ return exists(rel) ? fs.readFileSync(path.join(root, rel), "utf8") : ""; }
function pass(label){ console.log(`[deploy-production-readiness] OK - ${label}`); }
function fail(label){ failures.push(label); }

const pkg = JSON.parse(read("package.json"));
const scripts = pkg.scripts ?? {};

pkg.version === expectedVersion ? pass("package version aligned") : fail(`package version must be ${expectedVersion}`);
scripts["verify:current"] === "npm run verify:v58.24.9.7" ? pass("verify current aligned") : fail("verify:current must target verify:v58.24.9.7");
scripts["verify:v58.24.9.7"] === "node scripts/verify-v58.24.9.7.mjs" ? pass("version verifier available") : fail("verify:v58.24.9.7 script missing or incorrect");

for (const [label, rel] of [
  ["verify script exists", "scripts/verify-v58.24.9.7.mjs"],
  ["release notes available", "docs/release/V58_24_9_7_TASK_ACTION_MODAL_POLISH_SAFE_DELETE_KANBAN_SCALE_HARDENING.md"],
  ["QA document available", "docs/qa/FLOWTASK_V58_24_9_7_TASK_ACTION_MODAL_POLISH_SAFE_DELETE_KANBAN_SCALE_HARDENING_QA.md"],
  ["safe delete migration available", "supabase/migrations/0052_v58_24_9_7_task_safe_delete_indexes.sql"],
  ["safe delete helper available", "src/lib/tasks/safe-delete-client.ts"],
  ["task query available", "src/lib/queries/tasks.ts"]
]) exists(rel) ? pass(label) : fail(`${label}: missing ${rel}`);

read("src/lib/release/version.ts").includes(expectedVersion) ? pass("runtime version export aligned") : fail("src/lib/release/version.ts must export v58.24.9.7");
read("supabase/migrations/0052_v58_24_9_7_task_safe_delete_indexes.sql").includes("safe_delete_task") ? pass("safe delete RPC available") : fail("safe_delete_task missing");
read("src/lib/tasks/safe-delete-client.ts").includes("safeDeleteTaskClient") ? pass("safe delete client helper available") : fail("safe delete client helper missing");
read("src/lib/queries/tasks.ts").includes("query = query.is(\"deleted_at\", null)") ? pass("deleted tasks hidden from query") : fail("deleted_at task filter missing");
read("src/components/tasks/task-action-list.tsx").includes("newViewModalOpen") ? pass("new view modal available") : fail("new view modal missing");
!read("src/components/tasks/task-action-list.tsx").includes("window.prompt") ? pass("prompt removed from task list") : fail("window.prompt should be removed");
!read("src/components/tasks/task-action-list.tsx").includes("window.alert") ? pass("browser alerts removed from task list") : fail("window.alert should be removed");
!read("src/components/tasks/task-action-list.tsx").includes("window.confirm") ? pass("browser confirms removed from task list") : fail("window.confirm should be removed");
read("package-lock.json").includes(expectedVersion) ? pass("package-lock version aligned") : fail("package-lock.json must include v58.24.9.7 package version");

const vercel = JSON.parse(read("vercel.json"));
vercel.framework === "nextjs" ? pass("Vercel framework aligned") : fail("vercel.json framework must be nextjs");
vercel.buildCommand === "npm run vercel:build" ? pass("Vercel build command aligned") : fail("vercel.json buildCommand must be npm run vercel:build");

if (failures.length) {
  console.error("[deploy-production-readiness] Failed checks:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[deploy-production-readiness] OK — v58.24.9.7 production readiness aligned.");
