import fs from "node:fs";

const failures = [];
const read = (file) => fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
const pkg = JSON.parse(read("package.json"));

const version = "58.28.1-workspace-pro-user-final-ui-fixes";
const verifyTarget = "npm run verify:v58.28.1";

if (pkg.version !== version) failures.push(`Unexpected package version: ${pkg.version}`);
if (pkg.scripts?.["verify:current"] !== verifyTarget) failures.push("verify:current must target verify:v58.28.1");
if (!pkg.scripts?.["workspace:user-final-ui:ready"]) failures.push("workspace:user-final-ui:ready script missing");
if (!String(pkg.scripts?.["build:preflight"] ?? "").includes("workspace:user-final-ui:ready")) failures.push("build:preflight must include workspace:user-final-ui:ready");

const checks = [
  ["src/lib/release/version.ts", version],
  ["src/lib/release/version.ts", "v58.28.1 Workspace Pro User Final UI Fixes"],
  ["src/components/workspace-pro/workspace-pro-page.tsx", "v58.28.1 — Workspace Pro User Final UI Fixes"],
  ["src/components/workspace-pro/workspace-pro-page.tsx", "ws-pro-board-actions"],
  ["src/components/workspace-pro/workspace-pro-page.tsx", "ws-pro-task-editor-toolbar"],
  ["src/components/workspace-system/workspace-spaces-manager.tsx", "v58.28.1 Workspace Spaces Manager Final UI Fix"],
  ["src/app/globals.css", "v58.28.1 — Workspace Pro User Final UI Fixes"],
  ["src/app/globals.css", "ws-pro-board-status-chip"],
  ["src/app/globals.css", "ft-ws-space-create-grid"],
  ["docs/release/V58_28_1_WORKSPACE_PRO_USER_FINAL_UI_FIXES.md", "v58.28.1"],
  ["docs/qa/FLOWTASK_V58_28_1_WORKSPACE_PRO_USER_FINAL_UI_FIXES_QA.md", "v58.28.1"],
];

for (const [file, needle] of checks) {
  if (!read(file).includes(needle)) failures.push(`${file} missing ${needle}`);
}

if (failures.length) {
  console.error("[verify:v58.28.1] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[verify:v58.28.1] OK — Workspace Pro user final UI fixes aligned.");
