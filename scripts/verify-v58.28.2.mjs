import fs from "node:fs";

const failures = [];
const read = (file) => fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
const pkg = JSON.parse(read("package.json"));
const version = "58.28.2-workspace-pro-action-model-progressive-disclosure";
const verifyTarget = "npm run verify:v58.28.2";

if (pkg.version !== version) failures.push(`Unexpected package version: ${pkg.version}`);
if (pkg.scripts?.["verify:current"] !== verifyTarget) failures.push("verify:current must target verify:v58.28.2");
if (!pkg.scripts?.["workspace:action-model:ready"]) failures.push("workspace:action-model:ready script missing");
if (!String(pkg.scripts?.["build:preflight"] ?? "").includes("workspace:action-model:ready")) failures.push("build:preflight must include workspace:action-model:ready");

const required = [
  ["src/lib/release/version.ts", "v58.28.2 Workspace Pro Action Model + Progressive Disclosure"],
  ["src/components/workspace-pro/workspace-pro-page.tsx", "v58.28.2 — Workspace Pro Action Model + Progressive Disclosure"],
  ["src/components/workspace-pro/workspace-pro-page.tsx", "ws-pro-action-menu"],
  ["src/components/workspace-pro/workspace-pro-page.tsx", "TASK_PRIORITY_ACTIONS"],
  ["src/components/workspace-system/workspace-spaces-manager.tsx", "v58.28.2 Workspace Spaces Progressive Disclosure"],
  ["src/app/globals.css", "v58.28.2 — Workspace Pro Action Model + Progressive Disclosure"],
  ["docs/release/V58_28_2_WORKSPACE_PRO_ACTION_MODEL_PROGRESSIVE_DISCLOSURE.md", "v58.28.2"],
  ["docs/qa/FLOWTASK_V58_28_2_WORKSPACE_PRO_ACTION_MODEL_PROGRESSIVE_DISCLOSURE_QA.md", "v58.28.2"],
];
for (const [file, marker] of required) {
  const content = read(file);
  if (!content) failures.push(`Missing file: ${file}`);
  else if (!content.includes(marker)) failures.push(`${file} missing marker: ${marker}`);
}

if (failures.length) {
  console.error("[verify:v58.28.2] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("[verify:v58.28.2] OK — Workspace Pro action model and progressive disclosure aligned.");
