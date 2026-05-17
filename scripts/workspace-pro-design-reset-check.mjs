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

if (!read("src/lib/release/version.ts").includes("58.27.5-workspace-pro-files-reports-crud-polish") && !read("src/lib/release/version.ts").includes("58.27.5-workspace-pro-files-reports-crud-polish")) failures.push("Expected v58.27.2 or v58.27.2.1 in src/lib/release/version.ts");
requireIncludes("src/lib/release/version.ts", "APP_RELEASE_STAGE");
requireIncludes("src/components/workspace-system/workspace-system-page.tsx", "WorkspaceProPage");
requireIncludes("src/components/workspace-pro/workspace-pro-page.tsx", "ws-pro-shell");
requireIncludes("src/components/workspace-pro/workspace-pro-page.tsx", "WorkspaceProSidebar");
requireIncludes("src/components/workspace-pro/workspace-pro-page.tsx", "WorkspaceProHome");
requireIncludes("src/components/workspace-pro/workspace-pro-page.tsx", "WorkspaceProRightPanel");
requireIncludes("src/components/workspace-pro/workspace-pro-page.tsx", "WorkspaceTaskInlineEditor");
requireIncludes("src/app/globals.css", "v58.27.5 — Workspace Pro Files + Reports CRUD Polish");
requireIncludes("src/app/globals.css", "ws-pro-primary-button");
requireIncludes("src/app/globals.css", "ws-pro-hide-scrollbar");

if (failures.length) {
  console.error("[workspace:design-reset:ready] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("[workspace:design-reset:ready] OK — Workspace Pro design reset and enterprise UI system aligned.");
