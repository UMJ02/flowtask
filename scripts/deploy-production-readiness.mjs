#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
const root = process.cwd();
const failures = [];
const expectedVersion = "58.23.0-boards-foundation-visual-canvas-mvp";
const expectedVerifyCurrent = "npm run verify:v58.23.0";
function readJson(rel) { return JSON.parse(fs.readFileSync(path.join(root, rel), "utf8")); }
function fileExists(rel) { return fs.existsSync(path.join(root, rel)); }
function fileIncludes(rel, text) { return fileExists(rel) && fs.readFileSync(path.join(root, rel), "utf8").includes(text); }
function pass(label) { console.log(`[deploy-production-readiness] OK - ${label}`); }
function fail(label) { failures.push(label); }
const pkg = readJson("package.json");
const scripts = pkg.scripts ?? {};
pkg.version === expectedVersion ? pass("package version aligned") : fail(`package version must be ${expectedVersion}`);
scripts["verify:current"] === expectedVerifyCurrent ? pass("verify current aligned") : fail("verify:current must target verify:v58.23.0");
scripts["verify:v58.23.0"] === "node scripts/verify-v58.23.0.mjs" ? pass("version verifier available") : fail("verify:v58.23.0 script missing or incorrect");
fileExists("scripts/verify-v58.23.0.mjs") ? pass("verify-v58.23.0 script exists") : fail("scripts/verify-v58.23.0.mjs missing");
fileIncludes("src/lib/release/version.ts", expectedVersion) ? pass("runtime version export aligned") : fail("src/lib/release/version.ts must export v58.23.0");
fileIncludes("src/lib/release/version.ts", "production-candidate") ? pass("release stage aligned") : fail("src/lib/release/version.ts must include production-candidate");
fileExists("docs/release/V58_23_0_BOARDS_FOUNDATION_VISUAL_CANVAS_MVP.md") ? pass("release notes available") : fail("release notes missing");
fileExists("docs/qa/FLOWTASK_V58_23_0_BOARDS_QA.md") ? pass("QA document available") : fail("QA doc missing");
fileExists("docs/boards/FLOWTASK_BOARDS_FOUNDATION.md") ? pass("boards foundation document available") : fail("boards foundation doc missing");
for (const [label, rel, text] of [
  ["boards route available", "src/app/(app)/app/boards/page.tsx", "BoardsHome"],
  ["board detail route available", "src/app/(app)/app/boards/[boardId]/page.tsx", "BoardPage"],
  ["visual boards table migration available", "supabase/migrations/0045_v58_23_0_visual_boards_foundation.sql", "create table if not exists public.visual_boards"],
  ["visual board elements migration available", "supabase/migrations/0045_v58_23_0_visual_boards_foundation.sql", "create table if not exists public.visual_board_elements"],
  ["boards RLS available", "supabase/migrations/0045_v58_23_0_visual_boards_foundation.sql", "enable row level security"],
  ["boards nav available", "src/components/layout/nav-links.ts", "Pizarras"],
  ["board tools available", "src/lib/boards/board-tools.ts", "BOARD_TOOLS"],
  ["board defaults available", "src/lib/boards/board-defaults.ts", "createDefaultBoardElement"],
  ["board autosave available", "src/components/boards/board-page.tsx", "setSavingState(\"saving\")"],
  ["board upsert persistence available", "src/components/boards/board-page.tsx", "upsert(payload"],
  ["board soft delete available", "src/components/boards/board-page.tsx", "deleted_at"],
  ["board canvas style available", "src/app/globals.css", ".board-canvas"],
]) fileIncludes(rel, text) ? pass(label) : fail(`${label} missing`);
fileIncludes(".env.example", "NEXT_PUBLIC_SUPABASE_URL") ? pass("Supabase URL env documented") : fail(".env.example missing NEXT_PUBLIC_SUPABASE_URL");
fileIncludes(".env.example", "NEXT_PUBLIC_SUPABASE_ANON_KEY") ? pass("Supabase anon env documented") : fail(".env.example missing NEXT_PUBLIC_SUPABASE_ANON_KEY");
fileIncludes(".env.example", "SUPABASE_SERVICE_ROLE_KEY") ? pass("Supabase service role env documented") : fail(".env.example missing SUPABASE_SERVICE_ROLE_KEY");
if (fileExists("vercel.json")) { const vercel = readJson("vercel.json"); vercel.framework === "nextjs" ? pass("Vercel framework aligned") : fail("vercel.json framework must be nextjs"); vercel.buildCommand === "npm run vercel:build" ? pass("Vercel build command aligned") : fail("vercel.json buildCommand must be npm run vercel:build"); } else fail("vercel.json missing");
fileIncludes("package-lock.json", expectedVersion) ? pass("package-lock version aligned") : fail("package-lock.json must include v58.23.0 package version");
if (failures.length) { console.error("[deploy-production-readiness] Failed checks:"); for (const failure of failures) console.error(`- ${failure}`); process.exit(1); }
console.log("[deploy-production-readiness] OK — v58.23.0 production readiness aligned.");
