#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
const root = process.cwd();
const failures = [];
const expectedVersion = "58.22.3-workspace-board-column-visibility-production-migration-hotfix";
const expectedVerifyCurrent = "npm run verify:v58.22.3";
function readJson(rel) { return JSON.parse(fs.readFileSync(path.join(root, rel), "utf8")); }
function fileExists(rel) { return fs.existsSync(path.join(root, rel)); }
function fileIncludes(rel, text) { return fileExists(rel) && fs.readFileSync(path.join(root, rel), "utf8").includes(text); }
function pass(label) { console.log(`[deploy-production-readiness] OK - ${label}`); }
function fail(label) { failures.push(label); }
const pkg = readJson("package.json");
const scripts = pkg.scripts ?? {};
pkg.version === expectedVersion ? pass("package version aligned") : fail(`package version must be ${expectedVersion}`);
scripts["verify:current"] === expectedVerifyCurrent ? pass("verify current aligned") : fail("verify:current must target verify:v58.22.3");
scripts["verify:v58.22.3"] === "node scripts/verify-v58.22.3.mjs" ? pass("version verifier available") : fail("verify:v58.22.3 script missing or incorrect");
fileExists("scripts/verify-v58.22.3.mjs") ? pass("verify-v58.22.3 script exists") : fail("scripts/verify-v58.22.3.mjs missing");
fileIncludes("src/lib/release/version.ts", expectedVersion) ? pass("runtime version export aligned") : fail("src/lib/release/version.ts must export v58.22.3");
fileIncludes("src/lib/release/version.ts", "production-candidate") ? pass("release stage aligned") : fail("src/lib/release/version.ts must include production-candidate");
fileExists("docs/release/V58_22_3_WORKSPACE_BOARD_COLUMN_VISIBILITY_PRODUCTION_MIGRATION_HOTFIX.md") ? pass("release notes available") : fail("v58.22.3 release notes missing");
fileExists("docs/qa/FLOWTASK_V58_22_3_WORKSPACE_COLUMNS_QA.md") ? pass("QA document available") : fail("v58.22.3 QA doc missing");
fileExists("docs/design-system/FLOWTASK_WORKSPACE_BOARD_COLUMN_VISIBILITY.md") ? pass("task attachment list pattern documented") : fail("task attachment list pattern doc missing");
for (const [label, rel, text] of [
  ["production status constant available", "src/lib/constants/task-status.ts", "produccion"],
  ["production status validation available", "src/lib/validations/task.ts", "produccion"],
  ["production task status type available", "src/types/task.ts", "produccion"],
  ["production status helper available", "src/lib/tasks/status.ts", "PRODUCTION"],
  ["production DB migration available", "supabase/migrations/0044_v58_22_2_task_status_production.sql", "'produccion'"],
  ["task attachment list variant available", "src/components/attachments/entity-attachments.tsx", "variant?: \"cards\" | \"list\""],
  ["task workspace uses attachment list", "src/components/tasks/task-workspace-inline.tsx", "variant=\"list\""],
  ["inline department options available", "src/components/tasks/task-workspace-inline.tsx", "setDepartmentOptions"],
  ["inline department payload available", "src/components/tasks/task-workspace-inline.tsx", "department_id: form.departmentId"],
]) fileIncludes(rel, text) ? pass(label) : fail(`${label} missing`);
fileIncludes(".env.example", "NEXT_PUBLIC_SUPABASE_URL") ? pass("Supabase URL env documented") : fail(".env.example missing NEXT_PUBLIC_SUPABASE_URL");
fileIncludes(".env.example", "NEXT_PUBLIC_SUPABASE_ANON_KEY") ? pass("Supabase anon env documented") : fail(".env.example missing NEXT_PUBLIC_SUPABASE_ANON_KEY");
fileIncludes(".env.example", "SUPABASE_SERVICE_ROLE_KEY") ? pass("Supabase service role env documented") : fail(".env.example missing SUPABASE_SERVICE_ROLE_KEY");
if (fileExists("vercel.json")) { const vercel = readJson("vercel.json"); vercel.framework === "nextjs" ? pass("Vercel framework aligned") : fail("vercel.json framework must be nextjs"); vercel.buildCommand === "npm run vercel:build" ? pass("Vercel build command aligned") : fail("vercel.json buildCommand must be npm run vercel:build"); } else fail("vercel.json missing");

for (const [label, rel, text] of [
  ["workspace column localStorage available", "src/components/workspace/workspace-home.tsx", "WORKSPACE_VISIBLE_COLUMNS_KEY"],
  ["workspace column selector available", "src/components/workspace/workspace-home.tsx", "Columnas"],
  ["workspace column prop passed", "src/components/workspace/workspace-home.tsx", "visibleStatuses={visibleStatusColumns}"],
  ["kanban visible status prop available", "src/components/tasks/task-kanban-board.tsx", "visibleStatuses?: string[]"],
  ["production migration hotfix guarded", "supabase/migrations/0044_v58_22_2_task_status_production.sql", "to_regclass('public.task_statuses')"],
]) fileIncludes(rel, text) ? pass(label) : fail(`${label} missing`);

fileIncludes("package-lock.json", expectedVersion) ? pass("package-lock version aligned") : fail("package-lock.json must include v58.22.3 package version");
if (failures.length) { console.error("[deploy-production-readiness] Failed checks:"); for (const failure of failures) console.error(`- ${failure}`); process.exit(1); }
console.log("[deploy-production-readiness] OK — v58.22.3 production readiness aligned.");
