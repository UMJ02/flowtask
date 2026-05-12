#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const exists = (rel) => fs.existsSync(path.join(root, rel));
const read = (rel) => exists(rel) ? fs.readFileSync(path.join(root, rel), "utf8") : "";
const requireFile = (rel) => { if (!exists(rel)) failures.push(`Missing required file: ${rel}`); };
const requireIncludes = (rel, text) => { if (!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); };

const expectedVersion = "58.25.6.6-boards-floating-layout-properties-redesign";
const expectedRelease = "v58.25.6.6 Boards Floating Layout + Properties Panel Redesign";

const pkg = JSON.parse(read("package.json"));
if (pkg.version !== expectedVersion) failures.push("package version must be v58.25.6.6");
if ((pkg.scripts ?? {})["verify:current"] !== "npm run verify:v58.25.6.6") failures.push("verify:current must target verify:v58.25.6.6");
if ((pkg.scripts ?? {})["verify:v58.25.6.6"] !== "node scripts/verify-v58.25.6.6.mjs") failures.push("verify:v58.25.6.6 script missing");

requireFile("src/components/boards/board-minimap.tsx");
requireFile("src/components/boards/floating-format-toolbar.tsx");
requireFile("src/components/boards/properties-panel.tsx");
requireFile("src/components/boards/board-page.tsx");
requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedRelease);
requireIncludes("src/components/boards/board-minimap.tsx", "onHiddenChange");
requireIncludes("src/components/boards/floating-format-toolbar.tsx", "rightOffset");
requireIncludes("src/components/boards/properties-panel.tsx", "collapsed");
requireIncludes("src/components/boards/board-page.tsx", "const [propertiesCollapsed, setPropertiesCollapsed] = useState(false);");
requireIncludes("src/components/boards/board-page.tsx", "const [minimapHidden, setMinimapHidden] = useState(false);");

if (failures.length) {
  console.error("[verify:v58.25.6.6] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[verify:v58.25.6.6] OK — Boards floating layout + properties redesign aligned.");
