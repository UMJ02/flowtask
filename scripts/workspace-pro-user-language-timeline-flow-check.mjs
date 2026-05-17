#!/usr/bin/env node
import fs from "node:fs";
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const failures = [];
if (pkg.version !== "58.28.3-workspace-pro-user-language-timeline-flow") failures.push(`Unexpected package version: ${pkg.version}`);
if (pkg.scripts?.["verify:current"] !== "npm run verify:v58.28.3") failures.push("verify:current must target verify:v58.28.3");
const page = fs.readFileSync("src/components/workspace-pro/workspace-pro-page.tsx", "utf8");
const spaces = fs.readFileSync("src/components/workspace-system/workspace-spaces-manager.tsx", "utf8");
const css = fs.readFileSync("src/app/globals.css", "utf8");
if (page.includes("Usá ⋯")) failures.push("Board cards must not include robotic helper text.");
if (page.includes("Arrastrá para actualizar estado")) failures.push("Board column helper text must be removed.");
if (page.includes("Production UX Final")) failures.push("Production QA banner must not be visible in Workspace Home.");
if (!page.includes("ws-pro-task-editor-inline-row")) failures.push("Task editor must use one inline action row.");
if (!page.includes("ws-pro-timeline-row")) failures.push("Timeline must use the improved timeline rows.");
if (spaces.includes("Diagnóstico técnico") || spaces.includes("Migration Guard")) failures.push("Spaces UI must not expose technical diagnostics.");
if (!css.includes("v58.28.3 — Workspace Pro User Language + Timeline Flow")) failures.push("Missing v58.28.3 CSS marker.");
if (failures.length) {
  console.error("[workspace:user-language:ready] FAIL");
  for (const item of failures) console.error(`- ${item}`);
  process.exit(1);
}
console.log("[workspace:user-language:ready] OK — user-facing copy, task editor and timeline flow aligned.");
