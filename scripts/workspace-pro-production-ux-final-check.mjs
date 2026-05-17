import fs from "node:fs";

const failures = [];
const read = (file) => fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
const pkg = JSON.parse(read("package.json"));
const page = read("src/components/workspace-pro/workspace-pro-page.tsx");
const css = read("src/app/globals.css");
const allowedVersions = ["58.28.0-workspace-pro-production-ux-final", "58.28.1-workspace-pro-user-final-ui-fixes",
  "58.28.2-workspace-pro-action-model-progressive-disclosure"];

if (!allowedVersions.includes(pkg.version)) failures.push(`Unexpected package version: ${pkg.version}`);
if (!["npm run verify:v58.28.0", "npm run verify:v58.28.1", "npm run verify:v58.28.2"].includes(pkg.scripts?.["verify:current"])) failures.push("verify:current must target the active v58.28.x verify script");
if (!String(pkg.scripts?.["build:preflight"] ?? "").includes("workspace:production-ux:ready")) failures.push("build:preflight must include workspace:production-ux:ready");

const markers = [
  "WorkspaceProProductionUXStrip",
  "Production UX Final",
  "actionLabel=\"Volver al Home\"",
  "actionLabel=\"Ir al Home\"",
  "actionLabel=\"Abrir Lista\"",
  "actionLabel=\"Editar tareas\"",
  "Navegación, estados vacíos, edición rápida",
];
for (const marker of markers) {
  if (!page.includes(marker)) failures.push(`workspace-pro-page.tsx missing marker: ${marker}`);
}
for (const marker of ["v58.28.0 — Workspace Pro Production UX Final", "ws-pro-production-ux-strip", ":focus-visible", "scroll-padding"]) {
  if (!css.includes(marker)) failures.push(`globals.css missing marker: ${marker}`);
}

if (failures.length) {
  console.error("[workspace:production-ux:ready] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[workspace:production-ux:ready] OK — Workspace Pro production UX final aligned.");
