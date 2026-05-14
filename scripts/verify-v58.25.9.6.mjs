#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const expectedVersion = "58.25.9.6-workspace-members-permissions-ux-polish";
const expectedRelease = "v58.25.9.6 Workspace Members + Permissions UX Polish";
const exists = (rel) => fs.existsSync(path.join(root, rel));
const read = (rel) => exists(rel) ? fs.readFileSync(path.join(root, rel), "utf8") : "";
const requireFile = (rel) => { if (!exists(rel)) failures.push(`Missing required file: ${rel}`); };
const requireIncludes = (rel, text) => { if (!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); };

const pkg = JSON.parse(read("package.json"));
if (pkg.version !== expectedVersion) failures.push(`package version must be ${expectedVersion}`);
if ((pkg.scripts ?? {})["verify:current"] !== "npm run verify:v58.25.9.6") failures.push("verify:current must target verify:v58.25.9.6");
if ((pkg.scripts ?? {})["verify:v58.25.9.6"] !== "node scripts/verify-v58.25.9.6.mjs") failures.push("verify:v58.25.9.6 script missing");

requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedRelease);
requireIncludes("package-lock.json", expectedVersion);

requireIncludes("src/lib/workspace-system/view-state.ts", "WorkspacePermissionSummary");
requireIncludes("src/lib/workspace-system/view-state.ts", "WorkspaceMemberSummary");
requireIncludes("src/lib/workspace-system/server-data.ts", "getWorkspacePermissionSummary");
requireIncludes("src/lib/workspace-system/server-data.ts", "getWorkspaceProjectMembers");
requireIncludes("src/app/(app)/app/workspace/page.tsx", "workspace:getPermissionSummary");
requireIncludes("src/app/(app)/app/workspace/page.tsx", "workspace:getProjectMembers");

requireFile("src/components/workspace-system/workspace-members-permissions.tsx");
requireIncludes("src/components/workspace-system/workspace-members-permissions.tsx", "WorkspaceMembersPermissionsCard");
requireIncludes("src/components/workspace-system/workspace-members-permissions.tsx", "WorkspacePermissionBanner");
requireIncludes("src/components/workspace-system/workspace-system-page.tsx", "permissions.canCreateTask");
requireIncludes("src/components/workspace-system/workspace-system-page.tsx", "WorkspacePermissionBanner");
requireIncludes("src/components/workspace-system/workspace-right-panel.tsx", "WorkspaceMembersPermissionsCard");
requireIncludes("src/components/workspace-system/views/home-view.tsx", "Miembros y permisos");
requireIncludes("src/components/workspace-system/views/files-view.tsx", "permissions.canUploadFiles");
requireIncludes("src/components/workspace-system/workspace-saved-views-manager.tsx", "permissions.canSaveViews");
requireIncludes("src/components/workspace-system/workspace-spaces-manager.tsx", "permissions.canManageSpaces");
requireIncludes("src/app/globals.css", "v58.25.9.6 — Workspace Members + Permissions UX Polish");
requireIncludes("src/app/globals.css", "ft-ws-permission-banner");
requireIncludes("src/app/globals.css", "ft-ws-member-row");

requireFile("docs/release/V58_25_9_6_WORKSPACE_MEMBERS_PERMISSIONS_UX_POLISH.md");
requireFile("docs/qa/FLOWTASK_V58_25_9_6_WORKSPACE_MEMBERS_PERMISSIONS_UX_POLISH_QA.md");

if (failures.length) {
  console.error("[verify:v58.25.9.6] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[verify:v58.25.9.6] OK — Workspace Members + Permissions UX Polish aligned.");
