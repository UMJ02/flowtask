#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
const root = process.cwd();
const failures = [];
const expectedVersion = "58.23.7-board-realtime-collaboration";
const expectedReleaseLabel = "v58.23.7 Board Realtime Collaboration";
function exists(rel){ return fs.existsSync(path.join(root, rel)); }
function read(rel){ return exists(rel) ? fs.readFileSync(path.join(root, rel), "utf8") : ""; }
function requireFile(rel){ if(!exists(rel)) failures.push(`Missing required file: ${rel}`); }
function requireIncludes(rel, text){ if(!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); }
for (const rel of [
  "package.json","package-lock.json","vercel.json","next.config.ts",".nvmrc",".env.example",
  "scripts/runtime-check.mjs","scripts/validate-env.mjs","scripts/verify-v58.23.7.mjs",
  "docs/release/V58_23_7_BOARD_REALTIME_COLLABORATION.md",
  "docs/qa/FLOWTASK_V58_23_7_BOARD_REALTIME_QA.md",
  "docs/boards/FLOWTASK_BOARD_REALTIME_COLLABORATION.md",
  "supabase/migrations/0045_v58_23_0_visual_boards_foundation.sql",
  "supabase/migrations/0048_v58_23_6_board_anchored_comments_files.sql",
  "supabase/migrations/0049_v58_23_7_board_realtime_collaboration.sql",
  "src/components/boards/board-realtime-cursors.tsx"
]) requireFile(rel);
const pkg = JSON.parse(read("package.json"));
const scripts = pkg.scripts ?? {};
for (const scriptName of ["build","vercel:build","deploy:readiness","build:preflight","verify:current","deploy:production:ready","verify:v58.23.7"]) if (!scripts[scriptName]) failures.push(`Missing package script: ${scriptName}`);
if (pkg.version !== expectedVersion) failures.push(`Unexpected package version: ${pkg.version}`);
if (scripts["verify:current"] !== "npm run verify:v58.23.7") failures.push("verify:current must target verify:v58.23.7");
if (scripts["verify:v58.23.7"] !== "node scripts/verify-v58.23.7.mjs") failures.push("verify:v58.23.7 must target scripts/verify-v58.23.7.mjs");
const vercel = JSON.parse(read("vercel.json"));
if (vercel.framework !== "nextjs") failures.push("vercel.json framework must be nextjs");
if (vercel.buildCommand !== "npm run vercel:build") failures.push("vercel.json buildCommand must be npm run vercel:build");
requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedReleaseLabel);
requireIncludes("src/components/boards/board-page.tsx", "supabase.channel(`visual-board:${boardId}`");
requireIncludes("src/components/boards/board-page.tsx", "postgres_changes");
requireIncludes("src/components/boards/board-page.tsx", "publishRealtimeCursor");
requireIncludes("src/components/boards/board-page.tsx", "BoardRealtimeCursors");
requireIncludes("src/lib/boards/board-types.ts", "VisualBoardPresence");
requireIncludes("supabase/migrations/0049_v58_23_7_board_realtime_collaboration.sql", "supabase_realtime");
requireIncludes("package-lock.json", expectedVersion);
if (failures.length) {
  console.error("[build-deploy-readiness] Failed checks:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("[build-deploy-readiness] OK — v58.23.7 package, env and board realtime collaboration readiness aligned.");
