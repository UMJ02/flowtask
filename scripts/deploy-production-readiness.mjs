#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const expectedVersion = "58.24.8.4-boards-create-rls-diagnostics-workspace-scope-hardening";

function exists(rel){ return fs.existsSync(path.join(root, rel)); }
function read(rel){ return exists(rel) ? fs.readFileSync(path.join(root, rel), "utf8") : ""; }
function pass(label){ console.log(`[deploy-production-readiness] OK - ${label}`); }
function fail(label){ failures.push(label); }

const pkg = JSON.parse(read("package.json"));
const scripts = pkg.scripts ?? {};

pkg.version === expectedVersion ? pass("package version aligned") : fail(`package version must be ${expectedVersion}`);
scripts["verify:current"] === "npm run verify:v58.24.8.4" ? pass("verify current aligned") : fail("verify:current must target verify:v58.24.8.4");
scripts["verify:v58.24.8.4"] === "node scripts/verify-v58.24.8.4.mjs" ? pass("version verifier available") : fail("verify:v58.24.8.4 script missing or incorrect");
exists("scripts/verify-v58.24.8.4.mjs") ? pass("verify-v58.24.8.4 script exists") : fail("scripts/verify-v58.24.8.4.mjs missing");
read("src/lib/release/version.ts").includes(expectedVersion) ? pass("runtime version export aligned") : fail("src/lib/release/version.ts must export v58.24.8.4");
exists("docs/release/V58_24_8_4_BOARDS_CREATE_RLS_DIAGNOSTICS_WORKSPACE_SCOPE_HARDENING.md") ? pass("release notes available") : fail("release notes missing");
exists("docs/qa/FLOWTASK_V58_24_8_4_BOARDS_CREATE_RLS_DIAGNOSTICS_WORKSPACE_SCOPE_HARDENING_QA.md") ? pass("QA document available") : fail("QA doc missing");
exists("docs/boards/FLOWTASK_BOARDS_RLS_WORKSPACE_SCOPE_HARDENING.md") ? pass("RLS hardening doc available") : fail("RLS hardening doc missing");
exists("supabase/migrations/0050_v58_24_8_4_visual_boards_rls_workspace_scope.sql") ? pass("RLS hardening SQL available") : fail("RLS hardening SQL missing");

for (const [label, rel, text] of [
  ["board create diagnostics helper available", "src/components/boards/boards-home.tsx", "getBoardCreateErrorMessage"],
  ["board diagnostics logger available", "src/components/boards/boards-home.tsx", "logBoardDiagnostic"],
  ["public_can_edit explicit in create payload", "src/components/boards/boards-home.tsx", "public_can_edit: false"],
  ["workspace diagnostic key available", "src/components/boards/boards-home.tsx", "workspaceKey: context.workspaceKey"],
  ["RLS UI error message aligned", "src/components/boards/boards-home.tsx", "No pudimos crear la pizarra. Revisa sesión, permisos RLS o el workspace activo."],
  ["boards home hero preserved", "src/components/boards/boards-home.tsx", "/boards-home/hero.png"],
  ["board editor toolbar preserved", "src/components/boards/board-toolbox.tsx", "board-tool-palette"],
  ["realtime cursors preserved", "src/components/boards/board-realtime-cursors.tsx", "BoardRealtimeCursors"],
  ["RLS policy doc includes organization membership", "docs/boards/FLOWTASK_BOARDS_RLS_WORKSPACE_SCOPE_HARDENING.md", "organization_members"],
  ["RLS SQL includes insert owner policy", "supabase/migrations/0050_v58_24_8_4_visual_boards_rls_workspace_scope.sql", "visual_boards_insert_owner"]
]) read(rel).includes(text) ? pass(label) : fail(label);

const vercel = JSON.parse(read("vercel.json"));
vercel.framework === "nextjs" ? pass("Vercel framework aligned") : fail("vercel.json framework must be nextjs");
vercel.buildCommand === "npm run vercel:build" ? pass("Vercel build command aligned") : fail("vercel.json buildCommand must be npm run vercel:build");
read("package-lock.json").includes(expectedVersion) ? pass("package-lock version aligned") : fail("package-lock.json must include v58.24.8.4 package version");

if (failures.length) {
  console.error("[deploy-production-readiness] Failed checks:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("[deploy-production-readiness] OK — v58.24.8.4 production readiness aligned.");
