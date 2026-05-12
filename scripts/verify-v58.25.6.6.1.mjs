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

const expectedVersion = "58.25.6.6.1-boards-properties-locked-typecheck-fix";
const expectedRelease = "v58.25.6.6.1 Boards Properties Locked Typecheck Fix";

const pkg = JSON.parse(read("package.json"));
if (pkg.version !== expectedVersion) failures.push("package version must be v58.25.6.6.1");
if ((pkg.scripts ?? {})["verify:current"] !== "npm run verify:v58.25.6.6.1") failures.push("verify:current must target verify:v58.25.6.6.1");
if ((pkg.scripts ?? {})["verify:v58.25.6.6.1"] !== "node scripts/verify-v58.25.6.6.1.mjs") failures.push("verify:v58.25.6.6.1 script missing");

requireFile("docs/release/V58_25_6_6_1_BOARDS_PROPERTIES_LOCKED_TYPECHECK_FIX.md");
requireFile("docs/qa/FLOWTASK_V58_25_6_6_1_BOARDS_PROPERTIES_LOCKED_TYPECHECK_FIX_QA.md");

requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedRelease);
requireIncludes("src/components/boards/properties-panel.tsx", "checked={Boolean(selected.locked)}");
requireNotIncludes("src/components/boards/properties-panel.tsx", "checked={selected.locked}");

if (failures.length) {
  console.error("[verify:v58.25.6.6.1] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[verify:v58.25.6.6.1] OK — Boards properties locked typecheck fix aligned.");
