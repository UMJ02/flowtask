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

const expectedVersion = "58.25.8.1-workspace-real-data-hardening";
const expectedRelease = "v58.25.8.1 Workspace Real Data Hardening";
const pkg = JSON.parse(read("package.json"));

if (pkg.version !== expectedVersion) failures.push("package version must be v58.25.8.1 workspace real data hardening");
if ((pkg.scripts ?? {})["verify:current"] !== "npm run verify:v58.25.8.1") failures.push("verify:current must target verify:v58.25.8.1");
if ((pkg.scripts ?? {})["verify:v58.25.8.1"] !== "node scripts/verify-v58.25.8.1.mjs") failures.push("verify:v58.25.8.1 script missing");

requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedRelease);
requireIncludes("package-lock.json", expectedVersion);

requireFile("src/app/(app)/app/workspace/page.tsx");
requireFile("src/lib/workspace-system/server-data.ts");
requireFile("src/lib/workspace-system/view-state.ts");
requireFile("src/lib/workspace-system/adapters.ts");
requireFile("src/components/workspace-system/workspace-system-page.tsx");
requireFile("src/components/workspace-system/workspace-sidebar-pro.tsx");
requireFile("src/components/workspace-system/workspace-right-panel.tsx");

requireIncludes("src/app/(app)/app/workspace/page.tsx", "getWorkspaceIdentity()");
requireIncludes("src/app/(app)/app/workspace/page.tsx", "buildWorkspaceSpaces(tasksAll, projectsAll)");
requireIncludes("src/app/(app)/app/workspace/page.tsx", "filterTasksForWorkspace(tasksAll");
requireIncludes("src/app/(app)/app/workspace/page.tsx", "invalidProjectId");
requireIncludes("src/app/(app)/app/workspace/page.tsx", "workspaceIdentity?.organizationId");
requireIncludes("src/lib/workspace-system/server-data.ts", "getWorkspaceContext");
requireIncludes("src/lib/workspace-system/server-data.ts", "organizations");
requireIncludes("src/lib/workspace-system/adapters.ts", "buildWorkspaceSpaces");
requireIncludes("src/lib/workspace-system/adapters.ts", "filterProjectsForWorkspace");
requireIncludes("src/lib/workspace-system/adapters.ts", "filterTasksForWorkspace");
requireIncludes("src/components/workspace-system/workspace-sidebar-pro.tsx", "Espacios reales");
requireIncludes("src/components/workspace-system/workspace-sidebar-pro.tsx", "Proyectos filtrados");
requireIncludes("src/components/workspace-system/workspace-system-page.tsx", "No se muestran datos cruzados");
requireIncludes("src/components/workspace-system/workspace-right-panel.tsx", "Datos reales");
requireIncludes("src/app/globals.css", "v58.25.8.1 Workspace Real Data Hardening");

requireNotIncludes("src/app/(app)/app/workspace/page.tsx", "workspace_spaces");
requireNotIncludes("src/app/(app)/app/workspace/page.tsx", "project_views");

requireFile("docs/release/V58_25_8_1_WORKSPACE_REAL_DATA_HARDENING.md");
requireFile("docs/qa/FLOWTASK_V58_25_8_1_WORKSPACE_REAL_DATA_HARDENING_QA.md");

if (failures.length) {
  console.error("[verify:v58.25.8.1] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[verify:v58.25.8.1] OK — Workspace real data hardening, scoped filters and release metadata aligned.");
