#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const expectedVersion = "58.21.5-modern-density-motion-system";
const expectedRelease = "v58.21.5 Modern Density + Motion System";

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
requireFile("src/components/ui/app-empty-state.tsx");
requireFile("src/components/ui/app-tabs.tsx");
requireFile("docs/design-system/FLOWTASK_DESIGN_SYSTEM.md");
requireFile("docs/design-system/FLOWTASK_LIVING_SYSTEM.md");
requireFile("docs/release/V58_21_5_MODERN_DENSITY_MOTION_SYSTEM.md");
requireFile("docs/qa/FLOWTASK_V58_21_5_MODERN_DENSITY_MOTION_QA.md");

const pkg = JSON.parse(read("package.json"));
const scripts = pkg.scripts ?? {};
if (pkg.version !== expectedVersion) failures.push(`package.json version must be ${expectedVersion}`);
if (scripts["verify:current"] !== "npm run verify:v58.21.5") failures.push("verify:current must target verify:v58.21.5");
if (scripts["verify:v58.21.5"] !== "node scripts/verify-v58.21.5.mjs") failures.push("verify:v58.21.5 script must target scripts/verify-v58.21.5.mjs");

requireIncludes("package-lock.json", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedRelease);
requireIncludes("src/lib/release/version.ts", "production-candidate");

requireIncludes("src/lib/design-system/tokens.ts", "modern-compact");
requireIncludes("src/lib/design-system/tokens.ts", "motion");
requireIncludes("src/lib/design-system/tokens.ts", "primaryLarge");
requireIncludes("src/app/globals.css", "v58.21.5 Modern Density + Motion System");
requireIncludes("src/app/globals.css", ".ft-motion-reveal");
requireIncludes("src/app/globals.css", ".ft-floating-card");
requireIncludes("src/app/globals.css", "shadow governance");
requireIncludes("src/components/ui/button.tsx", "size?: \"sm\" | \"md\" | \"lg\" | \"icon\"");
requireIncludes("src/components/ui/button.tsx", "h-10 rounded-xl");
requireIncludes("src/components/ui/input.tsx", "h-10 w-full rounded-xl");
requireIncludes("src/components/ui/select.tsx", "h-10 w-full rounded-xl");
requireIncludes("src/components/ui/app-card.tsx", "variant?: \"hero\" | \"main\" | \"section\" | \"compact\" | \"plain\" | \"floating\"");
requireIncludes("src/components/ui/app-toolbar.tsx", "rounded-[22px]");
requireIncludes("docs/design-system/FLOWTASK_LIVING_SYSTEM.md", "Shadow rules");
requireIncludes("docs/release/V58_21_5_MODERN_DENSITY_MOTION_SYSTEM.md", "Modern Density + Motion System");
requireIncludes("docs/qa/FLOWTASK_V58_21_5_MODERN_DENSITY_MOTION_QA.md", "Checklist visual");

const migrations = fs.existsSync(path.join(root, "supabase/migrations")) ? fs.readdirSync(path.join(root, "supabase/migrations")) : [];
if (migrations.some((file) => file.includes("58_21_5") || file.includes("v58_21_5"))) failures.push("v58.21.5 must not add Supabase migrations");

if (failures.length) {
  console.error("[verify:v58.21.5] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[verify:v58.21.5] OK — Modern density, shadow governance and motion system aligned.");
