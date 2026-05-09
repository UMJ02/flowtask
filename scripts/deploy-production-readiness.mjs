#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
const root = process.cwd();
const failures = [];
const expectedVersion = "58.24.3-board-visual-polish-toolbar-system-hardening";
function exists(rel){ return fs.existsSync(path.join(root, rel)); }
function read(rel){ return exists(rel) ? fs.readFileSync(path.join(root, rel), "utf8") : ""; }
function pass(label){ console.log(`[deploy-production-readiness] OK - ${label}`); }
function fail(label){ failures.push(label); }
const pkg = JSON.parse(read("package.json"));
const scripts = pkg.scripts ?? {};
pkg.version === expectedVersion ? pass("package version aligned") : fail(`package version must be ${expectedVersion}`);
scripts["verify:current"] === "npm run verify:v58.24.3" ? pass("verify current aligned") : fail("verify:current must target verify:v58.24.3");
scripts["verify:v58.24.3"] === "node scripts/verify-v58.24.3.mjs" ? pass("version verifier available") : fail("verify:v58.24.3 script missing or incorrect");
exists("scripts/verify-v58.24.3.mjs") ? pass("verify-v58.24.3 script exists") : fail("scripts/verify-v58.24.3.mjs missing");
read("src/lib/release/version.ts").includes(expectedVersion) ? pass("runtime version export aligned") : fail("src/lib/release/version.ts must export v58.24.3");
exists("docs/release/V58_24_3_BOARD_VISUAL_POLISH_TOOLBAR_SYSTEM_HARDENING.md") ? pass("release notes available") : fail("release notes missing");
exists("docs/qa/FLOWTASK_V58_24_3_BOARD_VISUAL_POLISH_QA.md") ? pass("QA document available") : fail("QA doc missing");
exists("docs/boards/FLOWTASK_BOARD_VISUAL_POLISH_TOOLBAR_SYSTEM.md") ? pass("visual polish doc available") : fail("visual polish doc missing");
for (const [label, rel, text] of [
  ["workspace rail removed from editor", "src/components/boards/board-page.tsx", "<BoardWorkspaceRail"],
]) read(rel).includes(text) ? fail(label) : pass(label);
for (const [label, rel, text] of [
  ["professional toolbox palette available", "src/components/boards/board-toolbox.tsx", "board-tool-palette"],
  ["movable toolbar available", "src/components/boards/board-toolbox.tsx", "ToolbarMode"],
  ["clear board action available", "src/components/boards/board-page.tsx", "clearBoardElements"],
  ["clear board modal available", "src/app/globals.css", ".board-clear-dialog"],
  ["shape variant dropdown available", "src/components/boards/board-toolbox.tsx", "Tipo de forma"],
  ["resize handles available", "src/components/boards/board-element.tsx", "ResizeHandles"],
  ["manual position size controls available", "src/components/boards/properties-panel.tsx", "Posición y tamaño"],
  ["table row column steppers available", "src/components/boards/properties-panel.tsx", "Stepper"],
  ["comment edit resolve delete available", "src/components/boards/board-comments-activity.tsx", "onResolveComment"],
  ["comment drag handler available", "src/components/boards/board-page.tsx", "handleCommentDragStart"],
  ["connector endpoint drag available", "src/components/boards/connector-layer.tsx", "onConnectorPointDragStart"],
  ["realtime cursors preserved", "src/components/boards/board-realtime-cursors.tsx", "BoardRealtimeCursors"],
]) read(rel).includes(text) ? pass(label) : fail(label);
read(".env.example").includes("NEXT_PUBLIC_SUPABASE_URL") ? pass("Supabase URL env documented") : fail(".env.example missing NEXT_PUBLIC_SUPABASE_URL");
read(".env.example").includes("NEXT_PUBLIC_SUPABASE_ANON_KEY") ? pass("Supabase anon env documented") : fail(".env.example missing NEXT_PUBLIC_SUPABASE_ANON_KEY");
read(".env.example").includes("SUPABASE_SERVICE_ROLE_KEY") ? pass("Supabase service role env documented") : fail(".env.example missing SUPABASE_SERVICE_ROLE_KEY");
const vercel = JSON.parse(read("vercel.json"));
vercel.framework === "nextjs" ? pass("Vercel framework aligned") : fail("vercel.json framework must be nextjs");
vercel.buildCommand === "npm run vercel:build" ? pass("Vercel build command aligned") : fail("vercel.json buildCommand must be npm run vercel:build");
read("package-lock.json").includes(expectedVersion) ? pass("package-lock version aligned") : fail("package-lock.json must include v58.24.3 package version");
if (failures.length) { console.error("[deploy-production-readiness] Failed checks:"); for (const failure of failures) console.error(`- ${failure}`); process.exit(1); }
console.log("[deploy-production-readiness] OK — v58.24.3 production readiness aligned.");
