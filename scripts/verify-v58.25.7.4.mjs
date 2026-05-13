#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const exists = (rel) => fs.existsSync(path.join(root, rel));
const read = (rel) => exists(rel) ? fs.readFileSync(path.join(root, rel), "utf8") : "";
const requireFile = (rel) => { if (!exists(rel)) failures.push(`Missing required file: ${rel}`); };
const requireIncludes = (rel, text) => { if (!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); };
const requireNotIncludes = (rel, text) => { if (read(rel).includes(text)) failures.push(`Did not expect '${text}' in ${rel}`); };

const expectedVersion = "58.25.7.4-boards-delete-rpc-asset-fallback-fix";
const expectedRelease = "v58.25.7.4 Boards Delete RPC + Asset Fallback Fix";

const pkg = JSON.parse(read("package.json"));
if (pkg.version !== expectedVersion) failures.push("package version must be v58.25.7.4");
if ((pkg.scripts ?? {})["verify:current"] !== "npm run verify:v58.25.7.4") failures.push("verify:current must target verify:v58.25.7.4");
if ((pkg.scripts ?? {})["verify:v58.25.7.4"] !== "node scripts/verify-v58.25.7.4.mjs") failures.push("verify:v58.25.7.4 script missing");

requireFile("public/boards-home/diagrama_flujo.png");
requireFile("public/boards-home/diagrama_fujo.png");
requireFile("supabase/migrations/0055_v58_25_7_4_visual_board_safe_delete_rpc.sql");
requireFile("docs/release/V58_25_7_4_BOARDS_DELETE_RPC_ASSET_FALLBACK_FIX.md");
requireFile("docs/qa/FLOWTASK_V58_25_7_4_BOARDS_DELETE_RPC_ASSET_FALLBACK_FIX_QA.md");

requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedRelease);
requireIncludes("package-lock.json", expectedVersion);

requireIncludes("src/components/boards/boards-home.tsx", "/boards-home/diagrama_flujo.png");
requireNotIncludes("src/components/boards/boards-home.tsx", "/boards-home/diagrama_fujo.png");
requireIncludes("src/components/boards/boards-home.tsx", 'supabase.rpc("safe_delete_visual_board"');
requireNotIncludes("src/components/boards/boards-home.tsx", '.update({ deleted_at: timestamp, updated_at: timestamp }');

requireIncludes("supabase/migrations/0055_v58_25_7_4_visual_board_safe_delete_rpc.sql", "create or replace function public.safe_delete_visual_board");
requireIncludes("supabase/migrations/0055_v58_25_7_4_visual_board_safe_delete_rpc.sql", "grant execute on function public.safe_delete_visual_board(uuid) to authenticated");
requireIncludes("supabase/migrations/0055_v58_25_7_4_visual_board_safe_delete_rpc.sql", "drop policy if exists visual_boards_update_access");

if (failures.length) {
  console.error("[verify:v58.25.7.4] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[verify:v58.25.7.4] OK — boards delete RPC and asset fallback aligned.");
