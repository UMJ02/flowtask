import fs from "node:fs";

const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const version = fs.readFileSync("src/lib/release/version.ts", "utf8");
const taskTypes = fs.readFileSync("src/types/task.ts", "utf8");
const classicBoard = fs.readFileSync("src/components/tasks/task-kanban-board.tsx", "utf8");
const proPage = fs.readFileSync("src/components/workspace-pro/workspace-pro-page.tsx", "utf8");
const mutations = fs.readFileSync("src/lib/tasks/task-mutations.ts", "utf8");
const failures = [];

if (pkg.version !== "58.28.16-task-data-sync-status-source-of-truth",
  "58.28.16.1-task-data-sync-cli-hotfix",
  "58.28.16.2-classic-pro-status-parity",
  "58.28.17-classic-pro-unified-data-qa-final-user-flow",
  "58.28.17.1-unified-data-qa-inline-status-type-hotfix",
  "58.28.18.2-dependency-security-next-root-lockfile-guard") failures.push("Unexpected package version");
if (pkg.scripts?.["verify:current"] !== "npm run verify:v58.28.16", "npm run verify:v58.28.16.1", "npm run verify:v58.28.16.2", "npm run verify:v58.28.17",
  "npm run verify:v58.28.17.1",
  "npm run verify:v58.28.18.2") failures.push("verify:current must target verify:v58.28.16");
if (!version.includes("58.28.16-task-data-sync-status-source-of-truth",
  "58.28.16.1-task-data-sync-cli-hotfix",
  "58.28.16.2-classic-pro-status-parity",
  "58.28.17-classic-pro-unified-data-qa-final-user-flow",
  "58.28.17.1-unified-data-qa-inline-status-type-hotfix",
  "58.28.18.2-dependency-security-next-root-lockfile-guard")) failures.push("version.ts must contain v58.28.16 slug");
if (!pkg.scripts?.["workspace:task-sync:ready"]) failures.push("workspace:task-sync:ready script missing");
if (!pkg.scripts?.["build:preflight"]?.includes("workspace:task-sync:ready")) failures.push("build:preflight must include workspace:task-sync:ready");
for (const status of ["pendiente", "en_proceso", "produccion", "en_espera", "revision", "concluido"]) {
  if (!taskTypes.includes(status)) failures.push(`TaskStatus missing ${status}`);
  if (!classicBoard.includes(`value: "${status}"`)) failures.push(`Classic board column missing ${status}`);
}
if (classicBoard.includes("applyStatusOverrides") || classicBoard.includes("setStatusOverrides") || classicBoard.includes("writeStatusOverrides")) failures.push("Classic board still applies status overrides");
if (!classicBoard.includes("clearLegacyStatusOverrides")) failures.push("Classic board must clear legacy status override localStorage");
if (!classicBoard.includes("subscribeTaskUpdated")) failures.push("Classic board must listen to task sync events");
if (!proPage.includes("subscribeTaskUpdated")) failures.push("Workspace Pro board must listen to task sync events");
if (!proPage.includes("updateTaskStatusCore") || !proPage.includes("updateTaskPriorityCore")) failures.push("Workspace Pro board must use unified task mutations");
if (!mutations.includes("FLOWTASK_TASK_UPDATED_EVENT") || !mutations.includes("updateTaskStatusCore") || !mutations.includes("updateTaskCore")) failures.push("Unified task mutation helper is incomplete");

if (failures.length) {
  console.error("[verify:v58.28.16] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[verify:v58.28.16] OK — Task data sync and status source of truth aligned.");
