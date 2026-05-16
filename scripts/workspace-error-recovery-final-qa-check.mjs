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
if (pkg.version !== "58.27.1-release-candidate-fixes") failures.push(`Unexpected package version: ${pkg.version}`);
if (pkg.scripts?.["workspace:error-recovery:ready"] !== "node scripts/workspace-error-recovery-final-qa-check.mjs") failures.push("workspace:error-recovery:ready script missing");
if (!String(pkg.scripts?.["build:preflight"] ?? "").includes("workspace:error-recovery:ready")) failures.push("build:preflight must include workspace:error-recovery:ready");

for (const rel of [
  "src/components/workspace-system/workspace-recovery-panel.tsx",
  "src/app/(app)/app/workspace/error.tsx",
  "src/app/(app)/app/workspace/loading.tsx",
  "src/components/workspace-system/workspace-system-page.tsx",
  "src/lib/workspace-system/view-state.ts",
  "docs/release/V58_26_5_WORKSPACE_ERROR_RECOVERY_FINAL_QA_HARDENING.md",
  "docs/qa/FLOWTASK_V58_26_5_WORKSPACE_ERROR_RECOVERY_FINAL_QA.md",
]) requireFile(rel);

requireIncludes("src/components/workspace-system/workspace-recovery-panel.tsx", "WorkspaceRecoveryPanel");
requireIncludes("src/components/workspace-system/workspace-recovery-panel.tsx", "Volver al Workspace Home");
requireIncludes("src/app/(app)/app/workspace/error.tsx", "WorkspaceRecoveryPanel");
requireIncludes("src/app/(app)/app/workspace/loading.tsx", "WorkspaceLoading");
requireIncludes("src/components/workspace-system/workspace-system-page.tsx", "invalidSavedViewId");
requireIncludes("src/components/workspace-system/workspace-system-page.tsx", "Persistencia bloqueada por Supabase/RLS");
requireIncludes("src/lib/workspace-system/view-state.ts", "invalidSavedViewId");
requireIncludes("src/app/globals.css", "v58.27.1 — Release Candidate Fixes");
requireIncludes("src/app/globals.css", "ft-ws-recovery-panel");
requireIncludes("src/lib/release/version.ts", "58.27.1-release-candidate-fixes");
requireIncludes("README.md", "v58.27.1");

if (failures.length) {
  console.error("[workspace:error-recovery:ready] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("[workspace:error-recovery:ready] OK — Workspace error recovery and final QA hardening aligned.");
