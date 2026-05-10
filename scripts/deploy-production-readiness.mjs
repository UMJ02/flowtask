#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
const root = process.cwd();
const failures = [];
const expectedVersion = "58.24.8.3-boards-home-style-polish";
function exists(rel){ return fs.existsSync(path.join(root, rel)); }
function read(rel){ return exists(rel) ? fs.readFileSync(path.join(root, rel), "utf8") : ""; }
function pass(label){ console.log(`[deploy-production-readiness] OK - ${label}`); }
function fail(label){ failures.push(label); }
const pkg = JSON.parse(read("package.json"));
const scripts = pkg.scripts ?? {};
pkg.version === expectedVersion ? pass("package version aligned") : fail(`package version must be ${expectedVersion}`);
scripts["verify:current"] === "npm run verify:v58.24.8.3" ? pass("verify current aligned") : fail("verify:current must target verify:v58.24.8.3");
scripts["verify:v58.24.8.3"] === "node scripts/verify-v58.24.8.3.mjs" ? pass("version verifier available") : fail("verify:v58.24.8.3 script missing or incorrect");
exists("scripts/verify-v58.24.8.3.mjs") ? pass("verify-v58.24.8.3 script exists") : fail("scripts/verify-v58.24.8.3.mjs missing");
read("src/lib/release/version.ts").includes(expectedVersion) ? pass("runtime version export aligned") : fail("src/lib/release/version.ts must export v58.24.8.3");
exists("docs/release/V58_24_8_3_BOARDS_HOME_STYLE_POLISH.md") ? pass("release notes available") : fail("release notes missing");
exists("docs/qa/FLOWTASK_V58_24_8_3_BOARDS_HOME_STYLE_POLISH_QA.md") ? pass("QA document available") : fail("QA doc missing");
for (const [label, rel, text] of [
  ["boards home hero available", "src/components/boards/boards-home.tsx", "/boards-home/hero.png"],
  ["style polish CSS available", "src/app/globals.css", "v58.24.8.3 — Boards Home Style Polish"],
  ["template cards polished", "src/app/globals.css", ".board-home-template-card"],
  ["recent cards polished", "src/app/globals.css", ".board-home-recent-card"],
  ["badge polish available", "src/app/globals.css", ".board-home-access-badge"],
  ["saved board delete available", "src/components/boards/boards-home.tsx", "deleteBoard"],
  ["soft delete uses deleted_at", "src/components/boards/boards-home.tsx", "deleted_at"],
  ["board editor toolbar preserved", "src/components/boards/board-toolbox.tsx", "board-tool-palette"],
  ["realtime cursors preserved", "src/components/boards/board-realtime-cursors.tsx", "BoardRealtimeCursors"]
]) read(rel).includes(text) ? pass(label) : fail(label);
const vercel = JSON.parse(read("vercel.json"));
vercel.framework === "nextjs" ? pass("Vercel framework aligned") : fail("vercel.json framework must be nextjs");
vercel.buildCommand === "npm run vercel:build" ? pass("Vercel build command aligned") : fail("vercel.json buildCommand must be npm run vercel:build");
read("package-lock.json").includes(expectedVersion) ? pass("package-lock version aligned") : fail("package-lock.json must include v58.24.8.3 package version");
if (failures.length) {
  console.error("[deploy-production-readiness] Failed checks:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("[deploy-production-readiness] OK — v58.24.8.3 production readiness aligned.");
