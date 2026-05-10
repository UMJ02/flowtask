#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const expectedVersion = "58.24.8.2-boards-hero-toolbar-size-polish";
const expectedReleaseLabel = "v58.24.8.2 Boards Hero Toolbar Size Polish";
function exists(rel){ return fs.existsSync(path.join(root, rel)); }
function read(rel){ return exists(rel) ? fs.readFileSync(path.join(root, rel), "utf8") : ""; }
function requireFile(rel){ if(!exists(rel)) failures.push(`Missing required file: ${rel}`); }
function requireIncludes(rel, text){ if(!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); }

for (const rel of [
  "package.json","package-lock.json","vercel.json","next.config.ts",".nvmrc",".env.example",
  "scripts/runtime-check.mjs","scripts/validate-env.mjs","scripts/verify-v58.24.8.2.mjs",
  "docs/release/V58_24_8_2_BOARDS_HERO_TOOLBAR_SIZE_POLISH.md",
  "docs/qa/FLOWTASK_V58_24_8_2_BOARDS_HERO_TOOLBAR_SIZE_POLISH_QA.md",
  "docs/boards/FLOWTASK_BOARDS_HOME_UI_REDESIGN.md",
  "src/components/boards/boards-home.tsx",
  "src/components/boards/board-toolbox.tsx",
  "src/components/boards/board-realtime-cursors.tsx",
  "src/components/boards/properties-panel.tsx",
  "public/boards-home/hero.png",
  "public/boards-home/icon-flecha.png",
  "public/boards-home/icon-frame.png",
  "public/boards-home/icon-text.png",
  "public/boards-home/icon-puntos.png"
]) requireFile(rel);

const pkg = JSON.parse(read("package.json"));
const scripts = pkg.scripts ?? {};
for (const scriptName of ["build","vercel:build","deploy:readiness","build:preflight","verify:current","deploy:production:ready","verify:v58.24.8.2"]) {
  if (!scripts[scriptName]) failures.push(`Missing package script: ${scriptName}`);
}
if (pkg.version !== expectedVersion) failures.push(`Unexpected package version: ${pkg.version}`);
if (scripts["verify:current"] !== "npm run verify:v58.24.8.2") failures.push("verify:current must target verify:v58.24.8.2");
if (scripts["verify:v58.24.8.2"] !== "node scripts/verify-v58.24.8.2.mjs") failures.push("verify:v58.24.8.2 must target scripts/verify-v58.24.8.2.mjs");

const vercel = JSON.parse(read("vercel.json"));
if (vercel.framework !== "nextjs") failures.push("vercel.json framework must be nextjs");
if (vercel.buildCommand !== "npm run vercel:build") failures.push("vercel.json buildCommand must be npm run vercel:build");

requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedReleaseLabel);
requireIncludes("src/components/boards/boards-home.tsx", "HERO_TOOL_ICONS");
requireIncludes("src/app/globals.css", "v58.24.8.2 — Boards Hero Toolbar Size Polish");
requireIncludes("src/app/globals.css", "width: 40px;");
requireIncludes("src/app/globals.css", "height: 38px;");
requireIncludes("src/app/globals.css", "width: 34px;");
requireIncludes("src/app/globals.css", "height: 32px;");
requireIncludes("src/components/boards/board-toolbox.tsx", "board-tool-palette");
requireIncludes("src/components/boards/board-page.tsx", "clearBoardElements");
requireIncludes("src/components/boards/properties-panel.tsx", "Posición y tamaño");
requireIncludes("package-lock.json", expectedVersion);

if (failures.length) {
  console.error("[build-deploy-readiness] Failed checks:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("[build-deploy-readiness] OK — v58.24.8.2 package, env and boards hero toolbar polish readiness aligned.");
