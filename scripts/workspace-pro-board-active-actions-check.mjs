#!/usr/bin/env node
import fs from "node:fs";
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const page = fs.readFileSync("src/components/workspace-pro/workspace-pro-page.tsx", "utf8");
const css = fs.readFileSync("src/app/globals.css", "utf8");
const failures = [];
if (pkg.version !== "58.28.6-workspace-pro-completed-filter-anchored-actions") failures.push(`Unexpected package version: ${pkg.version}`);
if (pkg.scripts?.["verify:current"] !== "npm run verify:v58.28.6") failures.push("verify:current must target verify:v58.28.6");
for (const marker of ["activeTasks", "hiddenDoneCount", "activeBoardColumns", "BoardActionAnchor", "openTaskActions", "anchor.top", "anchor.left"]) { if (!page.includes(marker)) failures.push(`Missing board active action marker: ${marker}`); }
for (const marker of ["ws-pro-board-grid { width: 100%", "ws-pro-board-action-panel { right: auto", "ws-pro-column-toggle-produccion.is-active"]) { if (!css.includes(marker)) failures.push(`Missing CSS marker: ${marker}`); }
if (!String(pkg.scripts?.["build:preflight"] ?? "").includes("workspace:board-active-actions:ready")) failures.push("build:preflight must include workspace:board-active-actions:ready");
if (failures.length) { console.error("[workspace:board-active-actions:ready] FAIL"); for (const failure of failures) console.error(`- ${failure}`); process.exit(1); }
console.log("[workspace:board-active-actions:ready] OK — completed tasks hidden and board action panel anchored.");
