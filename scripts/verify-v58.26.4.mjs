#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const expectedVersion = "58.26.4-workspace-collaboration-share-mobile-polish";
const expectedRelease = "v58.26.4 Workspace Collaboration + Share + Mobile Polish";
const exists = (rel) => fs.existsSync(path.join(root, rel));
const read = (rel) => exists(rel) ? fs.readFileSync(path.join(root, rel), "utf8") : "";
const requireFile = (rel) => { if (!exists(rel)) failures.push(`Missing required file: ${rel}`); };
const requireIncludes = (rel, text) => { if (!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); };

const pkg = JSON.parse(read("package.json") || "{}");
if (pkg.version !== expectedVersion) failures.push(`package version must be ${expectedVersion}`);
if ((pkg.scripts ?? {})["verify:current"] !== "npm run verify:v58.26.4") failures.push("verify:current must target verify:v58.26.4");
if ((pkg.scripts ?? {})["verify:v58.26.4"] !== "node scripts/verify-v58.26.4.mjs") failures.push("verify:v58.26.4 script missing");
if ((pkg.scripts ?? {})["workspace:collaboration:ready"] !== "node scripts/workspace-collaboration-share-readiness-check.mjs") failures.push("workspace:collaboration:ready script missing");

for (const rel of [
  "scripts/verify-v58.26.4.mjs",
  "scripts/workspace-collaboration-share-readiness-check.mjs",
  "src/components/workspace-system/workspace-share-panel.tsx",
  "src/components/workspace-system/workspace-system-page.tsx",
  "src/components/workspace-system/workspace-context-header.tsx",
  "src/components/workspace-system/workspace-members-permissions.tsx",
  "src/components/workspace-system/workspace-command-center.tsx",
  "docs/release/V58_26_4_WORKSPACE_COLLABORATION_SHARE_MOBILE_POLISH.md",
  "docs/qa/FLOWTASK_V58_26_4_WORKSPACE_COLLABORATION_SHARE_MOBILE_QA.md",
]) requireFile(rel);

requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedRelease);
requireIncludes("package-lock.json", expectedVersion);
requireIncludes("src/components/workspace-system/workspace-share-panel.tsx", "WorkspaceSharePanel");
requireIncludes("src/components/workspace-system/workspace-share-panel.tsx", "Copiar link");
requireIncludes("src/components/workspace-system/workspace-share-panel.tsx", "permissions.canShare");
requireIncludes("src/components/workspace-system/workspace-system-page.tsx", "sharePanelOpen");
requireIncludes("src/components/workspace-system/workspace-system-page.tsx", "WorkspaceSharePanel");
requireIncludes("src/components/workspace-system/workspace-context-header.tsx", "onOpenSharePanel");
requireIncludes("src/app/globals.css", "v58.26.4 — Workspace Collaboration + Share + Mobile Polish");
requireIncludes("src/app/globals.css", "ft-ws-share-panel");
requireIncludes("README.md", "v58.26.4");

if (failures.length) {
  console.error("[verify:v58.26.4] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("[verify:v58.26.4] OK — Workspace Collaboration + Share + Mobile Polish aligned.");
