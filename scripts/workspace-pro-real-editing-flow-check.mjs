import fs from "node:fs";

const failures = [];
const read = (file) => fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
const pkg = JSON.parse(read("package.json"));
const page = read("src/components/workspace-pro/workspace-pro-page.tsx");
const quickCreate = read("src/components/workspace-system/workspace-quick-create.tsx");
const css = read("src/app/globals.css");

const allowedVersions = [
  "58.27.9-workspace-pro-interaction-hardening-real-editing-flow",
  "58.28.0-workspace-pro-production-ux-final",
];
const allowedVerifyTargets = ["npm run verify:v58.27.9", "npm run verify:v58.28.0"];
if (!allowedVersions.includes(pkg.version)) failures.push(`Unexpected package version: ${pkg.version}`);
if (!allowedVerifyTargets.includes(pkg.scripts?.["verify:current"])) failures.push("verify:current must target verify:v58.27.9 or verify:v58.28.0");

const requiredPageMarkers = [
  "WorkspaceProListTaskEditor",
  "supabase.from(\"tasks\").update({ title: nextTitle, project_id: projectId || null })",
  "supabase.from(\"tasks\").delete()",
  "WorkspaceProBoardTaskEditor",
  "moveTask(task.id, next.id)",
  "taskCompletionPercent",
  "visibleColumns",
  "Mostrar concluidas",
  "Editar completa",
];
for (const marker of requiredPageMarkers) {
  if (!page.includes(marker)) failures.push(`workspace-pro-page.tsx missing marker: ${marker}`);
}

const requiredQuickCreateMarkers = [
  "type DraftMode = \"task\" | \"project\"",
  "task_checklist_items",
  "Tarea",
  "Proyecto",
  "Sin checklist: la tarea inicia en 0%",
];
for (const marker of requiredQuickCreateMarkers) {
  if (!quickCreate.includes(marker)) failures.push(`workspace-quick-create.tsx missing marker: ${marker}`);
}

if (!css.includes("v58.27.9 — Workspace Pro Interaction Hardening + Real Editing Flow")) failures.push("CSS marker missing");
if (!css.includes("ws-pro-danger-button")) failures.push("danger button CSS missing");

if (failures.length) {
  console.error("[workspace:real-editing:ready] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[workspace:real-editing:ready] OK — Workspace Pro real editing flow aligned.");
