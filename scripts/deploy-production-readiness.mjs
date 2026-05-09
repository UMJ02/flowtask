#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
const root = process.cwd();
const failures = [];
const expectedVersion = "58.24.0-board-canvas-layout-alignment";
function exists(rel){ return fs.existsSync(path.join(root, rel)); }
function read(rel){ return exists(rel) ? fs.readFileSync(path.join(root, rel), "utf8") : ""; }
function pass(label){ console.log(`[deploy-production-readiness] OK - ${label}`); }
function fail(label){ failures.push(label); }
const pkg = JSON.parse(read("package.json"));
const scripts = pkg.scripts ?? {};
pkg.version === expectedVersion ? pass("package version aligned") : fail(`package version must be ${expectedVersion}`);
scripts["verify:current"] === "npm run verify:v58.24.0" ? pass("verify current aligned") : fail("verify:current must target verify:v58.24.0");
scripts["verify:v58.24.0"] === "node scripts/verify-v58.24.0.mjs" ? pass("version verifier available") : fail("verify:v58.24.0 script missing or incorrect");
exists("scripts/verify-v58.24.0.mjs") ? pass("verify-v58.24.0 script exists") : fail("scripts/verify-v58.24.0.mjs missing");
read("src/lib/release/version.ts").includes(expectedVersion) ? pass("runtime version export aligned") : fail("src/lib/release/version.ts must export v58.24");
exists("docs/release/V58_24_BOARD_CANVAS_LAYOUT_ALIGNMENT.md") ? pass("release notes available") : fail("release notes missing");
exists("docs/qa/FLOWTASK_V58_24_BOARD_LAYOUT_QA.md") ? pass("QA document available") : fail("QA doc missing");
exists("docs/boards/FLOWTASK_BOARD_LAYOUT_ALIGNMENT.md") ? pass("board layout document available") : fail("board layout doc missing");
for (const [label, rel, text] of [
  ["workspace rail available", "src/components/boards/board-workspace-rail.tsx", "BoardWorkspaceRail"],
  ["board page uses workspace rail", "src/components/boards/board-page.tsx", "<BoardWorkspaceRail"],
  ["board page uses rail grid", "src/components/boards/board-page.tsx", "lg:grid-cols-[76px_1fr]"],
  ["compact toolbox available", "src/components/boards/board-toolbox.tsx", "w-[92px]"],
  ["toolbox bounded height available", "src/components/boards/board-toolbox.tsx", "max-h-[calc(100%-120px)]"],
  ["compact tracking panel available", "src/components/boards/board-comments-activity.tsx", "Seguimiento"],
  ["tracking panel tabs available", "src/components/boards/board-comments-activity.tsx", "setTab(\"activity\")"],
  ["tracking panel scroll available", "src/components/boards/board-comments-activity.tsx", "overflow-y-auto"],
  ["board panel utility available", "src/app/globals.css", ".board-panel"],
  ["realtime cursors preserved", "src/components/boards/board-realtime-cursors.tsx", "BoardRealtimeCursors"],
  ["realtime channel preserved", "src/components/boards/board-page.tsx", "supabase.channel(`visual-board:${boardId}`"],
]) read(rel).includes(text) ? pass(label) : fail(label);
read(".env.example").includes("NEXT_PUBLIC_SUPABASE_URL") ? pass("Supabase URL env documented") : fail(".env.example missing NEXT_PUBLIC_SUPABASE_URL");
read(".env.example").includes("NEXT_PUBLIC_SUPABASE_ANON_KEY") ? pass("Supabase anon env documented") : fail(".env.example missing NEXT_PUBLIC_SUPABASE_ANON_KEY");
read(".env.example").includes("SUPABASE_SERVICE_ROLE_KEY") ? pass("Supabase service role env documented") : fail(".env.example missing SUPABASE_SERVICE_ROLE_KEY");
const vercel = JSON.parse(read("vercel.json"));
vercel.framework === "nextjs" ? pass("Vercel framework aligned") : fail("vercel.json framework must be nextjs");
vercel.buildCommand === "npm run vercel:build" ? pass("Vercel build command aligned") : fail("vercel.json buildCommand must be npm run vercel:build");
read("package-lock.json").includes(expectedVersion) ? pass("package-lock version aligned") : fail("package-lock.json must include v58.24 package version");
if (failures.length) {
  console.error("[deploy-production-readiness] Failed checks:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("[deploy-production-readiness] OK — v58.24 production readiness aligned.");
