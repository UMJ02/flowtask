import fs from "node:fs";

const failures = [];
const read = (file) => fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
const pkg = JSON.parse(read("package.json"));
const page = read("src/components/workspace-pro/workspace-pro-page.tsx");
const spaces = read("src/components/workspace-system/workspace-spaces-manager.tsx");
const css = read("src/app/globals.css");
const allowedVersions = [
  "58.28.1-workspace-pro-user-final-ui-fixes",
  "58.28.2-workspace-pro-action-model-progressive-disclosure",
];
const allowedVerifyTargets = ["npm run verify:v58.28.1", "npm run verify:v58.28.2"];

if (!allowedVersions.includes(pkg.version)) failures.push(`Unexpected package version: ${pkg.version}`);
if (!allowedVerifyTargets.includes(pkg.scripts?.["verify:current"])) failures.push("verify:current must target an active v58.28.x verify script");

const pageMarkers = [
  "ws-pro-task-editor-toolbar",
  "ws-pro-editor-inline-action",
  "w-[min(1120px,calc(100vw-1.5rem))]",
];
for (const marker of pageMarkers) if (!page.includes(marker)) failures.push(`workspace-pro-page.tsx missing marker: ${marker}`);

const spaceMarkers = [
  "ft-ws-spaces-manager-head",
  "ft-ws-spaces-setup-grid",
  "ft-ws-space-create-grid",
  "ft-ws-spaces-status-card",
  "ft-ws-spaces-list-grid",
];
for (const marker of spaceMarkers) if (!spaces.includes(marker)) failures.push(`workspace-spaces-manager.tsx missing marker: ${marker}`);

const cssMarkers = [
  "v58.28.1 — Workspace Pro User Final UI Fixes",
  "ws-pro-task-editor-toolbar",
  "ft-ws-space-create-grid",
  "@media (max-width: 980px)",
];
for (const marker of cssMarkers) if (!css.includes(marker)) failures.push(`globals.css missing marker: ${marker}`);

if (failures.length) {
  console.error("[workspace:user-final-ui:ready] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[workspace:user-final-ui:ready] OK — Workspace Pro user final UI fixes aligned.");
