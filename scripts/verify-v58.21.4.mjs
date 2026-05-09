#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const expectedVersion = "58.21.4-design-system-governance-core-screen-migration";
const expectedRelease = "v58.21.4 Design System Governance + Core Screen Migration";

function read(rel) {
  const full = path.join(root, rel);
  return fs.existsSync(full) ? fs.readFileSync(full, "utf8") : "";
}
function exists(rel) { return fs.existsSync(path.join(root, rel)); }
function requireFile(rel) { if (!exists(rel)) failures.push(`Missing file: ${rel}`); }
function requireIncludes(rel, text) { const content = read(rel); if (!content.includes(text)) failures.push(`Expected '${text}' in ${rel}`); }

requireFile("src/lib/design-system/tokens.ts");
requireFile("src/components/ui/app-page.tsx");
requireFile("src/components/ui/app-card.tsx");
requireFile("src/components/ui/app-badge.tsx");
requireFile("src/components/ui/app-toolbar.tsx");
requireFile("src/components/ui/app-empty-state.tsx");
requireFile("src/components/ui/app-tabs.tsx");
requireFile("docs/design-system/FLOWTASK_DESIGN_SYSTEM.md");
requireFile("docs/release/V58_21_4_DESIGN_SYSTEM_GOVERNANCE_CORE_SCREEN_MIGRATION.md");
requireFile("docs/qa/FLOWTASK_V58_21_4_DESIGN_SYSTEM_GOVERNANCE_QA.md");

const pkg = JSON.parse(read("package.json"));
const scripts = pkg.scripts ?? {};
if (pkg.version !== expectedVersion) failures.push(`package.json version must be ${expectedVersion}`);
if (scripts["verify:current"] !== "npm run verify:v58.21.4") failures.push("verify:current must target verify:v58.21.4");
if (scripts["verify:v58.21.4"] !== "node scripts/verify-v58.21.4.mjs") failures.push("verify:v58.21.4 script must target scripts/verify-v58.21.4.mjs");

requireIncludes("package-lock.json", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedRelease);
requireIncludes("src/lib/release/version.ts", "production-candidate");

requireIncludes("src/lib/design-system/tokens.ts", "export const ds");
requireIncludes("src/lib/design-system/tokens.ts", "semantic");
requireIncludes("src/lib/design-system/tokens.ts", "gridSidebar");
requireIncludes("src/lib/design-system/tokens.ts", "button");
requireIncludes("src/app/globals.css", ".ft-governed-screen");
requireIncludes("src/app/globals.css", ".ft-core-grid");
requireIncludes("src/app/globals.css", ".ft-data-table");
requireIncludes("src/app/globals.css", ".ft-data-th");

requireIncludes("src/components/ui/app-page.tsx", "ft-page-shell");
requireIncludes("src/components/ui/app-card.tsx", "variant?: \"main\" | \"section\" | \"compact\" | \"plain\"");
requireIncludes("src/components/ui/app-badge.tsx", "tone?: \"success\" | \"warning\" | \"danger\" | \"info\" | \"neutral\" | \"brand\"");
requireIncludes("src/components/ui/app-toolbar.tsx", "AppToolbar");
requireIncludes("src/components/ui/app-empty-state.tsx", "AppEmptyState");
requireIncludes("src/components/ui/app-tabs.tsx", "AppTabs");

requireIncludes("src/app/(app)/app/projects/page.tsx", "ft-governed-screen");
requireIncludes("src/app/(app)/app/projects/page.tsx", "ft-data-table");
requireIncludes("src/app/(app)/app/tasks/page.tsx", "ft-governed-screen");
requireIncludes("docs/design-system/FLOWTASK_DESIGN_SYSTEM.md", "Regla de migración");
requireIncludes("docs/release/V58_21_4_DESIGN_SYSTEM_GOVERNANCE_CORE_SCREEN_MIGRATION.md", "Core Screen Migration");
requireIncludes("docs/qa/FLOWTASK_V58_21_4_DESIGN_SYSTEM_GOVERNANCE_QA.md", "Checklist visual");

const migrations = fs.existsSync(path.join(root, "supabase/migrations")) ? fs.readdirSync(path.join(root, "supabase/migrations")) : [];
if (migrations.some((file) => file.includes("58_21_4") || file.includes("v58_21_4"))) failures.push("v58.21.4 must not add Supabase migrations");

if (failures.length) {
  console.error("[verify:v58.21.4] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[verify:v58.21.4] OK — Design System Governance + Core Screen Migration aligned.");
