#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const exists = (rel) => fs.existsSync(path.join(root, rel));
const read = (rel) => exists(rel) ? fs.readFileSync(path.join(root, rel), "utf8") : "";
const requireFile = (rel) => { if (!exists(rel)) failures.push(`Missing required file: ${rel}`); };
const requireIncludes = (rel, text) => { if (!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); };

const pkg = JSON.parse(read("package.json") || "{}");
if (pkg.version !== "58.26.4-workspace-collaboration-share-mobile-polish") failures.push(`Unexpected package version: ${pkg.version}`);
if (pkg.scripts?.["workspace:collaboration:ready"] !== "node scripts/workspace-collaboration-share-readiness-check.mjs") failures.push("workspace:collaboration:ready script missing");
if (!String(pkg.scripts?.["build:preflight"] ?? "").includes("workspace:collaboration:ready")) failures.push("build:preflight must include workspace:collaboration:ready");

for (const rel of [
  "src/components/workspace-system/workspace-share-panel.tsx",
  "src/components/workspace-system/workspace-system-page.tsx",
  "src/components/workspace-system/workspace-context-header.tsx",
  "src/components/workspace-system/workspace-members-permissions.tsx",
  "docs/release/V58_26_4_WORKSPACE_COLLABORATION_SHARE_MOBILE_POLISH.md",
  "docs/qa/FLOWTASK_V58_26_4_WORKSPACE_COLLABORATION_SHARE_MOBILE_QA.md",
]) requireFile(rel);

requireIncludes("src/components/workspace-system/workspace-share-panel.tsx", "WorkspaceSharePanel");
requireIncludes("src/components/workspace-system/workspace-share-panel.tsx", "buildWorkspaceUrl");
requireIncludes("src/components/workspace-system/workspace-share-panel.tsx", "Vista guardada activa");
requireIncludes("src/components/workspace-system/workspace-share-panel.tsx", "permissions.canManageMembers");
requireIncludes("src/components/workspace-system/workspace-system-page.tsx", "setSharePanelOpen");
requireIncludes("src/components/workspace-system/workspace-context-header.tsx", "onOpenSharePanel");
requireIncludes("src/app/globals.css", "ft-ws-share-link-row");
requireIncludes("src/app/globals.css", "ft-ws-share-member-row");
requireIncludes("src/lib/release/version.ts", "58.26.4-workspace-collaboration-share-mobile-polish");
requireIncludes("README.md", "v58.26.4");

if (failures.length) {
  console.error("[workspace:collaboration:ready] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("[workspace:collaboration:ready] OK — Workspace collaboration, share and mobile polish aligned.");
