#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
const root = process.cwd();
const failures = [];
const expectedVersion = "58.23.1-board-connectors-properties-panel";
function exists(rel){ return fs.existsSync(path.join(root, rel)); }
function read(rel){ return exists(rel) ? fs.readFileSync(path.join(root, rel), "utf8") : ""; }
function pass(label){ console.log(`[deploy-production-readiness] OK - ${label}`); }
function fail(label){ failures.push(label); }
const pkg = JSON.parse(read("package.json"));
const scripts = pkg.scripts ?? {};
pkg.version === expectedVersion ? pass("package version aligned") : fail(`package version must be ${expectedVersion}`);
scripts["verify:current"] === "npm run verify:v58.23.1" ? pass("verify current aligned") : fail("verify:current must target verify:v58.23.1");
scripts["verify:v58.23.1"] === "node scripts/verify-v58.23.1.mjs" ? pass("version verifier available") : fail("verify:v58.23.1 script missing or incorrect");
exists("scripts/verify-v58.23.1.mjs") ? pass("verify-v58.23.1 script exists") : fail("scripts/verify-v58.23.1.mjs missing");
read("src/lib/release/version.ts").includes(expectedVersion) ? pass("runtime version export aligned") : fail("src/lib/release/version.ts must export v58.23.1");
exists("docs/release/V58_23_1_BOARD_CONNECTORS_PROPERTIES_PANEL.md") ? pass("release notes available") : fail("release notes missing");
exists("docs/qa/FLOWTASK_V58_23_1_BOARD_CONNECTORS_QA.md") ? pass("QA document available") : fail("QA doc missing");
for (const [label, rel, text] of [
  ["connector layer available", "src/components/boards/connector-layer.tsx", "ConnectorLayer"],
  ["connector svg markers available", "src/components/boards/connector-layer.tsx", "board-arrow"],
  ["connector tool available", "src/lib/boards/board-tools.ts", "connector"],
  ["connector defaults available", "src/lib/boards/board-defaults.ts", "createDefaultConnector"],
  ["connector serialization available", "src/lib/boards/board-serialization.ts", "fromElementId"],
  ["properties panel connector controls available", "src/components/boards/properties-panel.tsx", "Flecha final"],
  ["board page connector flow available", "src/components/boards/board-page.tsx", "pendingConnector"],
  ["visual boards table migration available", "supabase/migrations/0045_v58_23_0_visual_boards_foundation.sql", "create table if not exists public.visual_boards"],
]) read(rel).includes(text) ? pass(label) : fail(label);
read(".env.example").includes("NEXT_PUBLIC_SUPABASE_URL") ? pass("Supabase URL env documented") : fail(".env.example missing NEXT_PUBLIC_SUPABASE_URL");
read(".env.example").includes("NEXT_PUBLIC_SUPABASE_ANON_KEY") ? pass("Supabase anon env documented") : fail(".env.example missing NEXT_PUBLIC_SUPABASE_ANON_KEY");
read(".env.example").includes("SUPABASE_SERVICE_ROLE_KEY") ? pass("Supabase service role env documented") : fail(".env.example missing SUPABASE_SERVICE_ROLE_KEY");
const vercel = JSON.parse(read("vercel.json"));
vercel.framework === "nextjs" ? pass("Vercel framework aligned") : fail("vercel.json framework must be nextjs");
vercel.buildCommand === "npm run vercel:build" ? pass("Vercel build command aligned") : fail("vercel.json buildCommand must be npm run vercel:build");
read("package-lock.json").includes(expectedVersion) ? pass("package-lock version aligned") : fail("package-lock.json must include v58.23.1 package version");
if (failures.length) {
  console.error("[deploy-production-readiness] Failed checks:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("[deploy-production-readiness] OK — v58.23.1 production readiness aligned.");
