#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
const root = process.cwd();
const failures = [];
const expectedVersion = "58.22.4-data-sync-reliability-mutation-confirmation";
const expectedReleaseLabel = "v58.22.4 Data Sync Reliability + Mutation Confirmation";
function exists(rel) { return fs.existsSync(path.join(root, rel)); }
function read(rel) { return fs.readFileSync(path.join(root, rel), "utf8"); }
function requireFile(rel) { if (!exists(rel)) failures.push(`Missing required file: ${rel}`); }
function requireIncludes(rel, text) { if (!exists(rel)) { failures.push(`Missing required file: ${rel}`); return; } if (!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); }
for (const rel of ["package.json","package-lock.json","vercel.json","next.config.ts",".nvmrc",".env.example","scripts/runtime-check.mjs","scripts/validate-env.mjs","scripts/verify-v58.22.4.mjs","docs/release/V58_22_4_DATA_SYNC_RELIABILITY_MUTATION_CONFIRMATION.md","docs/qa/FLOWTASK_V58_22_4_DATA_SYNC_QA.md","docs/data-sync/FLOWTASK_DATA_SYNC_RELIABILITY.md","src/lib/supabase/mutation-confirmation.ts"]) requireFile(rel);
const pkg = JSON.parse(read("package.json"));
const scripts = pkg.scripts ?? {};
for (const scriptName of ["build","vercel:build","deploy:readiness","build:preflight","verify:current","deploy:production:ready","verify:v58.22.4"]) if (!scripts[scriptName]) failures.push(`Missing package script: ${scriptName}`);
if (pkg.version !== expectedVersion) failures.push(`Unexpected package version: ${pkg.version}`);
if (scripts["verify:current"] !== "npm run verify:v58.22.4") failures.push("verify:current must target verify:v58.22.4");
if (scripts["verify:v58.22.4"] !== "node scripts/verify-v58.22.4.mjs") failures.push("verify:v58.22.4 must target scripts/verify-v58.22.4.mjs");
const vercel = JSON.parse(read("vercel.json"));
if (vercel.framework !== "nextjs") failures.push("vercel.json framework must be nextjs");
if (vercel.buildCommand !== "npm run vercel:build") failures.push("vercel.json buildCommand must be npm run vercel:build");
requireIncludes("package-lock.json", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedReleaseLabel);
requireIncludes("src/lib/release/version.ts", "production-candidate");
for (const [rel, text] of [
  ["src/components/tasks/task-workspace-inline.tsx", "error || !data"],
  ["src/components/projects/project-hero-inline-editor.tsx", "confirmedProject"],
  ["src/components/projects/project-inline-tasks.tsx", "confirmedTask"],
  ["src/components/tasks/task-kanban-board.tsx", "confirmedTask"],
  ["src/components/tasks/task-inline-actions.tsx", "confirmedTask"],
  ["src/components/tasks/task-status-form.tsx", "confirmedTask"],
  ["src/components/tasks/task-action-list.tsx", "confirmedTasks"],
  ["src/components/attachments/entity-attachments.tsx", "No pudimos confirmar la eliminación del adjunto"],
]) requireIncludes(rel, text);
requireIncludes(".env.example", "NEXT_PUBLIC_SUPABASE_URL");
requireIncludes(".env.example", "NEXT_PUBLIC_SUPABASE_ANON_KEY");
requireIncludes(".env.example", "SUPABASE_SERVICE_ROLE_KEY");
if (failures.length) { console.error("[build-deploy-readiness] Failed checks:"); for (const failure of failures) console.error(`- ${failure}`); process.exit(1); }
console.log("[build-deploy-readiness] OK — v58.22.4 package, env and data sync reliability readiness aligned.");
