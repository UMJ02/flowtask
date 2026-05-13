#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const exists = (rel) => fs.existsSync(path.join(root, rel));
const read = (rel) => exists(rel) ? fs.readFileSync(path.join(root, rel), "utf8") : "";
const requireFile = (rel) => { if (!exists(rel)) failures.push(`Missing required file: ${rel}`); };
const requireIncludes = (rel, text) => { if (!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); };
const requireNotIncludes = (rel, text) => { if (read(rel).includes(text)) failures.push(`Did not expect '${text}' in ${rel}`); };

const expectedVersion = "58.25.8.2-project-detail-workspace-integration";
const expectedRelease = "v58.25.8.2 Project Detail Workspace Integration";
const pkg = JSON.parse(read("package.json"));

if (pkg.version !== expectedVersion) failures.push("package version must be v58.25.8.2 project detail workspace integration");
if ((pkg.scripts ?? {})["verify:current"] !== "npm run verify:v58.25.8.2") failures.push("verify:current must target verify:v58.25.8.2");
if ((pkg.scripts ?? {})["verify:v58.25.8.2"] !== "node scripts/verify-v58.25.8.2.mjs") failures.push("verify:v58.25.8.2 script missing");

requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedRelease);
requireIncludes("package-lock.json", expectedVersion);

requireFile("src/app/(app)/app/workspace/page.tsx");
requireFile("src/components/workspace-system/workspace-system-page.tsx");
requireFile("src/components/workspace-system/workspace-sidebar-pro.tsx");
requireFile("src/components/projects/project-detail-pro.tsx");
requireFile("src/app/(app)/app/projects/page.tsx");
requireFile("src/lib/navigation/routes.ts");

requireIncludes("src/lib/navigation/routes.ts", "workspaceProjectRoute");
requireIncludes("src/lib/navigation/routes.ts", "projectId");
requireIncludes("src/lib/navigation/routes.ts", "view");
requireIncludes("src/components/projects/project-detail-pro.tsx", "ProjectWorkspaceLinks");
requireIncludes("src/components/projects/project-detail-pro.tsx", "workspaceProjectRoute(project.id, \"list\", currentQuery)");
requireIncludes("src/components/projects/project-detail-pro.tsx", "Abrir este proyecto en Workspace");
requireIncludes("src/components/projects/project-detail-pro.tsx", "Lista, Board, Timeline, Tabla, Canvas y Reportes");
requireIncludes("src/app/(app)/app/projects/page.tsx", "workspaceProjectRoute(project.id, \"list\", queryString)");
requireIncludes("src/app/(app)/app/projects/page.tsx", "Vista Workspace");
requireIncludes("src/app/(app)/app/workspace/page.tsx", "requestedProjectId");
requireIncludes("src/app/(app)/app/workspace/page.tsx", "activeProject");
requireIncludes("src/app/(app)/app/workspace/page.tsx", "invalidProjectId");
requireIncludes("src/components/workspace-system/workspace-context-header.tsx", "context.hasProjectFilter");

requireNotIncludes("src/app/(app)/app/workspace/page.tsx", "workspace_spaces");
requireNotIncludes("src/app/(app)/app/workspace/page.tsx", "project_views");

requireFile("docs/release/V58_25_8_2_PROJECT_DETAIL_WORKSPACE_INTEGRATION.md");
requireFile("docs/qa/FLOWTASK_V58_25_8_2_PROJECT_DETAIL_WORKSPACE_INTEGRATION_QA.md");
requireIncludes("src/app/globals.css", "v58.25.8.2 Project Detail Workspace Integration");

if (failures.length) {
  console.error("[verify:v58.25.8.2] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[verify:v58.25.8.2] OK — Project detail workspace integration, routes and release metadata aligned.");
