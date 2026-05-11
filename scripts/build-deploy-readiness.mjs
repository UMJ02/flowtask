#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const expectedVersion = "58.24.8.4-boards-create-rls-diagnostics-workspace-scope-hardening";
const expectedReleaseLabel = "v58.24.8.4 Boards Create RLS Diagnostics + Workspace Scope Hardening";

function exists(rel){ return fs.existsSync(path.join(root, rel)); }
function read(rel){ return exists(rel) ? fs.readFileSync(path.join(root, rel), "utf8") : ""; }
function requireFile(rel){ if(!exists(rel)) failures.push(`Missing required file: ${rel}`); }
function requireIncludes(rel, text){ if(!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); }

for (const rel of [
  "package.json","package-lock.json","vercel.json","next.config.ts",".nvmrc",".env.example",
  "scripts/runtime-check.mjs","scripts/validate-env.mjs","scripts/verify-v58.24.8.4.mjs",
  "docs/release/V58_24_8_4_BOARDS_CREATE_RLS_DIAGNOSTICS_WORKSPACE_SCOPE_HARDENING.md",
  "docs/qa/FLOWTASK_V58_24_8_4_BOARDS_CREATE_RLS_DIAGNOSTICS_WORKSPACE_SCOPE_HARDENING_QA.md",
  "docs/boards/FLOWTASK_BOARDS_RLS_WORKSPACE_SCOPE_HARDENING.md",
  "supabase/migrations/0050_v58_24_8_4_visual_boards_rls_workspace_scope.sql",
  "src/components/boards/boards-home.tsx",
  "src/components/boards/board-toolbox.tsx",
  "src/components/boards/board-realtime-cursors.tsx",
  "src/components/boards/properties-panel.tsx",
  "public/boards-home/hero.png"
]) requireFile(rel);

const pkg = JSON.parse(read("package.json"));
const scripts = pkg.scripts ?? {};
for (const scriptName of ["build","vercel:build","deploy:readiness","build:preflight","verify:current","deploy:production:ready","verify:v58.24.8.4"]) {
  if (!scripts[scriptName]) failures.push(`Missing package script: ${scriptName}`);
}

if (pkg.version !== expectedVersion) failures.push(`Unexpected package version: ${pkg.version}`);
if (scripts["verify:current"] !== "npm run verify:v58.24.8.4") failures.push("verify:current must target verify:v58.24.8.4");
if (scripts["verify:v58.24.8.4"] !== "node scripts/verify-v58.24.8.4.mjs") failures.push("verify:v58.24.8.4 must target scripts/verify-v58.24.8.4.mjs");

const vercel = JSON.parse(read("vercel.json"));
if (vercel.framework !== "nextjs") failures.push("vercel.json framework must be nextjs");
if (vercel.buildCommand !== "npm run vercel:build") failures.push("vercel.json buildCommand must be npm run vercel:build");

requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedReleaseLabel);
requireIncludes("src/components/boards/boards-home.tsx", "getBoardCreateErrorMessage");
requireIncludes("src/components/boards/boards-home.tsx", "logBoardDiagnostic");
requireIncludes("src/components/boards/boards-home.tsx", "public_can_edit: false");
requireIncludes("src/components/boards/boards-home.tsx", "workspaceKey: context.workspaceKey");
requireIncludes("src/components/boards/boards-home.tsx", "No pudimos crear la pizarra. Revisa sesión, permisos RLS o el workspace activo.");
requireIncludes("docs/boards/FLOWTASK_BOARDS_RLS_WORKSPACE_SCOPE_HARDENING.md", "visual_boards_select_access");
requireIncludes("supabase/migrations/0050_v58_24_8_4_visual_boards_rls_workspace_scope.sql", "visual_boards_insert_owner");
requireIncludes("package-lock.json", expectedVersion);

if (failures.length) {
  console.error("[build-deploy-readiness] Failed checks:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("[build-deploy-readiness] OK — v58.24.8.4 package, env and board create RLS diagnostics readiness aligned.");
