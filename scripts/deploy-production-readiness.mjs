#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
const root = process.cwd();
const failures = [];
const expectedVersion = "58.23.3-board-templates-comments-activity";
function exists(rel){ return fs.existsSync(path.join(root, rel)); }
function read(rel){ return exists(rel) ? fs.readFileSync(path.join(root, rel), "utf8") : ""; }
function pass(label){ console.log(`[deploy-production-readiness] OK - ${label}`); }
function fail(label){ failures.push(label); }
const pkg = JSON.parse(read("package.json"));
const scripts = pkg.scripts ?? {};
pkg.version === expectedVersion ? pass("package version aligned") : fail(`package version must be ${expectedVersion}`);
scripts["verify:current"] === "npm run verify:v58.23.3" ? pass("verify current aligned") : fail("verify:current must target verify:v58.23.3");
scripts["verify:v58.23.3"] === "node scripts/verify-v58.23.3.mjs" ? pass("version verifier available") : fail("verify:v58.23.3 script missing or incorrect");
exists("scripts/verify-v58.23.3.mjs") ? pass("verify-v58.23.3 script exists") : fail("scripts/verify-v58.23.3.mjs missing");
read("src/lib/release/version.ts").includes(expectedVersion) ? pass("runtime version export aligned") : fail("src/lib/release/version.ts must export v58.23.3");
exists("docs/release/V58_23_3_BOARD_TEMPLATES_COMMENTS_ACTIVITY.md") ? pass("release notes available") : fail("release notes missing");
exists("docs/qa/FLOWTASK_V58_23_3_BOARD_TEMPLATES_COMMENTS_ACTIVITY_QA.md") ? pass("QA document available") : fail("QA doc missing");
for (const [label, rel, text] of [
  ["table inline cell editing available", "src/components/boards/board-element.tsx", "onUpdateTableCell"],
  ["table add row available", "src/components/boards/board-page.tsx", "addTableRow"],
  ["table add column available", "src/components/boards/board-page.tsx", "addTableColumn"],
  ["table remove row available", "src/components/boards/board-page.tsx", "removeTableRow"],
  ["table remove column available", "src/components/boards/board-page.tsx", "removeTableColumn"],
  ["table rename column available", "src/components/boards/board-page.tsx", "updateTableColumnLabel"],
  ["properties panel table controls available", "src/components/boards/properties-panel.tsx", "Tabla visual"],
  ["toolbar table controls available", "src/components/boards/floating-format-toolbar.tsx", "onAddTableColumn"],
  ["table serialization available", "src/lib/boards/board-serialization.ts", "columns: element.columns"],
  ["board templates available", "src/lib/boards/board-templates.ts", "BOARD_TEMPLATES"],
  ["template element factory available", "src/lib/boards/board-templates.ts", "createTemplateElements"],
  ["comments activity panel available", "src/components/boards/board-comments-activity.tsx", "BoardCommentsActivity"],
  ["board comments table migration available", "supabase/migrations/0046_v58_23_3_board_templates_comments_activity.sql", "visual_board_comments"],
  ["board activity logging available", "src/components/boards/board-page.tsx", "logBoardActivity"],
  ["visual boards foundation migration available", "supabase/migrations/0045_v58_23_0_visual_boards_foundation.sql", "create table if not exists public.visual_boards"],
]) read(rel).includes(text) ? pass(label) : fail(label);
read(".env.example").includes("NEXT_PUBLIC_SUPABASE_URL") ? pass("Supabase URL env documented") : fail(".env.example missing NEXT_PUBLIC_SUPABASE_URL");
read(".env.example").includes("NEXT_PUBLIC_SUPABASE_ANON_KEY") ? pass("Supabase anon env documented") : fail(".env.example missing NEXT_PUBLIC_SUPABASE_ANON_KEY");
read(".env.example").includes("SUPABASE_SERVICE_ROLE_KEY") ? pass("Supabase service role env documented") : fail(".env.example missing SUPABASE_SERVICE_ROLE_KEY");
const vercel = JSON.parse(read("vercel.json"));
vercel.framework === "nextjs" ? pass("Vercel framework aligned") : fail("vercel.json framework must be nextjs");
vercel.buildCommand === "npm run vercel:build" ? pass("Vercel build command aligned") : fail("vercel.json buildCommand must be npm run vercel:build");
read("package-lock.json").includes(expectedVersion) ? pass("package-lock version aligned") : fail("package-lock.json must include v58.23.3 package version");
if (failures.length) {
  console.error("[deploy-production-readiness] Failed checks:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("[deploy-production-readiness] OK — v58.23.3 production readiness aligned.");
