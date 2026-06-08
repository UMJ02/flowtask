import { readFileSync, existsSync } from "node:fs";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const versionText = readFileSync("src/lib/release/version.ts", "utf8");
const detail = readFileSync("src/components/projects/project-detail-pro.tsx", "utf8");
const editor = readFileSync("src/components/projects/project-hero-inline-editor.tsx", "utf8");
const tasks = readFileSync("src/components/projects/project-inline-tasks.tsx", "utf8");
const failures = [];
const expectedVersion = "58.28.21.3-classic-reports-data-integrity-checklist-progress-export",
  "58.28.21.4-share-landing-short-link-stored-report-tokens",
  "58.28.21.5-radar-analytics-due-state-integrity",
  "58.28.21.6-data-integrity-live-sync-audit";

if (pkg.version !== expectedVersion) failures.push(`Unexpected package version: ${pkg.version}`);
if (pkg.scripts?.["verify:current"] !== "npm run verify:v58.28.21.3",
  "npm run verify:v58.28.21.4", "npm run verify:v58.28.21.5",
  "npm run verify:v58.28.21.6") failures.push("verify:current must target verify:v58.28.21.2");
if (!pkg.scripts?.["build:preflight"]?.includes("workspace:classic-project-ux:ready")) failures.push("build:preflight must include workspace:classic-project-ux:ready");
if (!versionText.includes(expectedVersion)) failures.push("version.ts must contain v58.28.21.1 slug");
if (!versionText.includes("APP_RELEASE_STAGE")) failures.push("version.ts must export APP_RELEASE_STAGE");
if (!editor.includes("Cambiar imagen") || !editor.includes("image_url") || !editor.includes("handleImageChange")) failures.push("inline project editor must expose image controls and persist image_url");
if (detail.includes("Acción rápida") || detail.includes("Crear tarea interna</h3>")) failures.push("project detail should not render the old quick action card");
if (!detail.includes("ProjectMembersCard") || !detail.includes("RecentFilesCard") || !detail.includes("ProjectWorkspaceLinks")) failures.push("project detail must keep members, files and workspace cards in the upper project surface");
if (!tasks.includes("Agregar tarea") || !tasks.includes("min-w-[140px]") || !tasks.includes("whitespace-nowrap")) failures.push("project inline task form must prevent the add button overflow");
if (!existsSync("docs/qa/FLOWTASK_V58_28_21_1_CLASSIC_PROJECT_DETAIL_UX_QA.md")) failures.push("missing QA doc for classic project detail UX polish");

if (failures.length) {
  console.error("[verify:v58.28.21.2] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("[verify:v58.28.21.2] OK — Classic project detail view/edit UX polish aligned.");
