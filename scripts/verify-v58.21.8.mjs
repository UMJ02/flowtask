#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const expectedVersion = "58.21.8-spacing-governance-microinteraction-polish";
const expectedRelease = "v58.21.8 Spacing Governance + Microinteraction Polish";
const coreFiles = [
  "src/app/globals.css",
  "src/lib/design-system/tokens.ts",
  "src/components/ui/button.tsx",
  "src/components/ui/app-card.tsx",
  "src/components/ui/app-toolbar.tsx",
  "src/components/ui/app-empty-state.tsx",
  "src/components/tasks/task-form.tsx",
  "src/components/projects/project-form.tsx",
  "src/components/tasks/task-workspace-inline.tsx",
  "src/components/projects/project-detail-pro.tsx",
  "src/app/(public)/register/page.tsx",
  "src/app/(public)/forgot-password/page.tsx",
  "src/app/(public)/reset-password/page.tsx",
  "src/app/(public)/auth-error/page.tsx",
  "src/app/(public)/confirmed/page.tsx",
];

function read(rel) { const full = path.join(root, rel); return fs.existsSync(full) ? fs.readFileSync(full, "utf8") : ""; }
function exists(rel) { return fs.existsSync(path.join(root, rel)); }
function requireFile(rel) { if (!exists(rel)) failures.push(`Missing file: ${rel}`); }
function requireIncludes(rel, text) { if (!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); }
function requireNotIncludes(rel, text, label = text) { if (read(rel).includes(text)) failures.push(`Unexpected '${label}' in ${rel}`); }
function countMatches(content, pattern) { return [...content.matchAll(new RegExp(pattern, "g"))].length; }

requireFile("src/lib/design-system/tokens.ts");
requireFile("docs/design-system/FLOWTASK_SPACING_MOTION_GOVERNANCE.md");
requireFile("docs/release/V58_21_8_SPACING_GOVERNANCE_MICROINTERACTION_POLISH.md");
requireFile("docs/qa/FLOWTASK_V58_21_8_SPACING_MOTION_QA.md");

const pkg = JSON.parse(read("package.json"));
const scripts = pkg.scripts ?? {};
if (pkg.version !== expectedVersion) failures.push(`package.json version must be ${expectedVersion}`);
if (scripts["verify:current"] !== "npm run verify:v58.21.8") failures.push("verify:current must target verify:v58.21.8");
if (scripts["verify:v58.21.8"] !== "node scripts/verify-v58.21.8.mjs") failures.push("verify:v58.21.8 script must target scripts/verify-v58.21.8.mjs");

requireIncludes("package-lock.json", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedRelease);
requireIncludes("src/lib/release/version.ts", "production-candidate");
requireIncludes("src/lib/design-system/tokens.ts", "spacing-governance-compact");
requireIncludes("src/lib/design-system/tokens.ts", "spacingGovernance");
requireIncludes("src/lib/design-system/tokens.ts", "largeSpacePolicy");
requireIncludes("src/app/globals.css", "v58.21.8 Spacing Governance + Microinteraction Polish");
requireIncludes("src/app/globals.css", ".ft-density-compact");
requireIncludes("src/app/globals.css", ".ft-arrow-action");
requireIncludes("src/app/globals.css", ".ft-motion-pop");
requireIncludes("src/app/globals.css", "prefers-reduced-motion");
requireIncludes("docs/design-system/FLOWTASK_SPACING_MOTION_GOVERNANCE.md", "Spacing rule");
requireIncludes("docs/release/V58_21_8_SPACING_GOVERNANCE_MICROINTERACTION_POLISH.md", "Spacing Governance + Microinteraction Polish");
requireIncludes("docs/qa/FLOWTASK_V58_21_8_SPACING_MOTION_QA.md", "Visual QA");

const globals = read("src/app/globals.css");
for (const cls of ["ft-main-card", "ft-section-card", "ft-mini-card", "ft-floating-card", "ft-overlay-card", "ft-button", "ft-control", "ft-density-compact"]) {
  const count = countMatches(globals, `\\.${cls}(?:\\s|,|\\{)`);
  if (count !== 1) failures.push(`globals.css must define .${cls} exactly once, found ${count}`);
}

requireNotIncludes("src/app/globals.css", 'body [class*="shadow', "global shadow override");
requireNotIncludes("src/app/globals.css", "v58.21.4 Design System Governance", "old v58.21.4 layer comment");
requireNotIncludes("src/app/globals.css", "v58.21.5 Modern Density", "old v58.21.5 layer comment");
requireNotIncludes("src/app/globals.css", "v58.21.6 Visual Rhythm", "old v58.21.6 layer comment");
requireNotIncludes("src/app/globals.css", "v58.21.7 Style Cascade Reset", "old v58.21.7 layer comment");

for (const rel of coreFiles) {
  requireNotIncludes(rel, "rounded-[34px]", `${rel} rounded-[34px]`);
  requireNotIncludes(rel, "rounded-[30px]", `${rel} rounded-[30px]`);
  requireNotIncludes(rel, "rounded-[28px]", `${rel} rounded-[28px]`);
  requireNotIncludes(rel, "shadow-[0_30px", `${rel} heavy 30px shadow`);
  requireNotIncludes(rel, "shadow-[0_28px", `${rel} heavy 28px shadow`);
  requireNotIncludes(rel, "shadow-[0_24px_64px", `${rel} heavy auth shadow`);
  requireNotIncludes(rel, "min-h-[64px]", `${rel} min-h-[64px]`);
  requireNotIncludes(rel, "sm:text-[32px]", `${rel} oversized sm:text-[32px]`);
  requireNotIncludes(rel, "md:text-[32px]", `${rel} oversized md:text-[32px]`);
  requireNotIncludes(rel, "text-[32px]", `${rel} oversized text-[32px]`);
  requireNotIncludes(rel, "p-8", `${rel} p-8`);
  requireNotIncludes(rel, "py-8", `${rel} py-8`);
  requireNotIncludes(rel, "px-8", `${rel} px-8`);
  requireNotIncludes(rel, "gap-8", `${rel} gap-8`);
  requireNotIncludes(rel, "space-y-8", `${rel} space-y-8`);
}

const migrations = fs.existsSync(path.join(root, "supabase/migrations")) ? fs.readdirSync(path.join(root, "supabase/migrations")) : [];
if (migrations.some((file) => file.includes("58_21_8") || file.includes("v58_21_8"))) failures.push("v58.21.8 must not add Supabase migrations");

if (failures.length) {
  console.error("[verify:v58.21.8] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[verify:v58.21.8] OK — Spacing governance, compact rhythm and microinteraction polish aligned.");
