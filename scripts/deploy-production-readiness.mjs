#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
const root = process.cwd();
const failures = [];
const expectedVersion = "58.22.4-data-sync-reliability-mutation-confirmation";
const expectedVerifyCurrent = "npm run verify:v58.22.4";
function readJson(rel) { return JSON.parse(fs.readFileSync(path.join(root, rel), "utf8")); }
function fileExists(rel) { return fs.existsSync(path.join(root, rel)); }
function fileIncludes(rel, text) { return fileExists(rel) && fs.readFileSync(path.join(root, rel), "utf8").includes(text); }
function pass(label) { console.log(`[deploy-production-readiness] OK - ${label}`); }
function fail(label) { failures.push(label); }
const pkg = readJson("package.json");
const scripts = pkg.scripts ?? {};
pkg.version === expectedVersion ? pass("package version aligned") : fail(`package version must be ${expectedVersion}`);
scripts["verify:current"] === expectedVerifyCurrent ? pass("verify current aligned") : fail("verify:current must target verify:v58.22.4");
scripts["verify:v58.22.4"] === "node scripts/verify-v58.22.4.mjs" ? pass("version verifier available") : fail("verify:v58.22.4 script missing or incorrect");
fileExists("scripts/verify-v58.22.4.mjs") ? pass("verify-v58.22.4 script exists") : fail("scripts/verify-v58.22.4.mjs missing");
fileIncludes("src/lib/release/version.ts", expectedVersion) ? pass("runtime version export aligned") : fail("src/lib/release/version.ts must export v58.22.4");
fileIncludes("src/lib/release/version.ts", "production-candidate") ? pass("release stage aligned") : fail("src/lib/release/version.ts must include production-candidate");
fileExists("docs/release/V58_22_4_DATA_SYNC_RELIABILITY_MUTATION_CONFIRMATION.md") ? pass("release notes available") : fail("release notes missing");
fileExists("docs/qa/FLOWTASK_V58_22_4_DATA_SYNC_QA.md") ? pass("QA document available") : fail("QA doc missing");
fileExists("docs/data-sync/FLOWTASK_DATA_SYNC_RELIABILITY.md") ? pass("data sync document available") : fail("data sync document missing");
for (const [label, rel, text] of [
  ["task inline update confirmed", "src/components/tasks/task-workspace-inline.tsx", "error || !data"],
  ["project inline update confirmed", "src/components/projects/project-hero-inline-editor.tsx", "confirmedProject"],
  ["project inline tasks confirmed", "src/components/projects/project-inline-tasks.tsx", "confirmedTask"],
  ["kanban move confirmed", "src/components/tasks/task-kanban-board.tsx", "confirmedTask"],
  ["quick status confirmed", "src/components/tasks/task-inline-actions.tsx", "confirmedTask"],
  ["status form confirmed", "src/components/tasks/task-status-form.tsx", "confirmedTask"],
  ["bulk actions confirmed", "src/components/tasks/task-action-list.tsx", "confirmedTasks"],
  ["attachment delete confirmed", "src/components/attachments/entity-attachments.tsx", "No pudimos confirmar la eliminación del adjunto"],
  ["mutation helper available", "src/lib/supabase/mutation-confirmation.ts", "requireConfirmedRow"],
]) fileIncludes(rel, text) ? pass(label) : fail(`${label} missing`);
fileIncludes(".env.example", "NEXT_PUBLIC_SUPABASE_URL") ? pass("Supabase URL env documented") : fail(".env.example missing NEXT_PUBLIC_SUPABASE_URL");
fileIncludes(".env.example", "NEXT_PUBLIC_SUPABASE_ANON_KEY") ? pass("Supabase anon env documented") : fail(".env.example missing NEXT_PUBLIC_SUPABASE_ANON_KEY");
fileIncludes(".env.example", "SUPABASE_SERVICE_ROLE_KEY") ? pass("Supabase service role env documented") : fail(".env.example missing SUPABASE_SERVICE_ROLE_KEY");
if (fileExists("vercel.json")) { const vercel = readJson("vercel.json"); vercel.framework === "nextjs" ? pass("Vercel framework aligned") : fail("vercel.json framework must be nextjs"); vercel.buildCommand === "npm run vercel:build" ? pass("Vercel build command aligned") : fail("vercel.json buildCommand must be npm run vercel:build"); } else fail("vercel.json missing");
fileIncludes("package-lock.json", expectedVersion) ? pass("package-lock version aligned") : fail("package-lock.json must include v58.22.4 package version");
if (failures.length) { console.error("[deploy-production-readiness] Failed checks:"); for (const failure of failures) console.error(`- ${failure}`); process.exit(1); }
console.log("[deploy-production-readiness] OK — v58.22.4 production readiness aligned.");
