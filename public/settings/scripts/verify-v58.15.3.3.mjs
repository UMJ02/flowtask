import fs from "node:fs";

const required = [
  "src/app/(app)/app/tasks/[id]/page.tsx",
  "src/components/tasks/task-detail-summary.tsx",
  "src/components/tasks/task-checklist-card.tsx",
  "src/components/tasks/task-quick-comment-composer.tsx",
  "src/components/attachments/entity-attachments.tsx",
  "src/components/activity/activity-timeline.tsx",
  "src/lib/queries/activity.ts",
  "src/lib/queries/task-checklist.ts",
  "src/lib/release/version.ts",
];

const missing = required.filter((file) => !fs.existsSync(file));
if (missing.length) {
  console.error("[verify:v58.15.3.3] Missing files:", missing.join(", "));
  process.exit(1);
}

const taskDetail = fs.readFileSync("src/app/(app)/app/tasks/[id]/page.tsx", "utf8");
const hero = fs.readFileSync("src/components/tasks/task-detail-summary.tsx", "utf8");
const checklist = fs.readFileSync("src/components/tasks/task-checklist-card.tsx", "utf8");
const attachments = fs.readFileSync("src/components/attachments/entity-attachments.tsx", "utf8");
const activity = fs.readFileSync("src/lib/queries/activity.ts", "utf8");
const release = fs.readFileSync("src/lib/release/version.ts", "utf8");

const forbidden = ["assignee_id", "start_date", "is_done", "file_url"];
const forbiddenFound = forbidden.filter((field) => taskDetail.includes(field) || checklist.includes(field) || attachments.includes(field));

const checks = [
  ["release version aligned", release.includes("58.15.3.3-workspace-scope-catalog-fix")],
  ["task detail 70/30 grid", taskDetail.includes("70fr") && taskDetail.includes("30fr")],
  ["pastel app background", taskDetail.includes("#F6F8FC")],
  ["details card plain white", taskDetail.includes("border-[#E5EAF1] bg-white")],
  ["checklist count is real", taskDetail.includes("checklistDone") && taskDetail.includes("checklistTotal")],
  ["escalation card amber", taskDetail.includes("#FFF8E8") && taskDetail.includes("#B45309")],
  ["attachments card blue soft", taskDetail.includes("#EFF6FF")],
  ["activity card soft red", taskDetail.includes("#FFF7F7")],
  ["human activity labels", taskDetail.includes("Nuevo punto agregado al checklist") && taskDetail.includes("Archivo eliminado")],
  ["activity query includes task_id", activity.includes("task_id.eq")],
  ["hero premium actions", hero.includes("Volver al listado") && hero.includes("Editar tarea") && hero.includes("EntityMemoryActions")],
  ["no forbidden DB fields", forbiddenFound.length === 0],
];

const failed = checks.filter(([, ok]) => !ok);
if (failed.length) {
  console.error("[verify:v58.15.3.3] Failed checks:");
  for (const [label] of failed) console.error(`- ${label}`);
  if (forbiddenFound.length) console.error(`- Forbidden fields found: ${forbiddenFound.join(", ")}`);
  process.exit(1);
}

console.log("[verify:v58.15.3.3] OK — Workspace Scope Catalog Fix aligned with DB-safe fields.");
