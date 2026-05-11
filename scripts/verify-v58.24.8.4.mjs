#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const read = (rel) => fs.existsSync(path.join(root, rel)) ? fs.readFileSync(path.join(root, rel), "utf8") : "";
const exists = (rel) => fs.existsSync(path.join(root, rel));
const requireIncludes = (rel, text) => { if (!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); };
const requireFile = (rel) => { if (!exists(rel)) failures.push(`Missing required file: ${rel}`); };

const expectedVersion = "58.24.8.4-boards-create-rls-diagnostics-workspace-scope-hardening";
const expectedRelease = "v58.24.8.4 Boards Create RLS Diagnostics + Workspace Scope Hardening";

const pkg = JSON.parse(read("package.json"));
if (pkg.version !== expectedVersion) failures.push("package version must be v58.24.8.4 boards create diagnostics");
if ((pkg.scripts ?? {})["verify:current"] !== "npm run verify:v58.24.8.4") failures.push("verify:current must target verify:v58.24.8.4");
if ((pkg.scripts ?? {})["verify:v58.24.8.4"] !== "node scripts/verify-v58.24.8.4.mjs") failures.push("verify:v58.24.8.4 script must be available");

requireFile("scripts/verify-v58.24.8.4.mjs");
requireFile("docs/release/V58_24_8_4_BOARDS_CREATE_RLS_DIAGNOSTICS_WORKSPACE_SCOPE_HARDENING.md");
requireFile("docs/qa/FLOWTASK_V58_24_8_4_BOARDS_CREATE_RLS_DIAGNOSTICS_WORKSPACE_SCOPE_HARDENING_QA.md");
requireFile("docs/boards/FLOWTASK_BOARDS_RLS_WORKSPACE_SCOPE_HARDENING.md");
requireFile("supabase/migrations/0050_v58_24_8_4_visual_boards_rls_workspace_scope.sql");

requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedRelease);
requireIncludes("package-lock.json", expectedVersion);
requireIncludes("README.md", "v58.24.8.4");
requireIncludes("src/components/boards/boards-home.tsx", "getBoardCreateErrorMessage");
requireIncludes("src/components/boards/boards-home.tsx", "logBoardDiagnostic");
requireIncludes("src/components/boards/boards-home.tsx", "public_can_edit: false");
requireIncludes("src/components/boards/boards-home.tsx", "workspaceMode: getWorkspaceModeLabel(context.activeOrganizationId)");
requireIncludes("src/components/boards/boards-home.tsx", ".select(\"id,owner_id,organization_id,visibility,public_can_edit\")");
requireIncludes("src/components/boards/boards-home.tsx", "No pudimos crear la pizarra. Revisa sesión, permisos RLS o el workspace activo.");
requireIncludes("docs/boards/FLOWTASK_BOARDS_RLS_WORKSPACE_SCOPE_HARDENING.md", "Workspace personal");
requireIncludes("docs/boards/FLOWTASK_BOARDS_RLS_WORKSPACE_SCOPE_HARDENING.md", "Workspace organización");
requireIncludes("supabase/migrations/0050_v58_24_8_4_visual_boards_rls_workspace_scope.sql", "organization_members");

if (failures.length) {
  console.error("[verify:v58.24.8.4] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[verify:v58.24.8.4] OK — Boards create RLS diagnostics and workspace scope hardening aligned.");
