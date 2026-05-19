import { readFileSync, existsSync } from "node:fs";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const versionText = readFileSync("src/lib/release/version.ts", "utf8");
const analytics = readFileSync("src/lib/queries/analytics.ts", "utf8");
const share = readFileSync("src/lib/share/analytics-share.ts", "utf8");
const landing = readFileSync("src/components/shared/shared-analytics-landing.tsx", "utf8");
const failures = [];
const expectedVersion = "58.28.21.3-classic-reports-data-integrity-checklist-progress-export";

if (pkg.version !== expectedVersion) failures.push(`Unexpected package version: ${pkg.version}`);
if (pkg.scripts?.["verify:current"] !== "npm run verify:v58.28.21.3") failures.push("verify:current must target verify:v58.28.21.3");
if (!pkg.scripts?.["build:preflight"]?.includes("workspace:reports-data-integrity:ready")) failures.push("build:preflight must include workspace:reports-data-integrity:ready");
if (!versionText.includes(expectedVersion)) failures.push("version.ts must contain v58.28.21.3 slug");
if (!versionText.includes("APP_RELEASE_STAGE")) failures.push("version.ts must export APP_RELEASE_STAGE");
for (const marker of ["getLatestCommentsByTaskIds", "getChecklistProgressByTaskIds", "progressPercent", "checklistDone", "checklistTotal", "averageTaskProgress", "tasksWithChecklist"]) {
  if (!analytics.includes(marker)) failures.push(`analytics missing marker: ${marker}`);
}
for (const marker of ["Avance %", "Checklist", "Último comentario", "checklistLabel"]) {
  if (!share.includes(marker)) failures.push(`Excel/export missing marker: ${marker}`);
}
for (const marker of ["ProgressPill", "Avance", "Checklist", "Pendiente", "En curso", "Producción", "Revisión"]) {
  if (!landing.includes(marker)) failures.push(`public landing missing marker: ${marker}`);
}
if (!existsSync("docs/qa/FLOWTASK_V58_28_21_3_CLASSIC_REPORTS_DATA_INTEGRITY_QA.md")) failures.push("missing QA doc for reports data integrity");

if (failures.length) {
  console.error("[verify:v58.28.21.3] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("[verify:v58.28.21.3] OK — Classic reports data integrity and checklist progress export aligned.");
