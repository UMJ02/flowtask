import fs from "node:fs";

const failures = [];
const read = (file) => fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
const pkg = JSON.parse(read("package.json") || "{}");
const versionText = read("src/lib/release/version.ts");
const envExample = read(".env.example");
const statusMigration = read("supabase/migrations/0055_v58_28_4_task_status_pending_review.sql");
const isolationMigration = read("supabase/migrations/0051_v58_24_9_workspace_data_isolation_org_lifecycle.sql");
const workspaceFoundation = read("supabase/migrations/0056_v58_25_9_workspace_persistence_foundation.sql");
const spacesProjects = read("supabase/migrations/0057_v58_25_9_4_workspace_space_project_assignments.sql");
const projectViews = read("supabase/migrations/0058_v58_25_9_5_project_views_home_view_support.sql") + "\n" + read("supabase/migrations/0060_v58_27_3_project_views_projects_view_support.sql");
const readinessSql = read("docs/sql/V58_28_21_SUPABASE_RLS_CLIENT_READINESS.sql");
const qaDoc = read("docs/qa/FLOWTASK_V58_28_21_SUPABASE_RLS_CLIENT_READINESS_QA.md");
const allowedVersions = ["58.28.21-supabase-rls-client-readiness-final", "58.28.21.3-classic-reports-data-integrity-checklist-progress-export",
  "58.28.21.4-share-landing-short-link-stored-report-tokens"];
const allowedVerifyTargets = ["npm run verify:v58.28.21", "npm run verify:v58.28.21.3",
  "npm run verify:v58.28.21.4"];

if (!allowedVersions.includes(pkg.version)) failures.push(`Unexpected package version: ${pkg.version}`);
if (!allowedVerifyTargets.includes(pkg.scripts?.["verify:current"])) failures.push("verify:current must target an active v58.28.21 verify script");
if (!pkg.scripts?.["build:preflight"]?.includes("workspace:supabase-client-readiness:ready")) failures.push("build:preflight must include workspace:supabase-client-readiness:ready");
if (!allowedVersions.some((version) => versionText.includes(version))) failures.push("version.ts must contain v58.28.21 or v58.28.21.1 slug");
if (!versionText.includes("APP_RELEASE_STAGE")) failures.push("version.ts must export APP_RELEASE_STAGE");

for (const required of [
  "NEXT_PUBLIC_SUPABASE_URL=",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY=",
  "NEXT_PUBLIC_APP_URL=",
  "SUPABASE_SERVICE_ROLE_KEY=",
  "FLOWTASK_BASE_URL=",
  "NEXT_PUBLIC_ENABLE_REALTIME=",
  "CRON_SECRET=",
  "DIGEST_TIMEZONE=",
  "NOTIFICATION_BATCH_SIZE=",
]) {
  if (!envExample.includes(required)) failures.push(`.env.example missing ${required}`);
}

for (const status of ["pendiente", "en_proceso", "produccion", "en_espera", "revision", "concluido"]) {
  if (!statusMigration.includes(status)) failures.push(`tasks_status_check migration missing status: ${status}`);
  if (!readinessSql.includes(status)) failures.push(`readiness SQL missing status: ${status}`);
}

for (const marker of [
  "is_organization_member",
  "tasks_select_workspace_access",
  "tasks_insert_workspace_owner",
  "tasks_update_workspace_access",
  "projects_select_workspace_access",
  "projects_update_workspace_editor",
]) {
  if (!isolationMigration.includes(marker)) failures.push(`workspace isolation migration missing ${marker}`);
}

for (const marker of ["workspace_spaces", "workspace_spaces_select_access", "workspace_spaces_write_access"]) {
  if (!workspaceFoundation.includes(marker)) failures.push(`workspace foundation migration missing ${marker}`);
}
if (!spacesProjects.includes("workspace_space_projects")) failures.push("space project assignment migration missing workspace_space_projects");
if (!projectViews.includes("project_views")) failures.push("project views migrations missing project_views");
if (!fs.existsSync("scripts/workspace-real-environment-hardening-check.mjs")) failures.push("missing real environment hardening check script");

for (const marker of [
  "tasks_status_check",
  "pg_policies",
  "rowsecurity",
  "organization_members",
  "visual_boards",
  "workspace personal",
  "workspace organización",
]) {
  if (!readinessSql.includes(marker) && !qaDoc.includes(marker)) failures.push(`readiness docs missing marker: ${marker}`);
}

if (failures.length) {
  console.error("[workspace:supabase-client-readiness:ready] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("[workspace:supabase-client-readiness:ready] OK — Supabase schema, RLS and client readiness checklist aligned.");
