#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const expectedVersion = "58.22.1-full-semantic-migration-motion-experience-layer";
const expectedRelease = "v58.22.1 Full Semantic Migration + Motion Experience Layer";
function read(rel) { return fs.readFileSync(path.join(root, rel), "utf8"); }
function exists(rel) { return fs.existsSync(path.join(root, rel)); }
function requireFile(rel) { if (!exists(rel)) failures.push(`Missing required file: ${rel}`); }
function requireIncludes(rel, text) { if (!exists(rel)) { failures.push(`Missing required file: ${rel}`); return; } if (!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); }

const pkg = JSON.parse(read("package.json"));
const scripts = pkg.scripts ?? {};
if (pkg.version !== expectedVersion) failures.push(`package version must be ${expectedVersion}`);
if (scripts["verify:current"] !== "npm run verify:v58.22.1") failures.push("verify:current must target verify:v58.22.1");
if (scripts["verify:v58.22.1"] !== "node scripts/verify-v58.22.1.mjs") failures.push("verify:v58.22.1 script must target scripts/verify-v58.22.1.mjs");

for (const rel of [
  "src/app/globals.css",
  "src/lib/design-system/tokens.ts",
  "src/components/ui/app-motion.tsx",
  "src/components/ui/app-skeleton.tsx",
  "src/components/ui/app-feedback.tsx",
  "src/components/ui/app-glass-panel.tsx",
  "src/components/ui/app-animated-tabs.tsx",
  "src/components/ui/app-tabs.tsx",
  "docs/design-system/FLOWTASK_FULL_SEMANTIC_MOTION_LAYER.md",
  "docs/release/V58_22_1_FULL_SEMANTIC_MIGRATION_MOTION_EXPERIENCE_LAYER.md",
  "docs/qa/FLOWTASK_V58_22_1_FULL_SEMANTIC_MOTION_QA.md"
]) requireFile(rel);

requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedRelease);
requireIncludes("src/app/globals.css", "v58.22.1 Full Semantic Migration + Motion Experience Layer");
for (const cls of [
  "ft-glass-panel", "ft-glass-toolbar", "ft-liquid-hover", "ft-motion-tab", "ft-motion-list-item", "ft-motion-expandable", "ft-motion-feedback", "ft-skeleton", "ft-feedback-saving", "ft-feedback-success", "ft-feedback-error", "ft-state-selected"
]) requireIncludes("src/app/globals.css", cls);

requireIncludes("src/lib/design-system/tokens.ts", "motionExperienceLayer");
requireIncludes("src/lib/design-system/tokens.ts", "semanticMigrationLayer");
requireIncludes("src/lib/design-system/tokens.ts", "full-semantic-motion-layer");
requireIncludes("src/components/ui/app-tabs.tsx", "ft-motion-tab");
requireIncludes("src/components/ui/app-card.tsx", "ft-liquid-hover");
requireIncludes("src/components/ui/app-feedback.tsx", "ft-feedback-saving");
requireIncludes("src/components/ui/app-glass-panel.tsx", "ft-glass-panel");
requireIncludes("src/components/ui/app-skeleton.tsx", "ft-skeleton");

const migrations = exists("supabase/migrations") ? fs.readdirSync(path.join(root, "supabase/migrations")) : [];
if (migrations.some((file) => file.includes("58_22_1") || file.includes("v58_22_1"))) failures.push("v58.22.1 must not add Supabase migrations");

if (failures.length) {
  console.error("[verify:v58.22.1] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("[verify:v58.22.1] OK — Full semantic migration and motion experience layer aligned.");
