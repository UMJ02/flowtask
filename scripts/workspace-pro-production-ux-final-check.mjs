import fs from "node:fs";

const failures = [];
const read = (file) => fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
const pkg = JSON.parse(read("package.json"));
const page = read("src/components/workspace-pro/workspace-pro-page.tsx");
const css = read("src/app/globals.css");
const version = "58.28.0-workspace-pro-production-ux-final";

if (pkg.version !== version) failures.push(`Unexpected package version: ${pkg.version}`);
if (pkg.scripts?.["verify:current"] !== "npm run verify:v58.28.0") failures.push("verify:current must target verify:v58.28.0");
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
