#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
const root = process.cwd();
const failures = [];
const expectedVersion = "58.23.5-board-history-shortcuts-minimap";
function exists(rel){ return fs.existsSync(path.join(root, rel)); }
function read(rel){ return exists(rel) ? fs.readFileSync(path.join(root, rel), "utf8") : ""; }
function pass(label){ console.log(`[deploy-production-readiness] OK - ${label}`); }
function fail(label){ failures.push(label); }
const pkg = JSON.parse(read("package.json"));
const scripts = pkg.scripts ?? {};
pkg.version === expectedVersion ? pass("package version aligned") : fail(`package version must be ${expectedVersion}`);
scripts["verify:current"] === "npm run verify:v58.23.5" ? pass("verify current aligned") : fail("verify:current must target verify:v58.23.5");
scripts["verify:v58.23.5"] === "node scripts/verify-v58.23.5.mjs" ? pass("version verifier available") : fail("verify:v58.23.5 script missing or incorrect");
exists("scripts/verify-v58.23.5.mjs") ? pass("verify-v58.23.5 script exists") : fail("scripts/verify-v58.23.5.mjs missing");
read("src/lib/release/version.ts").includes(expectedVersion) ? pass("runtime version export aligned") : fail("src/lib/release/version.ts must export v58.23.5");
exists("docs/release/V58_23_5_BOARD_HISTORY_SHORTCUTS_MINIMAP.md") ? pass("release notes available") : fail("release notes missing");
exists("docs/qa/FLOWTASK_V58_23_5_BOARD_HISTORY_SHORTCUTS_MINIMAP_QA.md") ? pass("QA document available") : fail("QA doc missing");
exists("docs/boards/FLOWTASK_BOARD_HISTORY_SHORTCUTS_MINIMAP.md") ? pass("board history/minimap document available") : fail("board history/minimap doc missing");
for (const [label, rel, text] of [
  ["board minimap available", "src/components/boards/board-minimap.tsx", "BoardMiniMap"],
  ["board minimap bounds available", "src/components/boards/board-minimap.tsx", "getBounds"],
  ["board page renders minimap", "src/components/boards/board-page.tsx", "<BoardMiniMap"],
  ["undo history available", "src/components/boards/board-page.tsx", "undoBoardChange"],
  ["redo history available", "src/components/boards/board-page.tsx", "redoBoardChange"],
  ["history snapshots available", "src/components/boards/board-page.tsx", "pushHistorySnapshot"],
  ["cmd z shortcut available", "src/components/boards/board-page.tsx", "event.key.toLowerCase() === \"z\""],
  ["cmd d shortcut available", "src/components/boards/board-page.tsx", "event.key.toLowerCase() === \"d\""],
  ["tool shortcuts available", "src/components/boards/board-page.tsx", "setActiveTool(\"connector\")"],
  ["pan tool available", "src/components/boards/board-page.tsx", "setActiveTool(\"hand\")"],
  ["wheel zoom available", "src/components/boards/board-page.tsx", "handleCanvasWheel"],
  ["sharing preserved", "src/components/boards/board-sharing-panel.tsx", "BoardSharingPanel"],
  ["public share route preserved", "src/app/(public)/share/boards/[token]/page.tsx", "BoardShareView"],
]) read(rel).includes(text) ? pass(label) : fail(label);
read(".env.example").includes("NEXT_PUBLIC_SUPABASE_URL") ? pass("Supabase URL env documented") : fail(".env.example missing NEXT_PUBLIC_SUPABASE_URL");
read(".env.example").includes("NEXT_PUBLIC_SUPABASE_ANON_KEY") ? pass("Supabase anon env documented") : fail(".env.example missing NEXT_PUBLIC_SUPABASE_ANON_KEY");
read(".env.example").includes("SUPABASE_SERVICE_ROLE_KEY") ? pass("Supabase service role env documented") : fail(".env.example missing SUPABASE_SERVICE_ROLE_KEY");
const vercel = JSON.parse(read("vercel.json"));
vercel.framework === "nextjs" ? pass("Vercel framework aligned") : fail("vercel.json framework must be nextjs");
vercel.buildCommand === "npm run vercel:build" ? pass("Vercel build command aligned") : fail("vercel.json buildCommand must be npm run vercel:build");
read("package-lock.json").includes(expectedVersion) ? pass("package-lock version aligned") : fail("package-lock.json must include v58.23.5 package version");
if (failures.length) {
  console.error("[deploy-production-readiness] Failed checks:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("[deploy-production-readiness] OK — v58.23.5 production readiness aligned.");
