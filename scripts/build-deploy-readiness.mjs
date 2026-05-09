#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
const root = process.cwd();
const failures = [];
const expectedVersion = "58.23.4-board-sharing-collaboration-layer";
const expectedReleaseLabel = "v58.23.4 Board Sharing + Collaboration Layer";
function exists(rel){ return fs.existsSync(path.join(root, rel)); }
function read(rel){ return exists(rel) ? fs.readFileSync(path.join(root, rel), "utf8") : ""; }
function requireFile(rel){ if(!exists(rel)) failures.push(`Missing required file: ${rel}`); }
function requireIncludes(rel, text){ if(!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); }
for (const rel of ["package.json","package-lock.json","vercel.json","next.config.ts",".nvmrc",".env.example","scripts/runtime-check.mjs","scripts/validate-env.mjs","scripts/verify-v58.23.4.mjs","docs/release/V58_23_4_BOARD_SHARING_COLLABORATION_LAYER.md","docs/qa/FLOWTASK_V58_23_4_BOARD_SHARING_COLLABORATION_QA.md","docs/boards/FLOWTASK_BOARD_SHARING_COLLABORATION.md","supabase/migrations/0045_v58_23_0_visual_boards_foundation.sql","supabase/migrations/0046_v58_23_3_board_templates_comments_activity.sql","supabase/migrations/0047_v58_23_4_board_sharing_collaboration.sql"]) requireFile(rel);
const pkg = JSON.parse(read("package.json"));
const scripts = pkg.scripts ?? {};
for (const scriptName of ["build","vercel:build","deploy:readiness","build:preflight","verify:current","deploy:production:ready","verify:v58.23.4"]) if (!scripts[scriptName]) failures.push(`Missing package script: ${scriptName}`);
if (pkg.version !== expectedVersion) failures.push(`Unexpected package version: ${pkg.version}`);
if (scripts["verify:current"] !== "npm run verify:v58.23.4") failures.push("verify:current must target verify:v58.23.4");
if (scripts["verify:v58.23.4"] !== "node scripts/verify-v58.23.4.mjs") failures.push("verify:v58.23.4 must target scripts/verify-v58.23.4.mjs");
const vercel = JSON.parse(read("vercel.json"));
if (vercel.framework !== "nextjs") failures.push("vercel.json framework must be nextjs");
if (vercel.buildCommand !== "npm run vercel:build") failures.push("vercel.json buildCommand must be npm run vercel:build");
requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedReleaseLabel);
requireIncludes("src/components/boards/board-sharing-panel.tsx", "BoardSharingPanel");
requireIncludes("src/components/boards/board-share-view.tsx", "BoardShareView");
requireIncludes("src/app/(public)/share/boards/[token]/page.tsx", "BoardShareView");
requireIncludes("src/components/boards/board-page.tsx", "updateBoardSharing");
requireIncludes("src/components/boards/board-page.tsx", "inviteBoardCollaborator");
requireIncludes("src/components/boards/board-topbar.tsx", "onOpenShare");
requireIncludes("supabase/migrations/0047_v58_23_4_board_sharing_collaboration.sql", "visual_board_collaborators");
requireIncludes("supabase/migrations/0047_v58_23_4_board_sharing_collaboration.sql", "share_token");
requireIncludes("package-lock.json", expectedVersion);
if (failures.length) {
  console.error("[build-deploy-readiness] Failed checks:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("[build-deploy-readiness] OK — v58.23.4 package, env and board sharing readiness aligned.");
