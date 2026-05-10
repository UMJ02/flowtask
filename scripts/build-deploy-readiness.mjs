#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
const root = process.cwd();
const failures = [];
const expectedVersion = "58.24.7-boards-home-action-alignment-handoff-cleanup";
const expectedReleaseLabel = "v58.24.7 Boards Home Action Alignment + Handoff Cleanup";
function exists(rel){ return fs.existsSync(path.join(root, rel)); }
function read(rel){ return exists(rel) ? fs.readFileSync(path.join(root, rel), "utf8") : ""; }
function requireFile(rel){ if(!exists(rel)) failures.push(`Missing required file: ${rel}`); }
function requireIncludes(rel, text){ if(!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); }
function requireNotIncludes(rel, text){ if(read(rel).includes(text)) failures.push(`Unexpected '${text}' in ${rel}`); }
for (const rel of [
  "package.json","package-lock.json","vercel.json","next.config.ts",".nvmrc",".env.example",
  "scripts/runtime-check.mjs","scripts/validate-env.mjs","scripts/verify-v58.24.7.mjs",
  "docs/release/V58_24_7_BOARDS_HOME_ACTION_ALIGNMENT_HANDOFF_CLEANUP.md",
  "docs/qa/FLOWTASK_V58_24_7_BOARDS_HOME_ACTION_ALIGNMENT_QA.md",
  "docs/boards/FLOWTASK_BOARDS_HOME_UI_REDESIGN.md",
  "supabase/migrations/0045_v58_23_0_visual_boards_foundation.sql",
  "supabase/migrations/0049_v58_23_7_board_realtime_collaboration.sql",
  "src/components/boards/boards-home.tsx",
  "src/components/boards/board-toolbox.tsx",
  "src/components/boards/board-realtime-cursors.tsx",
  "src/components/boards/properties-panel.tsx"
]) requireFile(rel);
const pkg = JSON.parse(read("package.json"));
const scripts = pkg.scripts ?? {};
for (const scriptName of ["build","vercel:build","deploy:readiness","build:preflight","verify:current","deploy:production:ready","verify:v58.24.7"]) if (!scripts[scriptName]) failures.push(`Missing package script: ${scriptName}`);
if (pkg.version !== expectedVersion) failures.push(`Unexpected package version: ${pkg.version}`);
if (scripts["verify:current"] !== "npm run verify:v58.24.7") failures.push("verify:current must target verify:v58.24.7");
if (scripts["verify:v58.24.7"] !== "node scripts/verify-v58.24.7.mjs") failures.push("verify:v58.24.7 must target scripts/verify-v58.24.7.mjs");
const vercel = JSON.parse(read("vercel.json"));
if (vercel.framework !== "nextjs") failures.push("vercel.json framework must be nextjs");
if (vercel.buildCommand !== "npm run vercel:build") failures.push("vercel.json buildCommand must be npm run vercel:build");
requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedReleaseLabel);
requireIncludes("src/components/boards/boards-home.tsx", "board-home-hero");
requireIncludes("src/components/boards/boards-home.tsx", "board-home-template-grid");
requireIncludes("src/components/boards/boards-home.tsx", "board-home-recent-grid");
requireIncludes("src/components/boards/boards-home.tsx", "deleteBoard");
requireIncludes("src/components/boards/boards-home.tsx", "deleted_at");
requireIncludes("src/app/globals.css", ".board-home-hero");
requireIncludes("src/app/globals.css", ".board-home-delete-dialog");
requireIncludes("src/components/boards/board-toolbox.tsx", "board-tool-palette");
requireIncludes("src/components/boards/board-page.tsx", "clearBoardElements");
requireIncludes("src/components/boards/board-page.tsx", "handleResizeStart");
requireIncludes("src/components/boards/properties-panel.tsx", "Posición y tamaño");
requireIncludes("package-lock.json", expectedVersion);
requireNotIncludes("src/components/boards/board-page.tsx", "<BoardWorkspaceRail");
if (failures.length) { console.error("[build-deploy-readiness] Failed checks:"); for (const failure of failures) console.error(`- ${failure}`); process.exit(1); }
console.log("[build-deploy-readiness] OK — v58.24.7 package, env and boards home action readiness aligned.");
