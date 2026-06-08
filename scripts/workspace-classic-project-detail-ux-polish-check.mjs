import fs from "node:fs";

const read = (file) => fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
const pkg = JSON.parse(read("package.json") || "{}");
const versionText = read("src/lib/release/version.ts");
const detail = read("src/components/projects/project-detail-pro.tsx");
const editor = read("src/components/projects/project-hero-inline-editor.tsx");
const tasks = read("src/components/projects/project-inline-tasks.tsx");
const failures = [];
const expectedVersions = ["58.28.21.3-classic-reports-data-integrity-checklist-progress-export", "58.28.21.4-share-landing-short-link-stored-report-tokens",
  "58.28.21.5-radar-analytics-due-state-integrity",
  "58.28.21.6-data-integrity-live-sync-audit", "58.28.21.6-data-integrity-live-sync-audit"];

if (!expectedVersions.includes(pkg.version)) failures.push(`Unexpected package version: ${pkg.version}`);
if (!expectedVersions.some((version) => versionText.includes(version))) failures.push("release version not aligned");
if (!pkg.scripts?.["build:preflight"]?.includes("workspace:classic-project-ux:ready")) failures.push("build:preflight must include workspace:classic-project-ux:ready");
for (const marker of ["Cambiar imagen", "Quitar", "image_url", "projects/${organizationId ?? user.id}/${project.id}"]) {
  if (!editor.includes(marker)) failures.push(`inline editor missing marker: ${marker}`);
}
for (const marker of ["ft-project-edit-shell", "ft-project-edit-hero-grid", "ft-project-edit-meta-grid", "Proyecto colaborativo"]) {
  if (!editor.includes(marker)) failures.push(`inline editor layout missing marker: ${marker}`);
}
if (detail.includes("Acción rápida")) failures.push("old quick action copy should be removed from classic project detail");
if (!detail.includes("ft-project-detail-upper-grid")) failures.push("members/files/workspace upper distribution grid missing");
if (!tasks.includes("Agregar tarea") || !tasks.includes("ft-project-inline-create-grid")) failures.push("inline task create row must be responsive and prevent overflow");

if (failures.length) {
  console.error("[workspace:classic-project-ux:ready] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("[workspace:classic-project-ux:ready] OK — classic project edit form alignment, image controls and task row UX aligned.");
