import fs from "node:fs";

const failures = [];
const read = (file) => fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
const pkg = JSON.parse(read("package.json"));

const version = "58.27.9-workspace-pro-interaction-hardening-real-editing-flow";
const verifyTarget = "npm run verify:v58.27.9";

if (pkg.version !== version) failures.push(`Unexpected package version: ${pkg.version}`);
if (pkg.scripts?.["verify:current"] !== verifyTarget) failures.push("verify:current must target verify:v58.27.9");
if (!pkg.scripts?.["workspace:real-editing:ready"]) failures.push("workspace:real-editing:ready script missing");
if (!String(pkg.scripts?.["build:preflight"] ?? "").includes("workspace:real-editing:ready")) failures.push("build:preflight must include workspace:real-editing:ready");

const checks = [
  ["src/lib/release/version.ts", version],
  ["src/lib/release/version.ts", "v58.27.9 Workspace Pro Interaction Hardening + Real Editing Flow"],
  ["src/components/workspace-pro/workspace-pro-page.tsx", "v58.27.9 — Workspace Pro Interaction Hardening + Real Editing Flow"],
  ["src/components/workspace-pro/workspace-pro-page.tsx", "WorkspaceProListTaskEditor"],
  ["src/components/workspace-pro/workspace-pro-page.tsx", "taskCompletionPercent"],
  ["src/components/workspace-pro/workspace-pro-page.tsx", "ws-pro-danger-button"],
  ["src/components/workspace-system/workspace-quick-create.tsx", "Tarea"],
  ["src/components/workspace-system/workspace-quick-create.tsx", "Proyecto"],
  ["src/components/workspace-system/workspace-quick-create.tsx", "task_checklist_items"],
  ["src/app/globals.css", "v58.27.9 — Workspace Pro Interaction Hardening + Real Editing Flow"],
  ["docs/release/V58_27_9_WORKSPACE_PRO_INTERACTION_HARDENING_REAL_EDITING_FLOW.md", "v58.27.9"],
  ["docs/qa/FLOWTASK_V58_27_9_WORKSPACE_PRO_INTERACTION_HARDENING_REAL_EDITING_FLOW_QA.md", "v58.27.9"],
];

for (const [file, needle] of checks) {
  if (!read(file).includes(needle)) failures.push(`${file} missing ${needle}`);
}

if (failures.length) {
  console.error("[verify:v58.27.9] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[verify:v58.27.9] OK — Workspace Pro interaction hardening and real editing flow aligned.");
