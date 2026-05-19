import fs from "node:fs";

const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const version = fs.readFileSync("src/lib/release/version.ts", "utf8");
const source = fs.readFileSync("src/components/workspace-pro/workspace-pro-page.tsx", "utf8");
const lazy = fs.existsSync("src/components/workspace-pro/workspace-pro-lazy-surfaces.tsx")
  ? fs.readFileSync("src/components/workspace-pro/workspace-pro-lazy-surfaces.tsx", "utf8")
  : "";
const runtime = fs.existsSync("src/components/workspace-pro/workspace-pro-runtime.ts");
const audit = fs.existsSync("docs/audits/V58_28_15_DEEP_COMPONENT_EXTRACTION_LAZY_VIEW_LOADING_AUDIT.md");
const failures = [];

if (pkg.version !== "58.28.15-workspace-pro-deep-component-extraction-lazy-view-loading",
  "58.28.16-task-data-sync-status-source-of-truth",
  "58.28.16.1-task-data-sync-cli-hotfix",
  "58.28.16.2-classic-pro-status-parity",
  "58.28.17-classic-pro-unified-data-qa-final-user-flow",
  "58.28.17.1-unified-data-qa-inline-status-type-hotfix",
  "58.28.19-ux-copy-empty-states-final", "58.28.20-mobile-responsive-final-pass") failures.push("Unexpected package version");
if (pkg.scripts?.["verify:current"] !== "npm run verify:v58.28.15", "npm run verify:v58.28.16", "npm run verify:v58.28.16.1", "npm run verify:v58.28.16.2", "npm run verify:v58.28.17",
  "npm run verify:v58.28.17.1",
  "npm run verify:v58.28.19", "npm run verify:v58.28.20") failures.push("verify:current must target verify:v58.28.15");
if (!version.includes("58.28.15-workspace-pro-deep-component-extraction-lazy-view-loading",
  "58.28.16-task-data-sync-status-source-of-truth",
  "58.28.16.1-task-data-sync-cli-hotfix",
  "58.28.16.2-classic-pro-status-parity",
  "58.28.17-classic-pro-unified-data-qa-final-user-flow",
  "58.28.17.1-unified-data-qa-inline-status-type-hotfix",
  "58.28.19-ux-copy-empty-states-final", "58.28.20-mobile-responsive-final-pass")) failures.push("version.ts must contain v58.28.15 slug");
if (!pkg.scripts?.["workspace:component-split:ready"]) failures.push("workspace:component-split:ready script missing");
if (!pkg.scripts?.["workspace:deep-component:ready"]) failures.push("workspace:deep-component:ready script missing");
if (!pkg.scripts?.["build:preflight"]?.includes("workspace:deep-component:ready")) failures.push("build:preflight must include workspace:deep-component:ready");
if (!runtime) failures.push("workspace-pro-runtime.ts split module missing");
if (!lazy.includes("dynamic(")) failures.push("lazy surfaces module must use next/dynamic");
if (!lazy.includes("LazyWorkspaceQuickCreate") || !lazy.includes("LazyWorkspaceSharePanel") || !lazy.includes("LazyWorkspaceFilesUploadEntry")) failures.push("hidden workspace surfaces must be lazily exported");
if (source.includes("@/components/workspace-system/workspace-quick-create") || source.includes("@/components/workspace-system/workspace-share-panel")) failures.push("Workspace Pro page must not statically import hidden surfaces");
if (!source.includes("mainViewNode = useMemo")) failures.push("Workspace main view is not memoized");
if (!source.includes("MemoWorkspaceProBoard") || !source.includes("MemoWorkspaceProFiles") || !source.includes("MemoWorkspaceProReports")) failures.push("Heavy Workspace Pro views must use memoized view boundaries");
if (!source.includes("buildWorkspaceProViewHref")) failures.push("client-side view href builder must be split from page component");
if (!audit) failures.push("deep component extraction audit doc missing");

if (failures.length) {
  console.error("[verify:v58.28.15] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[verify:v58.28.15] OK — Workspace Pro deep component extraction and lazy view loading aligned.");
