#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const expectedVersion = "58.25.9.5-workspace-project-home-dashboard";
const expectedRelease = "v58.25.9.5 Workspace Project Home Dashboard";
const exists = (rel) => fs.existsSync(path.join(root, rel));
const read = (rel) => exists(rel) ? fs.readFileSync(path.join(root, rel), "utf8") : "";
const requireFile = (rel) => { if (!exists(rel)) failures.push(`Missing required file: ${rel}`); };
const requireIncludes = (rel, text) => { if (!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); };

const pkg = JSON.parse(read("package.json"));
if (pkg.version !== expectedVersion) failures.push(`package version must be ${expectedVersion}`);
if ((pkg.scripts ?? {})["verify:current"] !== "npm run verify:v58.25.9.5") failures.push("verify:current must target verify:v58.25.9.5");
if ((pkg.scripts ?? {})["verify:v58.25.9.5"] !== "node scripts/verify-v58.25.9.5.mjs") failures.push("verify:v58.25.9.5 script missing");

requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedRelease);
requireIncludes("package-lock.json", expectedVersion);

requireFile("supabase/migrations/0058_v58_25_9_5_project_views_home_view_support.sql");
requireIncludes("supabase/migrations/0058_v58_25_9_5_project_views_home_view_support.sql", "project_views_view_type_check");
requireIncludes("supabase/migrations/0058_v58_25_9_5_project_views_home_view_support.sql", "'home'");
requireIncludes("src/lib/workspace-system/view-state.ts", '"home" | "list"');
requireIncludes("src/lib/workspace-system/adapters.ts", '"home", "list"');
requireIncludes("src/app/(app)/app/workspace/page.tsx", '?? "home"');
requireIncludes("src/app/(app)/app/workspace/page.tsx", "projectIds: projectsInSpace.map");

requireFile("src/components/workspace-system/views/home-view.tsx");
requireIncludes("src/components/workspace-system/views/home-view.tsx", "Home operativo");
requireIncludes("src/components/workspace-system/views/home-view.tsx", "Tareas importantes y próximas fechas");
requireIncludes("src/components/workspace-system/views/home-view.tsx", "Vistas guardadas");
requireIncludes("src/components/workspace-system/views/home-view.tsx", "Pizarras y archivos");
requireIncludes("src/components/workspace-system/views/home-view.tsx", "Actividad e IA");
requireIncludes("src/components/workspace-system/workspace-system-page.tsx", "HomeView");
requireIncludes("src/components/workspace-system/workspace-system-page.tsx", 'activeView === "home"');
requireIncludes("src/components/workspace-system/workspace-view-tabs.tsx", 'id: "home"');
requireIncludes("src/components/workspace-system/workspace-sidebar-pro.tsx", "Home del proyecto");
requireIncludes("src/components/workspace-system/workspace-saved-views-manager.tsx", "home: \"Home\"");
requireIncludes("src/app/globals.css", "v58.25.9.5 Workspace Project Home Dashboard");
requireIncludes("src/app/globals.css", "ft-ws-home-hero");
requireIncludes("src/app/globals.css", "ft-ws-home-metric-card");
requireIncludes("src/app/globals.css", "ft-ws-home-empty-card");

requireFile("docs/release/V58_25_9_5_WORKSPACE_PROJECT_HOME_DASHBOARD.md");
requireFile("docs/qa/FLOWTASK_V58_25_9_5_WORKSPACE_PROJECT_HOME_DASHBOARD_QA.md");

if (failures.length) {
  console.error("[verify:v58.25.9.5] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[verify:v58.25.9.5] OK — Workspace Project Home Dashboard aligned.");
