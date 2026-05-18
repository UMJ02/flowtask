import fs from "node:fs";

const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const version = fs.readFileSync("src/lib/release/version.ts", "utf8");
const statusConstants = fs.readFileSync("src/lib/constants/task-status.ts", "utf8");
const workspaceHome = fs.readFileSync("src/components/workspace/workspace-home.tsx", "utf8");
const classicBoard = fs.readFileSync("src/components/tasks/task-kanban-board.tsx", "utf8");
const taskWorkspace = fs.readFileSync("src/components/tasks/task-workspace-inline.tsx", "utf8");
const failures = [];
const slug = "58.28.16.2-classic-pro-status-parity";
const statuses = ["pendiente", "en_proceso", "produccion", "en_espera", "revision", "concluido"];

if (pkg.version !== slug) failures.push("Unexpected package version");
if (pkg.scripts?.["verify:current"] !== "npm run verify:v58.28.16.2") failures.push("verify:current must target verify:v58.28.16.2");
if (!version.includes(slug)) failures.push("version.ts must contain v58.28.16.2 slug");
for (const status of statuses) {
  if (!statusConstants.includes(status)) failures.push(`TASK_STATUSES missing ${status}`);
  if (!workspaceHome.includes(`value: '${status}'`)) failures.push(`Workspace classic home columns missing ${status}`);
  if (!classicBoard.includes(`value: "${status}"`)) failures.push(`Classic kanban board missing ${status}`);
  if (!taskWorkspace.includes(`"${status}"`)) failures.push(`Task workspace inline editor missing ${status}`);
}
if (!statusConstants.includes('label: "En curso"')) failures.push('Classic constants must label en_proceso as En curso');
if (!classicBoard.includes('label: "En curso"')) failures.push('Classic kanban must label en_proceso as En curso');
if (!workspaceHome.includes("label: 'En curso'")) failures.push('Workspace home classic board must label en_proceso as En curso');
if (workspaceHome.includes("En progreso")) failures.push('Workspace home still exposes En progreso');
if (taskWorkspace.includes('En proceso')) failures.push('Task workspace inline still exposes En proceso');

if (failures.length) {
  console.error("[verify:v58.28.16.2] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("[verify:v58.28.16.2] OK — Classic and Pro status labels/columns aligned.");
