#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const read = (rel) => fs.existsSync(path.join(root, rel)) ? fs.readFileSync(path.join(root, rel), "utf8") : "";
const exists = (rel) => fs.existsSync(path.join(root, rel));
const requireIncludes = (rel, text) => { if (!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); };

const pkg = JSON.parse(read("package.json"));
if (pkg.version !== "58.24.8.3-boards-home-style-polish") failures.push("package version must be v58.24.8.3 boards home style polish");
if ((pkg.scripts ?? {})["verify:current"] !== "npm run verify:v58.24.8.3") failures.push("verify:current must target verify:v58.24.8.3");
if ((pkg.scripts ?? {})["verify:v58.24.8.3"] !== "node scripts/verify-v58.24.8.3.mjs") failures.push("verify:v58.24.8.3 script must be available");
if (!exists("scripts/verify-v58.24.8.3.mjs")) failures.push("missing verify-v58.24.8.3 script");
requireIncludes("src/lib/release/version.ts", "58.24.8.3-boards-home-style-polish");
requireIncludes("src/lib/release/version.ts", "v58.24.8.3 Boards Home Style Polish");
requireIncludes("package-lock.json", "58.24.8.3-boards-home-style-polish");
requireIncludes("src/app/globals.css", "v58.24.8.3 — Boards Home Style Polish");
requireIncludes("src/app/globals.css", ".board-home-template-card");
requireIncludes("src/app/globals.css", ".board-home-recent-card");
requireIncludes("src/app/globals.css", ".board-home-primary-btn");
requireIncludes("src/app/globals.css", ".board-home-secondary-btn");
requireIncludes("src/app/globals.css", ".board-home-access-badge");
requireIncludes("src/components/boards/boards-home.tsx", "/boards-home/hero.png");
requireIncludes("docs/release/V58_24_8_3_BOARDS_HOME_STYLE_POLISH.md", "v58.24.8.3");
requireIncludes("docs/qa/FLOWTASK_V58_24_8_3_BOARDS_HOME_STYLE_POLISH_QA.md", "QA");
requireIncludes("README.md", "v58.24.8.3");
if (failures.length) {
  console.error("[verify:v58.24.8.3] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("[verify:v58.24.8.3] OK — Boards home style polish aligned.");
