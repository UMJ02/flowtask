#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const expectedVersion = "58.25.9.8-workspace-navigation-search-command-center";
const expectedRelease = "v58.25.9.8 Workspace Navigation + Search Command Center";
const exists = (rel) => fs.existsSync(path.join(root, rel));
const read = (rel) => exists(rel) ? fs.readFileSync(path.join(root, rel), "utf8") : "";
const requireFile = (rel) => { if (!exists(rel)) failures.push(`Missing required file: ${rel}`); };
const requireIncludes = (rel, text) => { if (!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); };

const pkg = JSON.parse(read("package.json"));
if (pkg.version !== expectedVersion) failures.push(`package version must be ${expectedVersion}`);
if ((pkg.scripts ?? {})["verify:current"] !== "npm run verify:v58.25.9.8") failures.push("verify:current must target verify:v58.25.9.8");
if ((pkg.scripts ?? {})["verify:v58.25.9.8"] !== "node scripts/verify-v58.25.9.8.mjs") failures.push("verify:v58.25.9.8 script missing");

requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedRelease);
requireIncludes("package-lock.json", expectedVersion);
requireFile("src/components/workspace-system/workspace-command-center.tsx");
requireIncludes("src/components/workspace-system/workspace-command-center.tsx", "WorkspaceCommandCenter");
requireIncludes("src/components/workspace-system/workspace-command-center.tsx", "Buscar tareas, proyectos, espacios, vistas, pizarras o acciones");
requireIncludes("src/components/workspace-system/workspace-command-center.tsx", "⌘K");
requireIncludes("src/components/workspace-system/workspace-system-page.tsx", "WorkspaceCommandCenter");
requireIncludes("src/components/workspace-system/workspace-system-page.tsx", "setCommandCenterOpen");
requireIncludes("src/components/workspace-system/workspace-context-header.tsx", "onOpenCommandCenter");
requireIncludes("src/app/globals.css", "v58.25.9.8 — Workspace Navigation + Search Command Center");
requireIncludes("src/app/globals.css", "ft-ws-command-trigger");
requireIncludes("src/app/globals.css", "ft-ws-command-palette");
requireIncludes("src/app/globals.css", "ft-ws-command-item");
requireFile("docs/release/V58_25_9_8_WORKSPACE_NAVIGATION_SEARCH_COMMAND_CENTER.md");
requireFile("docs/qa/FLOWTASK_V58_25_9_8_WORKSPACE_NAVIGATION_SEARCH_COMMAND_CENTER_QA.md");

if (failures.length) {
  console.error("[verify:v58.25.9.8] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[verify:v58.25.9.8] OK — Workspace Navigation + Search Command Center aligned.");
