import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const sourcePath = path.join(root, "src/components/workspace-pro/workspace-pro-page.tsx");
const source = fs.readFileSync(sourcePath, "utf8");
const failures = [];
const requiredFiles = [
  "src/components/workspace-pro/workspace-pro-runtime.ts",
  "docs/audits/V58_28_14_COMPONENT_SPLIT_RUNTIME_SLIMDOWN_AUDIT.md",
  "docs/release/V58_28_14_WORKSPACE_PRO_COMPONENT_SPLIT_RUNTIME_SLIMDOWN.md",
  "docs/qa/FLOWTASK_V58_28_14_WORKSPACE_PRO_COMPONENT_SPLIT_RUNTIME_SLIMDOWN_QA.md",
];
for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) failures.push(`Missing required file: ${file}`);
}
if (!["58.28.15-workspace-pro-deep-component-extraction-lazy-view-loading", "58.28.16-task-data-sync-status-source-of-truth",
  "58.28.16.1-task-data-sync-cli-hotfix",
  "58.28.16.2-classic-pro-status-parity",
  "58.28.17-classic-pro-unified-data-qa-final-user-flow",
  "58.28.17.1-unified-data-qa-inline-status-type-hotfix",
  "58.28.19-ux-copy-empty-states-final", "58.28.20-mobile-responsive-final-pass", "58.28.21-supabase-rls-client-readiness-final"].includes(pkg.version)) failures.push("package version is not an allowed v58.28 runtime version");
if (!["npm run verify:v58.28.15", "npm run verify:v58.28.16", "npm run verify:v58.28.16.1", "npm run verify:v58.28.16.2", "npm run verify:v58.28.17",
  "npm run verify:v58.28.17.1",
  "npm run verify:v58.28.19", "npm run verify:v58.28.20", "npm run verify:v58.28.21", "npm run verify:v58.28.21"].includes(pkg.scripts?.["verify:current"])) failures.push("verify:current is not an allowed v58.28 runtime verify target");
if (!pkg.scripts?.["build:preflight"]?.includes("workspace:component-split:ready")) failures.push("build:preflight does not include component split check");
if (!source.includes("memo,")) failures.push("React memo import missing");
if (!source.includes("useCallback")) failures.push("View callbacks must be stable with useCallback");
if (!source.includes("const mainViewNode = useMemo")) failures.push("Main active view must be memoized");
const memoNames = [
  "MemoWorkspaceProHome",
  "MemoWorkspaceProList",
  "MemoWorkspaceProProjects",
  "MemoWorkspaceProBoard",
  "MemoWorkspaceProTimeline",
  "MemoWorkspaceProTable",
  "MemoWorkspaceProCanvas",
  "MemoWorkspaceProFiles",
  "MemoWorkspaceProReports",
];
for (const name of memoNames) {
  if (!source.includes(name)) failures.push(`Missing memoized view boundary: ${name}`);
}
const functionCount = (source.match(/^function WorkspacePro/gm) || []).length;
if (functionCount > 22) failures.push(`Workspace Pro page still has too many unsplit WorkspacePro function surfaces: ${functionCount}`);
if (!fs.readFileSync(path.join(root, "src/components/workspace-pro/workspace-pro-runtime.ts"), "utf8").includes("buildWorkspaceProViewHref")) failures.push("runtime split does not expose view href builder");

if (failures.length) {
  console.error("[workspace:component-split:ready] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("[workspace:component-split:ready] OK — component split, memoized view boundaries and runtime slimdown aligned.");
