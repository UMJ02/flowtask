#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const expectedVersion = "58.22.0-semantic-ui-classes-density-contracts";
const expectedRelease = "v58.22.0 Semantic UI Classes + Density Contracts";

function read(rel) { return fs.readFileSync(path.join(root, rel), "utf8"); }
function exists(rel) { return fs.existsSync(path.join(root, rel)); }
function requireFile(rel) { if (!exists(rel)) failures.push(`Missing required file: ${rel}`); }
function requireIncludes(rel, text) { if (!exists(rel)) { failures.push(`Missing required file: ${rel}`); return; } if (!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); }

const pkg = JSON.parse(read("package.json"));
const scripts = pkg.scripts ?? {};
if (pkg.version !== expectedVersion) failures.push(`package version must be ${expectedVersion}`);
if (scripts["verify:current"] !== "npm run verify:v58.22.0") failures.push("verify:current must target verify:v58.22.0");
if (scripts["verify:v58.22.0"] !== "node scripts/verify-v58.22.0.mjs") failures.push("verify:v58.22.0 script must target scripts/verify-v58.22.0.mjs");

for (const rel of [
  "src/app/globals.css",
  "src/lib/design-system/tokens.ts",
  "src/components/ui/app-page.tsx",
  "src/components/ui/app-card.tsx",
  "src/components/ui/button.tsx",
  "src/components/ui/input.tsx",
  "docs/design-system/FLOWTASK_SEMANTIC_UI_DENSITY_CONTRACTS.md",
  "docs/release/V58_22_0_SEMANTIC_UI_CLASSES_DENSITY_CONTRACTS.md",
  "docs/qa/FLOWTASK_V58_22_0_SEMANTIC_UI_DENSITY_QA.md"
]) requireFile(rel);

requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedRelease);
requireIncludes("src/app/globals.css", "v58.22.0 Semantic UI Classes + Density Contracts");
for (const cls of [
  "ft-title-page", "ft-title-section", "ft-title-card", "ft-text-body", "ft-text-muted", "ft-text-meta", "ft-text-label",
  "ft-density-list", "ft-density-detail", "ft-density-create", "ft-density-auth",
  "ft-surface-card", "ft-surface-floating", "ft-surface-overlay",
  "ft-btn-primary", "ft-input", "ft-textarea"
]) requireIncludes("src/app/globals.css", cls);

requireIncludes("src/lib/design-system/tokens.ts", "densityContracts");
requireIncludes("src/lib/design-system/tokens.ts", "semanticClasses");
requireIncludes("src/lib/design-system/tokens.ts", "semanticGovernance");
requireIncludes("src/components/ui/app-page.tsx", "data-density");
requireIncludes("src/components/ui/button.tsx", "ft-btn-primary");
requireIncludes("src/components/ui/input.tsx", "ft-input");
requireIncludes("src/components/ui/select.tsx", "ft-input");
requireIncludes("src/components/ui/textarea.tsx", "ft-textarea");

const migrations = exists("supabase/migrations") ? fs.readdirSync(path.join(root, "supabase/migrations")) : [];
if (migrations.some((file) => file.includes("58_22_0") || file.includes("v58_22_0"))) failures.push("v58.22.0 must not add Supabase migrations");

if (failures.length) {
  console.error("[verify:v58.22.0] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("[verify:v58.22.0] OK — Semantic UI classes and density contracts aligned.");
