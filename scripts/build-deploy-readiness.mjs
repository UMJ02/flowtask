#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
const root = process.cwd();
const failures = [];
const expectedVersion = "58.23.2-board-tables-inline-editing";
const expectedReleaseLabel = "v58.23.2 Board Tables + Inline Editing";
function exists(rel){ return fs.existsSync(path.join(root, rel)); }
function read(rel){ return exists(rel) ? fs.readFileSync(path.join(root, rel), "utf8") : ""; }
function requireFile(rel){ if(!exists(rel)) failures.push(`Missing required file: ${rel}`); }
function requireIncludes(rel, text){ if(!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); }
for (const rel of ["package.json","package-lock.json","vercel.json","next.config.ts",".nvmrc",".env.example","scripts/runtime-check.mjs","scripts/validate-env.mjs","scripts/verify-v58.23.2.mjs","docs/release/V58_23_2_BOARD_TABLES_INLINE_EDITING.md","docs/qa/FLOWTASK_V58_23_2_BOARD_TABLES_QA.md","docs/boards/FLOWTASK_BOARD_TABLES_INLINE_EDITING.md","supabase/migrations/0045_v58_23_0_visual_boards_foundation.sql"]) requireFile(rel);
const pkg = JSON.parse(read("package.json"));
const scripts = pkg.scripts ?? {};
for (const scriptName of ["build","vercel:build","deploy:readiness","build:preflight","verify:current","deploy:production:ready","verify:v58.23.2"]) if (!scripts[scriptName]) failures.push(`Missing package script: ${scriptName}`);
if (pkg.version !== expectedVersion) failures.push(`Unexpected package version: ${pkg.version}`);
if (scripts["verify:current"] !== "npm run verify:v58.23.2") failures.push("verify:current must target verify:v58.23.2");
if (scripts["verify:v58.23.2"] !== "node scripts/verify-v58.23.2.mjs") failures.push("verify:v58.23.2 must target scripts/verify-v58.23.2.mjs");
const vercel = JSON.parse(read("vercel.json"));
if (vercel.framework !== "nextjs") failures.push("vercel.json framework must be nextjs");
if (vercel.buildCommand !== "npm run vercel:build") failures.push("vercel.json buildCommand must be npm run vercel:build");
requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedReleaseLabel);
requireIncludes("src/components/boards/board-element.tsx", "onUpdateTableCell");
requireIncludes("src/components/boards/properties-panel.tsx", "Tabla visual");
requireIncludes("src/components/boards/floating-format-toolbar.tsx", "onAddTableColumn");
requireIncludes("src/components/boards/board-page.tsx", "updateTableColumnLabel");
requireIncludes("src/lib/boards/board-serialization.ts", "columns: element.columns");
requireIncludes("package-lock.json", expectedVersion);
if (failures.length) {
  console.error("[build-deploy-readiness] Failed checks:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("[build-deploy-readiness] OK — v58.23.2 package, env and Board Tables readiness aligned.");
