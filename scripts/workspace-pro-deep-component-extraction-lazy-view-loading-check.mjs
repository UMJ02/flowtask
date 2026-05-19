import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const page = fs.readFileSync(path.join(root, "src/components/workspace-pro/workspace-pro-page.tsx"), "utf8");
const lazyPath = path.join(root, "src/components/workspace-pro/workspace-pro-lazy-surfaces.tsx");
const lazy = fs.existsSync(lazyPath) ? fs.readFileSync(lazyPath, "utf8") : "";
const failures = [];

const requiredFiles = [
  "src/components/workspace-pro/workspace-pro-runtime.ts",
  "src/components/workspace-pro/workspace-pro-lazy-surfaces.tsx",
  "docs/audits/V58_28_15_DEEP_COMPONENT_EXTRACTION_LAZY_VIEW_LOADING_AUDIT.md",
  "docs/release/V58_28_15_WORKSPACE_PRO_DEEP_COMPONENT_EXTRACTION_LAZY_VIEW_LOADING.md",
  "docs/qa/FLOWTASK_V58_28_15_WORKSPACE_PRO_DEEP_COMPONENT_EXTRACTION_LAZY_VIEW_LOADING_QA.md",
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
if (!pkg.scripts?.["build:preflight"]?.includes("workspace:deep-component:ready")) failures.push("build:preflight does not include deep component check");
if (!lazy.includes("next/dynamic")) failures.push("lazy surfaces must use next/dynamic");
const lazyNames = [
  "LazyWorkspaceQuickCreate",
  "LazyWorkspaceSavedViewsManager",
  "LazyWorkspaceSpacesManager",
  "LazyWorkspaceCommandCenter",
  "LazyWorkspaceSharePanel",
  "LazyWorkspaceRecoveryPanel",
  "LazyWorkspaceFilesUploadEntry",
];
for (const name of lazyNames) {
  if (!lazy.includes(name)) failures.push(`Missing lazy surface export: ${name}`);
  if (!page.includes(name)) failures.push(`Workspace page is not using lazy surface: ${name}`);
}
const staticImports = [
  "workspace-quick-create",
  "workspace-saved-views-manager",
  "workspace-spaces-manager",
  "workspace-command-center",
  "workspace-share-panel",
  "workspace-recovery-panel",
  "workspace-files-upload-entry",
];
for (const item of staticImports) {
  if (page.includes(`@/components/workspace-system/${item}`)) failures.push(`Static hidden surface import still present: ${item}`);
}
if (!page.includes("const mainViewNode = useMemo")) failures.push("Main active view must stay memoized");
if (!page.includes("buildWorkspaceProViewHref")) failures.push("Runtime navigation helper must stay extracted");
if ((page.match(/^function WorkspacePro/gm) || []).length > 22) failures.push("Workspace Pro page is growing back above safe function surface limit");

if (failures.length) {
  console.error("[workspace:deep-component:ready] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("[workspace:deep-component:ready] OK — hidden surfaces are lazy-loaded and Workspace Pro runtime remains split.");
