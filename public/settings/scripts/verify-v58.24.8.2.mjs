#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const read = (rel) => fs.existsSync(path.join(root, rel)) ? fs.readFileSync(path.join(root, rel), "utf8") : "";
const exists = (rel) => fs.existsSync(path.join(root, rel));
const requireIncludes = (rel, text) => { if (!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); };

const pkg = JSON.parse(read("package.json"));
if (pkg.version !== "58.24.8.2-boards-hero-toolbar-size-polish") failures.push("package version must be v58.24.8.2 hero toolbar size polish");
if ((pkg.scripts ?? {})["verify:current"] !== "npm run verify:v58.24.8.2") failures.push("verify:current must target verify:v58.24.8.2");
if ((pkg.scripts ?? {})["verify:v58.24.8.2"] !== "node scripts/verify-v58.24.8.2.mjs") failures.push("verify:v58.24.8.2 script must be available");
if (!exists("scripts/verify-v58.24.8.2.mjs")) failures.push("missing verify-v58.24.8.2 script");

requireIncludes("src/lib/release/version.ts", "58.24.8.2-boards-hero-toolbar-size-polish");
requireIncludes("src/lib/release/version.ts", "v58.24.8.2 Boards Hero Toolbar Size Polish");
requireIncludes("package-lock.json", "58.24.8.2-boards-hero-toolbar-size-polish");
requireIncludes("src/app/globals.css", "v58.24.8.2 — Boards Hero Toolbar Size Polish");
requireIncludes("src/app/globals.css", "grid-template-columns: 64px minmax(0, 1fr);");
requireIncludes("src/app/globals.css", "width: 40px;");
requireIncludes("src/app/globals.css", "height: 38px;");
requireIncludes("src/app/globals.css", "width: 34px;");
requireIncludes("src/app/globals.css", "height: 32px;");
requireIncludes("src/components/boards/boards-home.tsx", "board-home-hero-tool-image");
requireIncludes("docs/release/V58_24_8_2_BOARDS_HERO_TOOLBAR_SIZE_POLISH.md", "v58.24.8.2");
requireIncludes("docs/qa/FLOWTASK_V58_24_8_2_BOARDS_HERO_TOOLBAR_SIZE_POLISH_QA.md", "QA");
requireIncludes("README.md", "v58.24.8.2");

if (failures.length) {
  console.error("[verify:v58.24.8.2] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("[verify:v58.24.8.2] OK — Boards hero toolbar size polish aligned.");
