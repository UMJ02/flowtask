#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const expectedVersion = "58.23.0-boards-foundation-visual-canvas-mvp";

function exists(rel) { return fs.existsSync(path.join(root, rel)); }
function read(rel) { return fs.readFileSync(path.join(root, rel), "utf8"); }
function requireFile(rel) { if (!exists(rel)) failures.push(`Missing required file: ${rel}`); }
function requireIncludes(rel, text) {
  if (!exists(rel)) { failures.push(`Missing required file: ${rel}`); return; }
  if (!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`);
}

const pkg = JSON.parse(read("package.json"));
if (pkg.version !== expectedVersion) failures.push(`package version must be ${expectedVersion}`);
if (pkg.scripts?.["verify:current"] !== "npm run verify:v58.23.0") failures.push("verify:current must target verify:v58.23.0");
if (pkg.scripts?.["verify:v58.23.0"] !== "node scripts/verify-v58.23.0.mjs") failures.push("verify:v58.23.0 script missing or incorrect");

for (const rel of [
  "src/app/(app)/app/boards/page.tsx",
  "src/app/(app)/app/boards/[boardId]/page.tsx",
  "src/components/boards/boards-home.tsx",
  "src/components/boards/board-page.tsx",
  "src/components/boards/board-toolbox.tsx",
  "src/components/boards/board-element.tsx",
  "src/components/boards/board-topbar.tsx",
  "src/components/boards/floating-format-toolbar.tsx",
  "src/components/boards/properties-panel.tsx",
  "src/lib/boards/board-types.ts",
  "src/lib/boards/board-defaults.ts",
  "src/lib/boards/board-serialization.ts",
  "src/lib/boards/board-tools.ts",
  "supabase/migrations/0045_v58_23_0_visual_boards_foundation.sql",
  "docs/release/V58_23_0_BOARDS_FOUNDATION_VISUAL_CANVAS_MVP.md",
  "docs/qa/FLOWTASK_V58_23_0_BOARDS_QA.md",
  "docs/boards/FLOWTASK_BOARDS_FOUNDATION.md",
]) requireFile(rel);

for (const [rel, text] of [
  ["src/lib/release/version.ts", expectedVersion],
  ["src/lib/release/version.ts", "v58.23.0 Boards Foundation + Visual Canvas MVP"],
  ["src/components/layout/nav-links.ts", "'/app/boards'"],
  ["src/components/boards/boards-home.tsx", "visual_boards"],
  ["src/components/boards/board-page.tsx", "visual_board_elements"],
  ["src/components/boards/board-page.tsx", "serializeElementForUpsert"],
  ["src/components/boards/board-page.tsx", "setSavingState(\"saved\")"],
  ["src/components/boards/board-toolbox.tsx", "BOARD_TOOLS"],
  ["src/app/globals.css", ".board-canvas"],
  ["supabase/migrations/0045_v58_23_0_visual_boards_foundation.sql", "create table if not exists public.visual_boards"],
  ["supabase/migrations/0045_v58_23_0_visual_boards_foundation.sql", "enable row level security"],
  ["package-lock.json", expectedVersion],
]) requireIncludes(rel, text);

if (failures.length) {
  console.error("[verify:v58.23.0] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[verify:v58.23.0] OK — Boards Foundation + Visual Canvas MVP aligned.");
