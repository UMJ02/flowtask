import fs from "node:fs";

const failures = [];
const read = (file) => fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
const pkg = JSON.parse(read("package.json"));
const page = read("src/components/workspace-pro/workspace-pro-page.tsx");
const spaces = read("src/components/workspace-system/workspace-spaces-manager.tsx");
const css = read("src/app/globals.css");

if (pkg.version !== "58.28.2-workspace-pro-action-model-progressive-disclosure") failures.push(`Unexpected package version: ${pkg.version}`);
if (pkg.scripts?.["verify:current"] !== "npm run verify:v58.28.2") failures.push("verify:current must target verify:v58.28.2");
if (!String(pkg.scripts?.["build:preflight"] ?? "").includes("workspace:action-model:ready")) failures.push("build:preflight must include workspace:action-model:ready");

const pageMarkers = [
  "ws-pro-action-menu",
  "ws-pro-action-menu-item",
  "TASK_PRIORITY_ACTIONS",
  "updateTaskPriority",
  "Vista limpia",
  "Gestionar",
];
for (const marker of pageMarkers) if (!page.includes(marker)) failures.push(`workspace-pro-page.tsx missing marker: ${marker}`);

if (page.includes("Mover a Pendiente") || page.includes("Mover a En curso") || page.includes("Mover a En espera")) failures.push("Board cards must not expose repeated visible move chips");
if (page.includes("ws-pro-board-status-chip")) failures.push("Board cards must use menu disclosure instead of status chips");

const spaceMarkers = [
  "Workspace Spaces Progressive Disclosure",
  "Organización del workspace",
  "Cómo usar espacios",
  "Diagnóstico técnico",
  "Asignar proyecto",
];
for (const marker of spaceMarkers) if (!spaces.includes(marker)) failures.push(`workspace-spaces-manager.tsx missing marker: ${marker}`);

const cssMarkers = [
  "v58.28.2 — Workspace Pro Action Model + Progressive Disclosure",
  "ws-pro-action-menu",
  "ws-pro-action-menu-item",
  "ws-pro-table-action",
  "ft-ws-spaces-help-card",
];
for (const marker of cssMarkers) if (!css.includes(marker)) failures.push(`globals.css missing marker: ${marker}`);

if (failures.length) {
  console.error("[workspace:action-model:ready] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[workspace:action-model:ready] OK — Workspace Pro action model and progressive disclosure aligned.");
