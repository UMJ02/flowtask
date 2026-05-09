#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const expectedVersion = "58.23.2-board-tables-inline-editing";

function read(rel) {
  const full = path.join(root, rel);
  return fs.existsSync(full) ? fs.readFileSync(full, "utf8") : "";
}
function requireFile(rel) {
  if (!fs.existsSync(path.join(root, rel))) failures.push(`Missing required file: ${rel}`);
}
function requireIncludes(rel, text) {
  const content = read(rel);
  if (!content.includes(text)) failures.push(`Expected '${text}' in ${rel}`);
}

const pkg = JSON.parse(read("package.json"));
if (pkg.version !== expectedVersion) failures.push(`package.json version must be ${expectedVersion}`);
if (pkg.scripts?.["verify:current"] !== "npm run verify:v58.23.2") failures.push("verify:current must target verify:v58.23.2");
if (pkg.scripts?.["verify:v58.23.2"] !== "node scripts/verify-v58.23.2.mjs") failures.push("verify:v58.23.2 script missing or incorrect");

for (const rel of [
  "src/components/boards/board-element.tsx",
  "src/components/boards/properties-panel.tsx",
  "src/components/boards/floating-format-toolbar.tsx",
  "src/components/boards/board-page.tsx",
  "src/lib/boards/board-types.ts",
  "src/lib/boards/board-serialization.ts",
  "docs/release/V58_23_2_BOARD_TABLES_INLINE_EDITING.md",
  "docs/qa/FLOWTASK_V58_23_2_BOARD_TABLES_QA.md",
  "docs/boards/FLOWTASK_BOARD_TABLES_INLINE_EDITING.md",
]) requireFile(rel);

for (const [rel, text] of [
  ["src/lib/release/version.ts", expectedVersion],
  ["src/lib/release/version.ts", "v58.23.2 Board Tables + Inline Editing"],
  ["src/components/boards/board-element.tsx", "onUpdateTableCell"],
  ["src/components/boards/board-element.tsx", "Tabla editable"],
  ["src/components/boards/properties-panel.tsx", "Tabla visual"],
  ["src/components/boards/properties-panel.tsx", "onRenameTableColumn"],
  ["src/components/boards/properties-panel.tsx", "onRemoveTableColumn"],
  ["src/components/boards/floating-format-toolbar.tsx", "onAddTableRow"],
  ["src/components/boards/floating-format-toolbar.tsx", "onAddTableColumn"],
  ["src/components/boards/board-page.tsx", "updateTableCell"],
  ["src/components/boards/board-page.tsx", "addTableColumn"],
  ["src/components/boards/board-page.tsx", "removeTableColumn"],
  ["src/lib/boards/board-serialization.ts", "columns: element.columns"],
  ["package-lock.json", expectedVersion],
]) requireIncludes(rel, text);

if (failures.length) {
  console.error("[verify:v58.23.2] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("[verify:v58.23.2] OK — Board tables and inline editing aligned.");
