#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
const root = process.cwd();
const failures = [];
const expectedVersion = "58.23.4-board-sharing-collaboration-layer";
function exists(rel){ return fs.existsSync(path.join(root, rel)); }
function read(rel){ return exists(rel) ? fs.readFileSync(path.join(root, rel), "utf8") : ""; }
function pass(label){ console.log(`[deploy-production-readiness] OK - ${label}`); }
function fail(label){ failures.push(label); }
const pkg = JSON.parse(read("package.json"));
const scripts = pkg.scripts ?? {};
pkg.version === expectedVersion ? pass("package version aligned") : fail(`package version must be ${expectedVersion}`);
scripts["verify:current"] === "npm run verify:v58.23.4" ? pass("verify current aligned") : fail("verify:current must target verify:v58.23.4");
scripts["verify:v58.23.4"] === "node scripts/verify-v58.23.4.mjs" ? pass("version verifier available") : fail("verify:v58.23.4 script missing or incorrect");
exists("scripts/verify-v58.23.4.mjs") ? pass("verify-v58.23.4 script exists") : fail("scripts/verify-v58.23.4.mjs missing");
read("src/lib/release/version.ts").includes(expectedVersion) ? pass("runtime version export aligned") : fail("src/lib/release/version.ts must export v58.23.4");
exists("docs/release/V58_23_4_BOARD_SHARING_COLLABORATION_LAYER.md") ? pass("release notes available") : fail("release notes missing");
exists("docs/qa/FLOWTASK_V58_23_4_BOARD_SHARING_COLLABORATION_QA.md") ? pass("QA document available") : fail("QA doc missing");
for (const [label, rel, text] of [
  ["board sharing panel available", "src/components/boards/board-sharing-panel.tsx", "BoardSharingPanel"],
  ["shared board public view available", "src/components/boards/board-share-view.tsx", "BoardShareView"],
  ["public share route available", "src/app/(public)/share/boards/[token]/page.tsx", "SharedVisualBoardPage"],
  ["board topbar opens share panel", "src/components/boards/board-topbar.tsx", "onOpenShare"],
  ["board page sharing update available", "src/components/boards/board-page.tsx", "updateBoardSharing"],
  ["board collaborator invite available", "src/components/boards/board-page.tsx", "inviteBoardCollaborator"],
  ["board collaborator types available", "src/lib/boards/board-types.ts", "VisualBoardCollaborator"],
  ["board collaborator mapper available", "src/lib/boards/board-serialization.ts", "mapBoardCollaboratorRow"],
  ["share token migration available", "supabase/migrations/0047_v58_23_4_board_sharing_collaboration.sql", "share_token"],
  ["collaborators table migration available", "supabase/migrations/0047_v58_23_4_board_sharing_collaboration.sql", "visual_board_collaborators"],
  ["public link RLS available", "supabase/migrations/0047_v58_23_4_board_sharing_collaboration.sql", "visibility = 'public_link'"],
]) read(rel).includes(text) ? pass(label) : fail(label);
read(".env.example").includes("NEXT_PUBLIC_SUPABASE_URL") ? pass("Supabase URL env documented") : fail(".env.example missing NEXT_PUBLIC_SUPABASE_URL");
read(".env.example").includes("NEXT_PUBLIC_SUPABASE_ANON_KEY") ? pass("Supabase anon env documented") : fail(".env.example missing NEXT_PUBLIC_SUPABASE_ANON_KEY");
read(".env.example").includes("SUPABASE_SERVICE_ROLE_KEY") ? pass("Supabase service role env documented") : fail(".env.example missing SUPABASE_SERVICE_ROLE_KEY");
const vercel = JSON.parse(read("vercel.json"));
vercel.framework === "nextjs" ? pass("Vercel framework aligned") : fail("vercel.json framework must be nextjs");
vercel.buildCommand === "npm run vercel:build" ? pass("Vercel build command aligned") : fail("vercel.json buildCommand must be npm run vercel:build");
read("package-lock.json").includes(expectedVersion) ? pass("package-lock version aligned") : fail("package-lock.json must include v58.23.4 package version");
if (failures.length) {
  console.error("[deploy-production-readiness] Failed checks:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("[deploy-production-readiness] OK — v58.23.4 production readiness aligned.");
