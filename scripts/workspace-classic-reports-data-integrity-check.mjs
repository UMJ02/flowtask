import fs from "node:fs";

const read = (file) => fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
const pkg = JSON.parse(read("package.json") || "{}");
const analytics = read("src/lib/queries/analytics.ts");
const share = read("src/lib/share/analytics-share.ts");
const landing = read("src/components/shared/shared-analytics-landing.tsx");
const failures = [];

if (!["58.28.21.3-classic-reports-data-integrity-checklist-progress-export", "58.28.21.4-share-landing-short-link-stored-report-tokens",
  "58.28.21.5-radar-analytics-due-state-integrity",
  "58.28.21.6-data-integrity-live-sync-audit", "58.28.21.6-data-integrity-live-sync-audit"].includes(pkg.version)) failures.push("unexpected package version");
if (!pkg.scripts?.["build:preflight"]?.includes("workspace:reports-data-integrity:ready")) failures.push("preflight must run reports data integrity check");
for (const marker of ["getLatestCommentsByTaskIds", "getChecklistProgressByTaskIds", "latestCommentsByTaskId", "checklistProgressByTaskId", "reportItemForTask"]) {
  if (!analytics.includes(marker)) failures.push(`analytics must enrich reports with ${marker}`);
}
for (const marker of ["progressPercent", "checklistDone", "checklistTotal", "averageTaskProgress", "tasksWithChecklist"]) {
  if (!analytics.includes(marker)) failures.push(`analytics missing progress field ${marker}`);
}
for (const label of ["Pendiente", "En curso", "Producción", "En espera", "Revisión", "Concluido"]) {
  if (!analytics.includes(label) && !landing.includes(label)) failures.push(`final status label missing: ${label}`);
}
if (!share.includes("Avance %") || !share.includes("Checklist") || !share.includes("Último comentario")) failures.push("Excel export must include progress, checklist and last comment columns");
if (!landing.includes("ProgressPill") || !landing.includes("checklistTotal") || !landing.includes("último comentario real")) failures.push("shared landing must show progress/checklist and explain real latest comment");
if (analytics.includes("await getTaskComments(task.id)")) failures.push("analytics must not fetch comments one task at a time");

if (failures.length) {
  console.error("[workspace:reports-data-integrity:ready] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("[workspace:reports-data-integrity:ready] OK — classic analytics, landing and Excel use enriched comments and checklist progress.");
