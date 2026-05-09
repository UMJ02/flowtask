#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
const root = process.cwd();
const failures = [];
const expectedVersion = "58.22.2-task-status-production-attachment-list-inline-department-edit";
const expectedReleaseLabel = "v58.22.2 Task Status Production + Attachment List + Inline Department Edit";
function exists(rel) { return fs.existsSync(path.join(root, rel)); }
function read(rel) { return fs.readFileSync(path.join(root, rel), "utf8"); }
function requireFile(rel) { if (!exists(rel)) failures.push(`Missing required file: ${rel}`); }
function requireIncludes(rel, text) { if (!exists(rel)) { failures.push(`Missing required file: ${rel}`); return; } if (!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); }
for (const rel of ["package.json","package-lock.json","vercel.json","next.config.ts",".nvmrc",".env.example","scripts/runtime-check.mjs","scripts/validate-env.mjs","scripts/verify-v58.22.2.mjs","docs/release/V58_22_2_TASK_STATUS_PRODUCTION_ATTACHMENT_LIST_INLINE_DEPARTMENT_EDIT.md","docs/qa/FLOWTASK_V58_22_2_TASK_STATUS_ATTACHMENTS_DEPARTMENT_QA.md","docs/design-system/FLOWTASK_TASK_ATTACHMENT_LIST_PATTERN.md","supabase/migrations/0044_v58_22_2_task_status_production.sql"]) requireFile(rel);
const pkg = JSON.parse(read("package.json"));
const scripts = pkg.scripts ?? {};
for (const scriptName of ["build","vercel:build","deploy:readiness","build:preflight","verify:current","deploy:production:ready","verify:v58.22.2"]) if (!scripts[scriptName]) failures.push(`Missing package script: ${scriptName}`);
if (pkg.version !== expectedVersion) failures.push(`Unexpected package version: ${pkg.version}`);
if (scripts["verify:current"] !== "npm run verify:v58.22.2") failures.push("verify:current must target verify:v58.22.2");
if (scripts["verify:v58.22.2"] !== "node scripts/verify-v58.22.2.mjs") failures.push("verify:v58.22.2 must target scripts/verify-v58.22.2.mjs");
const vercel = JSON.parse(read("vercel.json"));
if (vercel.framework !== "nextjs") failures.push("vercel.json framework must be nextjs");
if (vercel.buildCommand !== "npm run vercel:build") failures.push("vercel.json buildCommand must be npm run vercel:build");
requireIncludes("package-lock.json", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedReleaseLabel);
requireIncludes("src/lib/release/version.ts", "production-candidate");
for (const [rel, text] of [
  ["src/lib/constants/task-status.ts", "produccion"],
  ["src/lib/validations/task.ts", "produccion"],
  ["src/types/task.ts", "produccion"],
  ["src/components/attachments/entity-attachments.tsx", "variant?: \"cards\" | \"list\""],
  ["src/components/tasks/task-workspace-inline.tsx", "variant=\"list\""],
  ["src/components/tasks/task-workspace-inline.tsx", "department_id: form.departmentId"],
  ["supabase/migrations/0044_v58_22_2_task_status_production.sql", "'produccion'"],
]) requireIncludes(rel, text);
requireIncludes(".env.example", "NEXT_PUBLIC_SUPABASE_URL");
requireIncludes(".env.example", "NEXT_PUBLIC_SUPABASE_ANON_KEY");
requireIncludes(".env.example", "SUPABASE_SERVICE_ROLE_KEY");
if (failures.length) { console.error("[build-deploy-readiness] Failed checks:"); for (const failure of failures) console.error(`- ${failure}`); process.exit(1); }
console.log("[build-deploy-readiness] OK — v58.22.2 package, env, production status, attachments and inline department readiness aligned.");
