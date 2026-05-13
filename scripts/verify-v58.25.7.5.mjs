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

const expectedVersion = "58.25.7.5-boards-create-card-red-accent-color-cover-previews";
const expectedRelease = "v58.25.7.5 Boards Create Card Red Accent + Color Cover Previews";

const pkg = JSON.parse(read("package.json"));
if (pkg.version !== expectedVersion) failures.push("package version must be v58.25.7.5");
if ((pkg.scripts ?? {})["verify:current"] !== "npm run verify:v58.25.7.5") failures.push("verify:current must target verify:v58.25.7.5");
if ((pkg.scripts ?? {})["verify:v58.25.7.5"] !== "node scripts/verify-v58.25.7.5.mjs") failures.push("verify:v58.25.7.5 script missing");

requireFile("docs/release/V58_25_7_5_BOARDS_CREATE_CARD_RED_ACCENT_COLOR_COVER_PREVIEWS.md");
requireFile("docs/qa/FLOWTASK_V58_25_7_5_BOARDS_CREATE_CARD_RED_ACCENT_COLOR_COVER_PREVIEWS_QA.md");

requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedRelease);
requireIncludes("package-lock.json", expectedVersion);

requireIncludes("src/components/boards/boards-home.tsx", "const BOARD_COVER_COLORS");
requireIncludes("src/components/boards/boards-home.tsx", "function getBoardCoverColor");
requireIncludes("src/components/boards/boards-home.tsx", "board-home-color-cover");
requireIncludes("src/components/boards/boards-home.tsx", "board-home-create-card-red");
requireIncludes("src/components/boards/boards-home.tsx", "board-home-create-plus-red");
requireIncludes("src/components/boards/boards-home.tsx", 'supabase.rpc("safe_delete_visual_board"');

requireNotIncludes("src/components/boards/boards-home.tsx", 'const isNewBoard = board.title.trim().toLowerCase().includes("nueva pizarra");');
requireNotIncludes("src/components/boards/boards-home.tsx", 'fallbackSrc');

requireIncludes("src/app/globals.css", "v58.25.7.5 — Boards create red accent + color cover previews");
requireIncludes("src/app/globals.css", ".board-home-create-plus-red");
requireIncludes("src/app/globals.css", ".board-home-color-cover.is-mint");
requireIncludes("src/app/globals.css", ".board-home-color-cover-mark");

if (failures.length) {
  console.error("[verify:v58.25.7.5] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[verify:v58.25.7.5] OK — boards create red accent and color cover previews aligned.");
