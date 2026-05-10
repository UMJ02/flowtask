#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const expectedVersion = "58.24.8.1-boards-hero-asset-integration-template-preview-cleanup";
function exists(rel){ return fs.existsSync(path.join(root, rel)); }
function read(rel){ return exists(rel) ? fs.readFileSync(path.join(root, rel), "utf8") : ""; }
function pass(label){ console.log(`[deploy-production-readiness] OK - ${label}`); }
function fail(label){ failures.push(label); }

const pkg = JSON.parse(read("package.json"));
const scripts = pkg.scripts ?? {};
pkg.version === expectedVersion ? pass("package version aligned") : fail(`package version must be ${expectedVersion}`);
scripts["verify:current"] === "npm run verify:v58.24.8.1" ? pass("verify current aligned") : fail("verify:current must target verify:v58.24.8.1");
scripts["verify:v58.24.8.1"] === "node scripts/verify-v58.24.8.1.mjs" ? pass("version verifier available") : fail("verify:v58.24.8.1 script missing or incorrect");
exists("scripts/verify-v58.24.8.1.mjs") ? pass("verify-v58.24.8.1 script exists") : fail("scripts/verify-v58.24.8.1.mjs missing");
read("src/lib/release/version.ts").includes(expectedVersion) ? pass("runtime version export aligned") : fail("src/lib/release/version.ts must export v58.24.8.1");
exists("docs/release/V58_24_8_1_BOARDS_HERO_ASSET_INTEGRATION_TEMPLATE_PREVIEW_CLEANUP.md") ? pass("release notes available") : fail("release notes missing");
exists("docs/qa/FLOWTASK_V58_24_8_1_BOARDS_HERO_ASSET_INTEGRATION_TEMPLATE_PREVIEW_CLEANUP_QA.md") ? pass("QA document available") : fail("QA doc missing");
exists("docs/boards/FLOWTASK_BOARDS_HOME_UI_REDESIGN.md") ? pass("boards home design doc available") : fail("boards home doc missing");
for (const [label, rel, text] of [
  ["boards home hero available", "src/components/boards/boards-home.tsx", "/boards-home/hero.png"],
  ["toolbar asset mapping available", "src/components/boards/boards-home.tsx", "HERO_TOOL_ICONS"],
  ["template asset mapping available", "src/components/boards/boards-home.tsx", "TEMPLATE_VISUALS"],
  ["saved board delete available", "src/components/boards/boards-home.tsx", "deleteBoard"],
  ["soft delete uses deleted_at", "src/components/boards/boards-home.tsx", "deleted_at"],
  ["boards home CSS available", "src/app/globals.css", ".board-home-hero-stage-frame"],
  ["board editor toolbar preserved", "src/components/boards/board-toolbox.tsx", "board-tool-palette"],
  ["realtime cursors preserved", "src/components/boards/board-realtime-cursors.tsx", "BoardRealtimeCursors"],
]) read(rel).includes(text) ? pass(label) : fail(label);
for (const rel of [
  "public/boards-home/hero.png",
  "public/boards-home/diagrama_fujo.png",
  "public/boards-home/plan_proyecto.png",
  "public/boards-home/mapa_ideas.png",
  "public/boards-home/pizarra_blanco.png",
  "public/boards-home/wireframe.png",
  "public/boards-home/icon-flecha.png",
  "public/boards-home/icon-frame.png",
  "public/boards-home/icon-text.png",
  "public/boards-home/icon-puntos.png",
]) exists(rel) ? pass(`${rel} available`) : fail(`${rel} missing`);
read(".env.example").includes("NEXT_PUBLIC_SUPABASE_URL") ? pass("Supabase URL env documented") : fail(".env.example missing NEXT_PUBLIC_SUPABASE_URL");
read(".env.example").includes("NEXT_PUBLIC_SUPABASE_ANON_KEY") ? pass("Supabase anon env documented") : fail(".env.example missing NEXT_PUBLIC_SUPABASE_ANON_KEY");
read(".env.example").includes("SUPABASE_SERVICE_ROLE_KEY") ? pass("Supabase service role env documented") : fail(".env.example missing SUPABASE_SERVICE_ROLE_KEY");
const vercel = JSON.parse(read("vercel.json"));
vercel.framework === "nextjs" ? pass("Vercel framework aligned") : fail("vercel.json framework must be nextjs");
vercel.buildCommand === "npm run vercel:build" ? pass("Vercel build command aligned") : fail("vercel.json buildCommand must be npm run vercel:build");
read("package-lock.json").includes(expectedVersion) ? pass("package-lock version aligned") : fail("package-lock.json must include v58.24.8.1 package version");
if (failures.length) {
  console.error("[deploy-production-readiness] Failed checks:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("[deploy-production-readiness] OK — v58.24.8.1 production readiness aligned.");
