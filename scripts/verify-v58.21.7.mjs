#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const expectedVersion = "58.21.7-style-cascade-reset-interaction-polish";
const expectedRelease = "v58.21.7 Style Cascade Reset + Interaction Polish";
const coreFiles = [
  "src/app/globals.css",
  "src/components/tasks/task-form.tsx",
  "src/components/projects/project-form.tsx",
  "src/components/tasks/task-workspace-inline.tsx",
  "src/components/projects/project-detail-pro.tsx",
  "src/app/(public)/register/page.tsx",
  "src/app/(public)/forgot-password/page.tsx",
  "src/app/(public)/reset-password/page.tsx",
];

function read(rel) { const full = path.join(root, rel); return fs.existsSync(full) ? fs.readFileSync(full, "utf8") : ""; }
function exists(rel) { return fs.existsSync(path.join(root, rel)); }
function requireFile(rel) { if (!exists(rel)) failures.push(`Missing file: ${rel}`); }
function requireIncludes(rel, text) { if (!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); }
function requireNotIncludes(rel, text, label = text) { if (read(rel).includes(text)) failures.push(`Unexpected '${label}' in ${rel}`); }
function countMatches(content, pattern) { return [...content.matchAll(new RegExp(pattern, "g"))].length; }

requireFile("src/lib/design-system/tokens.ts");
requireFile("docs/design-system/FLOWTASK_STYLE_CASCADE.md");
requireFile("docs/release/V58_21_7_STYLE_CASCADE_RESET_INTERACTION_POLISH.md");
requireFile("docs/qa/FLOWTASK_V58_21_7_STYLE_CASCADE_QA.md");

const pkg = JSON.parse(read("package.json"));
const scripts = pkg.scripts ?? {};
if (pkg.version !== expectedVersion) failures.push(`package.json version must be ${expectedVersion}`);
if (scripts["verify:current"] !== "npm run verify:v58.21.7") failures.push("verify:current must target verify:v58.21.7");
if (scripts["verify:v58.21.7"] !== "node scripts/verify-v58.21.7.mjs") failures.push("verify:v58.21.7 script must target scripts/verify-v58.21.7.mjs");

requireIncludes("package-lock.json", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedRelease);
requireIncludes("src/lib/release/version.ts", "production-candidate");
requireIncludes("src/lib/design-system/tokens.ts", "cascade-reset-compact");
requireIncludes("src/lib/design-system/tokens.ts", "cascadePolicy");
requireIncludes("src/app/globals.css", "v58.21.7 Style Cascade Reset + Interaction Polish");
requireIncludes("src/app/globals.css", ".ft-overlay-card");
requireIncludes("src/app/globals.css", ".ft-motion-expand");
requireIncludes("docs/design-system/FLOWTASK_STYLE_CASCADE.md", "cascada visual única");
requireIncludes("docs/release/V58_21_7_STYLE_CASCADE_RESET_INTERACTION_POLISH.md", "Style Cascade Reset + Interaction Polish");
requireIncludes("docs/qa/FLOWTASK_V58_21_7_STYLE_CASCADE_QA.md", "Checklist visual");

const globals = read("src/app/globals.css");
for (const cls of ["ft-main-card", "ft-section-card", "ft-mini-card", "ft-floating-card", "ft-button", "ft-control"]) {
  const count = countMatches(globals, `\\.${cls}(?:\\s|,|\\{)`);
  if (count !== 1) failures.push(`globals.css must define .${cls} exactly once, found ${count}`);
}

requireNotIncludes("src/app/globals.css", 'body [class*="shadow', "global shadow override");
requireNotIncludes("src/app/globals.css", "v58.21.4 Design System Governance", "old v58.21.4 layer comment");
requireNotIncludes("src/app/globals.css", "v58.21.5 Modern Density", "old v58.21.5 layer comment");
requireNotIncludes("src/app/globals.css", "v58.21.6 Visual Rhythm", "old v58.21.6 layer comment");

for (const rel of coreFiles) {
  requireNotIncludes(rel, "rounded-[34px]", `${rel} rounded-[34px]`);
  requireNotIncludes(rel, "shadow-[0_30px", `${rel} heavy 30px shadow`);
  requireNotIncludes(rel, "shadow-[0_24px_60px", `${rel} heavy 24px shadow`);
  requireNotIncludes(rel, "min-h-[64px]", `${rel} min-h-[64px]`);
  requireNotIncludes(rel, "sm:text-[32px]", `${rel} oversized sm:text-[32px]`);
}

const migrations = fs.existsSync(path.join(root, "supabase/migrations")) ? fs.readdirSync(path.join(root, "supabase/migrations")) : [];
if (migrations.some((file) => file.includes("58_21_7") || file.includes("v58_21_7"))) failures.push("v58.21.7 must not add Supabase migrations");

if (failures.length) {
  console.error("[verify:v58.21.7] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[verify:v58.21.7] OK — Style cascade reset, named shadow variants and interaction polish aligned.");
