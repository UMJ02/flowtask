#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const expectedVersion = "58.25.7.4-boards-delete-rpc-asset-fallback-fix";

function exists(rel) { return fs.existsSync(path.join(root, rel)); }
function read(rel) { return exists(rel) ? fs.readFileSync(path.join(root, rel), "utf8") : ""; }
function requireFile(rel) { if (!exists(rel)) failures.push(`Missing required file: ${rel}`); }
function requireIncludes(rel, text) { if (!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); }
function requireNotIncludes(rel, text) { if (read(rel).includes(text)) failures.push(`Did not expect '${text}' in ${rel}`); }

for (const rel of [
  "package.json",
  "package-lock.json",
  "vercel.json",
  "next.config.ts",
  ".nvmrc",
  ".env.example",
  "scripts/runtime-check.mjs",
  "scripts/validate-env.mjs",
  "scripts/design-doctor.mjs",
  "scripts/density-guard.mjs",
  "scripts/verify-v58.25.7.4.mjs",
  "docs/release/V58_25_7_4_BOARDS_DELETE_RPC_ASSET_FALLBACK_FIX.md",
  "docs/qa/FLOWTASK_V58_25_7_4_BOARDS_DELETE_RPC_ASSET_FALLBACK_FIX_QA.md",
  "src/components/boards/boards-home.tsx",
  "src/app/globals.css",
  "public/boards-home/diagrama_flujo.png",
  "supabase/migrations/0055_v58_25_7_4_visual_board_safe_delete_rpc.sql"
]) requireFile(rel);

const pkg = JSON.parse(read("package.json"));
const scripts = pkg.scripts ?? {};
if (pkg.version !== expectedVersion) failures.push(`Unexpected package version: ${pkg.version}`);
if (scripts["verify:current"] !== "npm run verify:v58.25.7.4") failures.push("verify:current must target verify:v58.25.7.4");
if (scripts["verify:v58.25.7.4"] !== "node scripts/verify-v58.25.7.4.mjs") failures.push("verify:v58.25.7.4 must target scripts/verify-v58.25.7.4.mjs");

const vercel = JSON.parse(read("vercel.json"));
if (vercel.framework !== "nextjs") failures.push("vercel.json framework must be nextjs");
if (vercel.buildCommand !== "npm run vercel:build") failures.push("vercel.json buildCommand must be npm run vercel:build");

requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("package-lock.json", expectedVersion);
requireIncludes("src/components/boards/boards-home.tsx", "/boards-home/diagrama_flujo.png");
requireNotIncludes("src/components/boards/boards-home.tsx", "/boards-home/diagrama_fujo.png");
requireIncludes("src/components/boards/boards-home.tsx", 'supabase.rpc("safe_delete_visual_board"');
requireIncludes("supabase/migrations/0055_v58_25_7_4_visual_board_safe_delete_rpc.sql", "create or replace function public.safe_delete_visual_board");

if (failures.length) {
  console.error("[build-deploy-readiness] Failed checks:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[build-deploy-readiness] OK — v58.25.7.4 boards delete RPC and asset fallback readiness aligned.");
