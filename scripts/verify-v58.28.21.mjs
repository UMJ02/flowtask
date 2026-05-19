import { readFileSync, existsSync } from "node:fs";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const versionText = readFileSync("src/lib/release/version.ts", "utf8");
const migrations = [
  "supabase/migrations/0051_v58_24_9_workspace_data_isolation_org_lifecycle.sql",
  "supabase/migrations/0055_v58_28_4_task_status_pending_review.sql",
  "supabase/migrations/0056_v58_25_9_workspace_persistence_foundation.sql",
  "supabase/migrations/0057_v58_25_9_4_workspace_space_project_assignments.sql",
  "supabase/migrations/0058_v58_25_9_5_project_views_home_view_support.sql",
  "supabase/migrations/0059_v58_26_1_workspace_real_environment_hardening.sql",
  "supabase/migrations/0060_v58_27_3_project_views_projects_view_support.sql",
];
const readinessSql = "docs/sql/V58_28_21_SUPABASE_RLS_CLIENT_READINESS.sql";
const qaDoc = "docs/qa/FLOWTASK_V58_28_21_SUPABASE_RLS_CLIENT_READINESS_QA.md";
const failures = [];
const expectedVersion = "58.28.21-supabase-rls-client-readiness-final";

if (pkg.version !== expectedVersion) failures.push(`Unexpected package version: ${pkg.version}`);
if (pkg.scripts?.["verify:current"] !== "npm run verify:v58.28.21") failures.push("verify:current must target verify:v58.28.21");
if (!pkg.scripts?.["build:preflight"]?.includes("workspace:supabase-client-readiness:ready")) failures.push("build:preflight must include workspace:supabase-client-readiness:ready");
if (!versionText.includes(expectedVersion)) failures.push("version.ts must contain v58.28.21 slug");
if (!versionText.includes("APP_RELEASE_STAGE")) failures.push("version.ts must export APP_RELEASE_STAGE");
for (const file of migrations) if (!existsSync(file)) failures.push(`Missing required Supabase migration: ${file}`);
for (const file of [readinessSql, qaDoc]) if (!existsSync(file)) failures.push(`Missing readiness artifact: ${file}`);

if (failures.length) {
  console.error("[verify:v58.28.21] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("[verify:v58.28.21] OK — Supabase, RLS and client readiness final aligned.");
