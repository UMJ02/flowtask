#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const exists = (rel) => fs.existsSync(path.join(root, rel));
const read = (rel) => exists(rel) ? fs.readFileSync(path.join(root, rel), "utf8") : "";
const requireFile = (rel) => { if (!exists(rel)) failures.push(`Missing required file: ${rel}`); };
const requireIncludes = (rel, text) => { if (!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); };

const expectedVersion = "58.25.6.6.2-boards-compact-inspector-table-controls-polish";
const expectedRelease = "v58.25.6.6.2 Boards Compact Inspector + Table Controls Polish";

const pkg = JSON.parse(read("package.json"));
if (pkg.version !== expectedVersion) failures.push("package version must be v58.25.6.6.2");
if ((pkg.scripts ?? {})["verify:current"] !== "npm run verify:v58.25.6.6.2") failures.push("verify:current must target verify:v58.25.6.6.2");
if ((pkg.scripts ?? {})["verify:v58.25.6.6.2"] !== "node scripts/verify-v58.25.6.6.2.mjs") failures.push("verify:v58.25.6.6.2 script missing");

requireFile("docs/release/V58_25_6_6_2_BOARDS_COMPACT_INSPECTOR_TABLE_CONTROLS_POLISH.md");
requireFile("docs/qa/FLOWTASK_V58_25_6_6_2_BOARDS_COMPACT_INSPECTOR_TABLE_CONTROLS_POLISH_QA.md");

requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedRelease);
requireIncludes("src/components/boards/properties-panel.tsx", "grid grid-cols-[34px_minmax(42px,1fr)_34px]");
requireIncludes("src/components/boards/properties-panel.tsx", "<Plus className=");
requireIncludes("src/components/boards/properties-panel.tsx", "w-[404px]");
requireIncludes("src/components/boards/floating-format-toolbar.tsx", "rounded-[20px] px-3 py-2");
requireIncludes("src/components/boards/board-minimap.tsx", "w-[184px]");
requireIncludes("src/app/globals.css", "v58.25.6.6.2 — Boards compact inspector + table controls polish");

if (failures.length) {
  console.error("[verify:v58.25.6.6.2] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[verify:v58.25.6.6.2] OK — Boards compact inspector + table controls polish aligned.");
