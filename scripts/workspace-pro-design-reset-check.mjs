#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const read = (rel) => fs.existsSync(path.join(root, rel)) ? fs.readFileSync(path.join(root, rel), "utf8") : "";
const exists = (rel) => fs.existsSync(path.join(root, rel));
const requireFile = (rel) => { if (!exists(rel)) failures.push(`Missing ${rel}`); };
const requireIncludes = (rel, text) => { if (!read(rel).includes(text)) failures.push(`Expected ${JSON.stringify(text)} in ${rel}`); };

for (const rel of [
  "src/components/workspace-pro/workspace-pro-page.tsx",
  "src/components/workspace-system/workspace-system-page.tsx",
  "src/app/globals.css",
  "src/lib/release/version.ts",
]) requireFile(rel);

const allowedVersions = ["58.27.6-workspace-pro-deep-cleanup-2026-ui-controls-system", "58.27.7-workspace-pro-render-diet-dead-ui-removal", "58.27.7.1-workspace-pro-render-diet-cli-hotfix"];
if (!allowedVersions.some((version) => read("src/lib/release/version.ts").includes(version))) failures.push("Expected an allowed v58.27.x Workspace Pro version in src/lib/release/version.ts");
requireIncludes("src/lib/release/version.ts", "APP_RELEASE_STAGE");
requireIncludes("src/components/workspace-system/workspace-system-page.tsx", "WorkspaceProPage");
requireIncludes("src/components/workspace-pro/workspace-pro-page.tsx", "ws-pro-shell");
requireIncludes("src/components/workspace-pro/workspace-pro-page.tsx", "WorkspaceProSidebar");
requireIncludes("src/components/workspace-pro/workspace-pro-page.tsx", "WorkspaceProHome");
requireIncludes("src/components/workspace-pro/workspace-pro-page.tsx", "WorkspaceProRightPanel");
requireIncludes("src/components/workspace-pro/workspace-pro-page.tsx", "WorkspaceTaskInlineEditor");
requireIncludes("src/app/globals.css", "v58.27.6 — Workspace Pro Deep Cleanup + 2026 UI Controls System");
requireIncludes("src/app/globals.css", "ws-pro-primary-button");
requireIncludes("src/app/globals.css", "ws-pro-hide-scrollbar");

if (failures.length) {
  console.error("[workspace:design-reset:ready] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("[workspace:design-reset:ready] OK — Workspace Pro design reset and enterprise UI system aligned.");
