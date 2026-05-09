#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
const root = process.cwd();
const failures = [];
const expectedVersion = "58.23.7-board-realtime-collaboration";
function exists(rel){ return fs.existsSync(path.join(root, rel)); }
function read(rel){ return exists(rel) ? fs.readFileSync(path.join(root, rel), "utf8") : ""; }
function pass(label){ console.log(`[deploy-production-readiness] OK - ${label}`); }
function fail(label){ failures.push(label); }
const pkg = JSON.parse(read("package.json"));
const scripts = pkg.scripts ?? {};
pkg.version === expectedVersion ? pass("package version aligned") : fail(`package version must be ${expectedVersion}`);
scripts["verify:current"] === "npm run verify:v58.23.7" ? pass("verify current aligned") : fail("verify:current must target verify:v58.23.7");
scripts["verify:v58.23.7"] === "node scripts/verify-v58.23.7.mjs" ? pass("version verifier available") : fail("verify:v58.23.7 script missing or incorrect");
exists("scripts/verify-v58.23.7.mjs") ? pass("verify-v58.23.7 script exists") : fail("scripts/verify-v58.23.7.mjs missing");
read("src/lib/release/version.ts").includes(expectedVersion) ? pass("runtime version export aligned") : fail("src/lib/release/version.ts must export v58.23.7");
exists("docs/release/V58_23_7_BOARD_REALTIME_COLLABORATION.md") ? pass("release notes available") : fail("release notes missing");
exists("docs/qa/FLOWTASK_V58_23_7_BOARD_REALTIME_QA.md") ? pass("QA document available") : fail("QA doc missing");
exists("docs/boards/FLOWTASK_BOARD_REALTIME_COLLABORATION.md") ? pass("board realtime document available") : fail("board realtime doc missing");
for (const [label, rel, text] of [
  ["realtime cursors component available", "src/components/boards/board-realtime-cursors.tsx", "BoardRealtimeCursors"],
  ["presence type available", "src/lib/boards/board-types.ts", "VisualBoardPresence"],
  ["board realtime channel available", "src/components/boards/board-page.tsx", "supabase.channel(`visual-board:${boardId}`"],
  ["board presence sync available", "src/components/boards/board-page.tsx", "presenceState"],
  ["board cursor publishing available", "src/components/boards/board-page.tsx", "publishRealtimeCursor"],
  ["board elements realtime available", "src/components/boards/board-page.tsx", "visual_board_elements"],
  ["board comments realtime available", "src/components/boards/board-page.tsx", "visual_board_comments"],
  ["board activity realtime available", "src/components/boards/board-page.tsx", "visual_board_activity"],
  ["board collaborators realtime available", "src/components/boards/board-page.tsx", "visual_board_collaborators"],
  ["realtime publication migration available", "supabase/migrations/0049_v58_23_7_board_realtime_collaboration.sql", "supabase_realtime"],
  ["realtime replica identity available", "supabase/migrations/0049_v58_23_7_board_realtime_collaboration.sql", "replica identity full"],
]) read(rel).includes(text) ? pass(label) : fail(label);
read(".env.example").includes("NEXT_PUBLIC_SUPABASE_URL") ? pass("Supabase URL env documented") : fail(".env.example missing NEXT_PUBLIC_SUPABASE_URL");
read(".env.example").includes("NEXT_PUBLIC_SUPABASE_ANON_KEY") ? pass("Supabase anon env documented") : fail(".env.example missing NEXT_PUBLIC_SUPABASE_ANON_KEY");
read(".env.example").includes("SUPABASE_SERVICE_ROLE_KEY") ? pass("Supabase service role env documented") : fail(".env.example missing SUPABASE_SERVICE_ROLE_KEY");
const vercel = JSON.parse(read("vercel.json"));
vercel.framework === "nextjs" ? pass("Vercel framework aligned") : fail("vercel.json framework must be nextjs");
vercel.buildCommand === "npm run vercel:build" ? pass("Vercel build command aligned") : fail("vercel.json buildCommand must be npm run vercel:build");
read("package-lock.json").includes(expectedVersion) ? pass("package-lock version aligned") : fail("package-lock.json must include v58.23.7 package version");
if (failures.length) {
  console.error("[deploy-production-readiness] Failed checks:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("[deploy-production-readiness] OK — v58.23.7 production readiness aligned.");
