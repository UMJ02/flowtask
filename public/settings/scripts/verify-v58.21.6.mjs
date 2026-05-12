#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const expectedVersion = "58.21.6-visual-rhythm-legacy-style-cleanup";
const expectedRelease = "v58.21.6 Visual Rhythm + Legacy Style Cleanup";
const coreFiles = [
  "src/components/tasks/task-form.tsx",
  "src/components/projects/project-form.tsx",
  "src/components/tasks/task-workspace-inline.tsx",
  "src/components/projects/project-detail-pro.tsx",
  "src/components/projects/project-detail-summary.tsx",
  "src/components/tasks/task-detail-summary.tsx",
];

function read(rel) {
  const full = path.join(root, rel);
  return fs.existsSync(full) ? fs.readFileSync(full, "utf8") : "";
}
function exists(rel) { return fs.existsSync(path.join(root, rel)); }
function requireFile(rel) { if (!exists(rel)) failures.push(`Missing file: ${rel}`); }
function requireIncludes(rel, text) { const content = read(rel); if (!content.includes(text)) failures.push(`Expected '${text}' in ${rel}`); }
function requireNotIncludes(rel, text, label = text) { const content = read(rel); if (content.includes(text)) failures.push(`Unexpected '${label}' in ${rel}`); }

requireFile("src/lib/design-system/tokens.ts");
requireFile("src/components/ui/app-page.tsx");
requireFile("src/components/ui/app-card.tsx");
requireFile("src/components/ui/app-toolbar.tsx");
requireFile("docs/design-system/FLOWTASK_LIVING_SYSTEM.md");
requireFile("docs/design-system/FLOWTASK_VISUAL_RHYTHM.md");
requireFile("docs/release/V58_21_6_VISUAL_RHYTHM_LEGACY_STYLE_CLEANUP.md");
requireFile("docs/qa/FLOWTASK_V58_21_6_VISUAL_RHYTHM_QA.md");

const pkg = JSON.parse(read("package.json"));
const scripts = pkg.scripts ?? {};
if (pkg.version !== expectedVersion) failures.push(`package.json version must be ${expectedVersion}`);
if (scripts["verify:current"] !== "npm run verify:v58.21.6") failures.push("verify:current must target verify:v58.21.6");
if (scripts["verify:v58.21.6"] !== "node scripts/verify-v58.21.6.mjs") failures.push("verify:v58.21.6 script must target scripts/verify-v58.21.6.mjs");

requireIncludes("package-lock.json", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedRelease);
requireIncludes("src/lib/release/version.ts", "production-candidate");
requireIncludes("src/lib/design-system/tokens.ts", "visual-rhythm-compact");
requireIncludes("src/lib/design-system/tokens.ts", "legacyHardcodePolicy");
requireIncludes("src/app/globals.css", "v58.21.6 Visual Rhythm + Legacy Style Cleanup");
requireIncludes("src/app/globals.css", ".ft-rhythm-card");
requireIncludes("src/app/globals.css", ".ft-legacy-clean");
requireIncludes("src/components/ui/button.tsx", "h-9 rounded-[10px]");
requireIncludes("src/components/ui/input.tsx", "h-9 w-full rounded-[10px]");
requireIncludes("src/components/ui/textarea.tsx", "min-h-[104px]");
requireIncludes("docs/design-system/FLOWTASK_VISUAL_RHYTHM.md", "No usar sombras decorativas");
requireIncludes("docs/release/V58_21_6_VISUAL_RHYTHM_LEGACY_STYLE_CLEANUP.md", "Visual Rhythm + Legacy Style Cleanup");
requireIncludes("docs/qa/FLOWTASK_V58_21_6_VISUAL_RHYTHM_QA.md", "Checklist visual");

for (const rel of coreFiles) {
  requireNotIncludes(rel, "rounded-[34px]", `${rel} rounded-[34px]`);
  requireNotIncludes(rel, "shadow-[0_30px", `${rel} heavy decorative shadow`);
  requireNotIncludes(rel, "min-h-[64px]", `${rel} min-h-[64px] title input`);
  requireNotIncludes(rel, "sm:text-[32px]", `${rel} sm:text-[32px] oversized title`);
}

const migrations = fs.existsSync(path.join(root, "supabase/migrations")) ? fs.readdirSync(path.join(root, "supabase/migrations")) : [];
if (migrations.some((file) => file.includes("58_21_6") || file.includes("v58_21_6"))) failures.push("v58.21.6 must not add Supabase migrations");

if (failures.length) {
  console.error("[verify:v58.21.6] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[verify:v58.21.6] OK — Visual rhythm, legacy style cleanup and compact core screens aligned.");
