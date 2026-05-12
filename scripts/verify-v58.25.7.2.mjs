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

const expectedVersion = "58.25.7.2-boards-hero-cleanup-inspector-numeric-polish-minimal-board-previews";
const expectedRelease = "v58.25.7.2 Boards Hero Cleanup + Inspector Numeric Polish + Minimal Board Previews";

const pkg = JSON.parse(read("package.json"));
if (pkg.version !== expectedVersion) failures.push("package version must be v58.25.7.2");
if ((pkg.scripts ?? {})["verify:current"] !== "npm run verify:v58.25.7.2") failures.push("verify:current must target verify:v58.25.7.2");
if ((pkg.scripts ?? {})["verify:v58.25.7.2"] !== "node scripts/verify-v58.25.7.2.mjs") failures.push("verify:v58.25.7.2 script missing");

requireFile("docs/release/V58_25_7_2_BOARDS_HERO_CLEANUP_INSPECTOR_NUMERIC_POLISH_MINIMAL_BOARD_PREVIEWS.md");
requireFile("docs/qa/FLOWTASK_V58_25_7_2_BOARDS_HERO_CLEANUP_INSPECTOR_NUMERIC_POLISH_MINIMAL_BOARD_PREVIEWS_QA.md");

requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedRelease);

requireIncludes("src/components/boards/boards-home.tsx", "function MinimalBoardPreview");
requireIncludes("src/components/boards/boards-home.tsx", "board-home-hero-minimal");
requireIncludes("src/components/boards/boards-home.tsx", "board-minimal-preview");
requireNotIncludes("src/components/boards/boards-home.tsx", "next/image");
requireNotIncludes("src/components/boards/boards-home.tsx", "<Image");
requireNotIncludes("src/components/boards/boards-home.tsx", "/boards-home/hero.png");

requireIncludes("src/components/boards/properties-panel.tsx", "board-inspector-metric");
requireIncludes("src/components/boards/properties-panel.tsx", "board-inspector-metric-input");
requireIncludes("src/app/globals.css", "v58.25.7.2 — Boards Hero Cleanup + Inspector Numeric Polish + Minimal Board Previews");
requireIncludes("src/app/globals.css", ".board-home-hero-minimal");
requireIncludes("src/app/globals.css", ".board-minimal-preview");
requireIncludes("src/app/globals.css", ".board-inspector-metric-input");
requireIncludes("src/app/globals.css", "text-align: center");

if (failures.length) {
  console.error("[verify:v58.25.7.2] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[verify:v58.25.7.2] OK — Boards hero cleanup, numeric polish and minimal previews aligned.");
