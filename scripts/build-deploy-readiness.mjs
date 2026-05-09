#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
const root = process.cwd();
const failures = [];
const expectedVersion = "58.24.5-board-toolbar-collapse-animation-fix";
const expectedReleaseLabel = "v58.24.5 Board Toolbar Collapse Animation Fix";
function exists(rel){ return fs.existsSync(path.join(root, rel)); }
function read(rel){ return exists(rel) ? fs.readFileSync(path.join(root, rel), "utf8") : ""; }
function requireFile(rel){ if(!exists(rel)) failures.push(`Missing required file: ${rel}`); }
function requireIncludes(rel, text){ if(!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); }
function requireNotIncludes(rel, text){ if(read(rel).includes(text)) failures.push(`Unexpected '${text}' in ${rel}`); }
for (const rel of [
  "package.json","package-lock.json","vercel.json","next.config.ts",".nvmrc",".env.example",
  "scripts/runtime-check.mjs","scripts/validate-env.mjs","scripts/verify-v58.24.5.mjs",
  "docs/release/V58_24_5_BOARD_TOOLBAR_COLLAPSE_ANIMATION_FIX.md",
  "docs/qa/FLOWTASK_V58_24_5_BOARD_TOOLBAR_COLLAPSE_QA.md",
  "docs/boards/FLOWTASK_BOARD_PREMIUM_VISUAL_SYSTEM.md",
  "supabase/migrations/0045_v58_23_0_visual_boards_foundation.sql",
  "supabase/migrations/0049_v58_23_7_board_realtime_collaboration.sql",
  "src/components/boards/board-toolbox.tsx",
  "src/components/boards/board-comments-activity.tsx",
  "src/components/boards/board-realtime-cursors.tsx",
  "src/components/boards/properties-panel.tsx",
  "src/components/boards/connector-layer.tsx"
]) requireFile(rel);
const pkg = JSON.parse(read("package.json"));
const scripts = pkg.scripts ?? {};
for (const scriptName of ["build","vercel:build","deploy:readiness","build:preflight","verify:current","deploy:production:ready","verify:v58.24.5"]) if (!scripts[scriptName]) failures.push(`Missing package script: ${scriptName}`);
if (pkg.version !== expectedVersion) failures.push(`Unexpected package version: ${pkg.version}`);
if (scripts["verify:current"] !== "npm run verify:v58.24.5") failures.push("verify:current must target verify:v58.24.5");
if (scripts["verify:v58.24.5"] !== "node scripts/verify-v58.24.5.mjs") failures.push("verify:v58.24.5 must target scripts/verify-v58.24.5.mjs");
const vercel = JSON.parse(read("vercel.json"));
if (vercel.framework !== "nextjs") failures.push("vercel.json framework must be nextjs");
if (vercel.buildCommand !== "npm run vercel:build") failures.push("vercel.json buildCommand must be npm run vercel:build");
requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedReleaseLabel);
requireIncludes("src/components/boards/board-toolbox.tsx", "board-tool-palette");
requireIncludes("src/components/boards/board-toolbox.tsx", "onRequestClearBoard");
requireIncludes("src/components/boards/board-page.tsx", "clearBoardElements");
requireIncludes("src/app/globals.css", ".board-clear-dialog");
requireIncludes("src/components/boards/board-page.tsx", "handleResizeStart");
requireIncludes("src/components/boards/board-page.tsx", "handleCommentDragStart");
requireIncludes("src/components/boards/board-page.tsx", "handleConnectorPointDragStart");
requireIncludes("src/components/boards/properties-panel.tsx", "Posición y tamaño");
requireIncludes("src/components/boards/properties-panel.tsx", "Stepper");
requireIncludes("src/components/boards/board-comments-activity.tsx", "onUpdateComment");
requireIncludes("src/app/globals.css", ".board-tool-palette");
requireIncludes("package-lock.json", expectedVersion);
requireNotIncludes("src/components/boards/board-page.tsx", "<BoardWorkspaceRail");
if (failures.length) { console.error("[build-deploy-readiness] Failed checks:"); for (const failure of failures) console.error(`- ${failure}`); process.exit(1); }
console.log("[build-deploy-readiness] OK — v58.24.5 package, env and toolbar collapse readiness aligned.");
