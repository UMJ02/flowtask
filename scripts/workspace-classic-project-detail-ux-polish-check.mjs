import fs from "node:fs";

const read = (file) => fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
const pkg = JSON.parse(read("package.json") || "{}");
const versionText = read("src/lib/release/version.ts");
const detail = read("src/components/projects/project-detail-pro.tsx");
const editor = read("src/components/projects/project-hero-inline-editor.tsx");
const tasks = read("src/components/projects/project-inline-tasks.tsx");
const failures = [];
const expectedVersion = "58.28.21.1-classic-project-detail-ux-polish";

if (pkg.version !== expectedVersion) failures.push(`Unexpected package version: ${pkg.version}`);
if (!versionText.includes(expectedVersion)) failures.push("release version not aligned");
if (!pkg.scripts?.["build:preflight"]?.includes("workspace:classic-project-ux:ready")) failures.push("build:preflight must include workspace:classic-project-ux:ready");
for (const marker of ["Cambiar imagen", "Quitar", "image_url", "projects/${organizationId ?? user.id}/${project.id}"]) {
  if (!editor.includes(marker)) failures.push(`inline editor missing marker: ${marker}`);
}
for (const marker of ["ft-project-editor-main-grid", "ft-project-editor-meta-grid", "Proyecto colaborativo"]) {
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
console.log("[workspace:classic-project-ux:ready] OK — classic project view/edit layout, image controls and task row UX aligned.");
