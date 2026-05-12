#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

function read(rel) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) {
    failures.push(`Missing required file: ${rel}`);
    return "";
  }
  return fs.readFileSync(full, "utf8");
}

function requireIncludes(rel, text, label = `${rel} must include ${text}`) {
  const content = read(rel);
  if (content && !content.includes(text)) failures.push(label);
}

const pkg = JSON.parse(read("package.json") || "{}");
const scripts = pkg.scripts ?? {};

if (pkg.version !== "58.21.0-create-flow-refresh-project-inline-activation") {
  failures.push("package.json must use v58.21.0 package version");
}
if (scripts["verify:current"] !== "npm run verify:v58.21.0") {
  failures.push("verify:current must target verify:v58.21.0");
}
if (scripts["verify:v58.21.0"] !== "node scripts/verify-v58.21.0.mjs") {
  failures.push("verify:v58.21.0 must target scripts/verify-v58.21.0.mjs");
}

requireIncludes("package-lock.json", "58.21.0-create-flow-refresh-project-inline-activation", "package-lock.json must include v58.21.0 package version");
requireIncludes("src/lib/release/version.ts", "58.21.0-create-flow-refresh-project-inline-activation", "runtime version must export v58.21.0");
requireIncludes("src/lib/release/version.ts", "v58.21.0 Create Flow Refresh + Project Inline Activation", "runtime release name must be v58.21.0");
requireIncludes("src/components/tasks/task-form.tsx", "Próximo check-in se mantiene como guía operativa visual", "Task create must not persist decorative check-in field");
requireIncludes("src/components/projects/project-form.tsx", "Crear proyecto", "Project create refresh layout must be present");
requireIncludes("src/components/projects/project-form.tsx", "Contrato protegido", "Project create sidebar must document protected contract");
requireIncludes("src/components/projects/project-hero-inline-editor.tsx", "ProjectHeroInlineEditor", "Project inline editor component must exist");
requireIncludes("src/components/projects/project-detail-pro.tsx", "ProjectHeroInlineEditor", "Project detail must mount inline editor");
requireIncludes("src/components/projects/project-detail-pro.tsx", "editMode && canEdit", "Project inline mode must be gated by permissions");
requireIncludes("src/app/(app)/app/projects/[id]/page.tsx", "editMode={editMode}", "Project page must pass editMode");
requireIncludes("src/app/(app)/app/projects/[id]/page.tsx", "canEdit={access.canEdit}", "Project page must pass canEdit");
requireIncludes("src/app/(app)/app/projects/[id]/edit/page.tsx", "mode", "Project edit route must redirect to inline mode");
requireIncludes("src/lib/navigation/routes.ts", "params.set(\"mode\", \"edit\")", "projectEditRoute must target inline mode");
requireIncludes("docs/release/V58_21_0_CREATE_FLOW_REFRESH_PROJECT_INLINE_ACTIVATION.md", "Create Flow Refresh + Project Inline Activation", "release notes must exist");
requireIncludes("docs/qa/FLOWTASK_V58_21_CREATE_FLOW_PROJECT_INLINE_QA.md", "Project Inline", "QA doc must exist");

if (failures.length) {
  console.error("[verify:v58.21.0] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[verify:v58.21.0] OK — Create Flow Refresh + Project Inline Activation aligned.");
