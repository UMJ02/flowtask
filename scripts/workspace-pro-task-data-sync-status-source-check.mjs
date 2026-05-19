import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const files = {
  taskTypes: "src/types/task.ts",
  mutations: "src/lib/tasks/task-mutations.ts",
  classicBoard: "src/components/tasks/task-kanban-board.tsx",
  proPage: "src/components/workspace-pro/workspace-pro-page.tsx",
  taskForm: "src/components/tasks/task-form.tsx",
  statusForm: "src/components/tasks/task-status-form.tsx",
  inlineActions: "src/components/tasks/task-inline-actions.tsx",
};
const source = Object.fromEntries(Object.entries(files).map(([key, file]) => [key, fs.readFileSync(path.join(root, file), "utf8")]));
const failures = [];
const statuses = ["pendiente", "en_proceso", "produccion", "en_espera", "revision", "concluido"];

if (!["58.28.16.1-task-data-sync-cli-hotfix", "58.28.16.2-classic-pro-status-parity",
  "58.28.17-classic-pro-unified-data-qa-final-user-flow",
  "58.28.17.1-unified-data-qa-inline-status-type-hotfix",
  "58.28.19-ux-copy-empty-states-final", "58.28.20-mobile-responsive-final-pass", "58.28.21-supabase-rls-client-readiness-final",
  "58.28.21.2-classic-project-edit-form-alignment"].includes(pkg.version)) failures.push("package version is not an allowed v58.28.x task sync release");
if (!["npm run verify:v58.28.16.1", "npm run verify:v58.28.16.2", "npm run verify:v58.28.17", "npm run verify:v58.28.17.1",
  "npm run verify:v58.28.19", "npm run verify:v58.28.20", "npm run verify:v58.28.21",
  "npm run verify:v58.28.21.2", "npm run verify:v58.28.21",
  "npm run verify:v58.28.21.2"].includes(pkg.scripts?.["verify:current"])) failures.push("verify:current is not an allowed v58.28.x task sync target");
for (const status of statuses) {
  if (!source.taskTypes.includes(status)) failures.push(`src/types/task.ts does not allow ${status}`);
  if (!source.classicBoard.includes(`value: "${status}"`)) failures.push(`classic kanban does not expose ${status}`);
}
const forbiddenClassic = ["applyStatusOverrides", "setStatusOverrides", "readStatusOverrides", "writeStatusOverrides", "mergedStatusOverrides"];
for (const token of forbiddenClassic) {
  if (source.classicBoard.includes(token)) failures.push(`classic kanban still contains ${token}`);
}
if (!source.classicBoard.includes("kanbanOrderOverrides")) failures.push("classic kanban should keep only order overrides");
if (!source.classicBoard.includes("clearLegacyStatusOverrides")) failures.push("legacy status overrides are not cleared");
if (!source.mutations.includes("flowtask:task-updated")) failures.push("task updated event is missing");
for (const file of ["classicBoard", "proPage"]) {
  if (!source[file].includes("subscribeTaskUpdated")) failures.push(`${files[file]} is not subscribed to task updates`);
}
for (const file of ["taskForm", "statusForm"]) {
  if (!source[file].includes("emitTaskUpdated")) failures.push(`${files[file]} does not emit task updates`);
}
if (!source.inlineActions.includes("updateTaskStatusCore")) failures.push("task inline actions do not use unified status mutation");
if (!source.proPage.includes("updateTaskStatusCore") || !source.proPage.includes("updateTaskPriorityCore")) failures.push("Workspace Pro does not use unified mutations");
if (!fs.readFileSync(path.join(root, "src/components/workspace/workspace-home.tsx"), "utf8").includes("value: 'revision'")) failures.push("classic workspace board does not expose revision column");
if (!fs.readFileSync(path.join(root, "src/components/workspace/workspace-home.tsx"), "utf8").includes("value: 'pendiente'")) failures.push("classic workspace board does not expose pendiente column");
if (!source.classicBoard.includes('label: "En curso"')) failures.push("classic kanban should label en_proceso as En curso");


if (failures.length) {
  console.error("[workspace:task-sync:ready] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("[workspace:task-sync:ready] OK — tasks status, priority and dates share a single sync surface between Classic and Pro.");
