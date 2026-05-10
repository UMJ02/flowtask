#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const expectedVersion = "58.24.8.2-boards-hero-toolbar-size-polish";
function exists(rel){ return fs.existsSync(path.join(root, rel)); }
function read(rel){ return exists(rel) ? fs.readFileSync(path.join(root, rel), "utf8") : ""; }
function pass(label){ console.log(`[deploy-production-readiness] OK - ${label}`); }
function fail(label){ failures.push(label); }

const pkg = JSON.parse(read("package.json"));
const scripts = pkg.scripts ?? {};
pkg.version === expectedVersion ? pass("package version aligned") : fail(`package version must be ${expectedVersion}`);
scripts["verify:current"] === "npm run verify:v58.24.8.2" ? pass("verify current aligned") : fail("verify:current must target verify:v58.24.8.2");
scripts["verify:v58.24.8.2"] === "node scripts/verify-v58.24.8.2.mjs" ? pass("version verifier available") : fail("verify:v58.24.8.2 script missing or incorrect");
exists("scripts/verify-v58.24.8.2.mjs") ? pass("verify-v58.24.8.2 script exists") : fail("scripts/verify-v58.24.8.2.mjs missing");
read("src/lib/release/version.ts").includes(expectedVersion) ? pass("runtime version export aligned") : fail("src/lib/release/version.ts must export v58.24.8.2");
exists("docs/release/V58_24_8_2_BOARDS_HERO_TOOLBAR_SIZE_POLISH.md") ? pass("release notes available") : fail("release notes missing");
exists("docs/qa/FLOWTASK_V58_24_8_2_BOARDS_HERO_TOOLBAR_SIZE_POLISH_QA.md") ? pass("QA document available") : fail("QA doc missing");
exists("docs/boards/FLOWTASK_BOARDS_HOME_UI_REDESIGN.md") ? pass("boards home design doc available") : fail("boards home doc missing");
for (const [label, rel, text] of [
  ["boards home hero available", "src/components/boards/boards-home.tsx", "/boards-home/hero.png"],
  ["toolbar asset mapping available", "src/components/boards/boards-home.tsx", "HERO_TOOL_ICONS"],
  ["toolbar polish CSS available", "src/app/globals.css", ".board-home-hero-toolbar"],
  ["smaller toolbar sizing available", "src/app/globals.css", "width: 40px;"],
  ["smaller icon sizing available", "src/app/globals.css", "width: 34px;"],
  ["saved board delete available", "src/components/boards/boards-home.tsx", "deleteBoard"],
  ["soft delete uses deleted_at", "src/components/boards/boards-home.tsx", "deleted_at"],
  ["board editor toolbar preserved", "src/components/boards/board-toolbox.tsx", "board-tool-palette"],
  ["realtime cursors preserved", "src/components/boards/board-realtime-cursors.tsx", "BoardRealtimeCursors"]
]) read(rel).includes(text) ? pass(label) : fail(label);
const vercel = JSON.parse(read("vercel.json"));
vercel.framework === "nextjs" ? pass("Vercel framework aligned") : fail("vercel.json framework must be nextjs");
vercel.buildCommand === "npm run vercel:build" ? pass("Vercel build command aligned") : fail("vercel.json buildCommand must be npm run vercel:build");
read("package-lock.json").includes(expectedVersion) ? pass("package-lock version aligned") : fail("package-lock.json must include v58.24.8.2 package version");
if (failures.length) {
  console.error("[deploy-production-readiness] Failed checks:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("[deploy-production-readiness] OK — v58.24.8.2 production readiness aligned.");
