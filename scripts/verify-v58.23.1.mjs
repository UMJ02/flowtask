#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const expectedVersion = "58.23.1-board-connectors-properties-panel";

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
if (pkg.scripts?.["verify:current"] !== "npm run verify:v58.23.1") failures.push("verify:current must target verify:v58.23.1");
if (pkg.scripts?.["verify:v58.23.1"] !== "node scripts/verify-v58.23.1.mjs") failures.push("verify:v58.23.1 script missing or incorrect");

for (const rel of [
  "src/components/boards/connector-layer.tsx",
  "src/components/boards/properties-panel.tsx",
  "src/components/boards/board-page.tsx",
  "src/components/boards/board-toolbox.tsx",
  "src/lib/boards/board-types.ts",
  "src/lib/boards/board-serialization.ts",
  "src/lib/boards/board-defaults.ts",
  "docs/release/V58_23_1_BOARD_CONNECTORS_PROPERTIES_PANEL.md",
  "docs/qa/FLOWTASK_V58_23_1_BOARD_CONNECTORS_QA.md",
  "docs/boards/FLOWTASK_BOARD_CONNECTORS_PROPERTIES_PANEL.md",
]) requireFile(rel);

for (const [rel, text] of [
  ["src/lib/release/version.ts", expectedVersion],
  ["src/lib/release/version.ts", "v58.23.1 Board Connectors + Properties Panel"],
  ["src/lib/boards/board-types.ts", "ConnectorElement"],
  ["src/lib/boards/board-types.ts", "\"connector\""],
  ["src/lib/boards/board-tools.ts", "GitBranch"],
  ["src/components/boards/connector-layer.tsx", "ConnectorLayer"],
  ["src/components/boards/connector-layer.tsx", "markerEnd"],
  ["src/components/boards/board-page.tsx", "pendingConnector"],
  ["src/components/boards/board-page.tsx", "createDefaultConnector"],
  ["src/components/boards/properties-panel.tsx", "lineType"],
  ["src/components/boards/properties-panel.tsx", "Flecha final"],
  ["src/lib/boards/board-serialization.ts", "fromElementId"],
  ["src/lib/boards/board-serialization.ts", "toElementId"],
  ["package-lock.json", expectedVersion],
]) requireIncludes(rel, text);

if (failures.length) {
  console.error("[verify:v58.23.1] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("[verify:v58.23.1] OK — Board connectors and properties panel aligned.");
