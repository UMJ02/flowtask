#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const expectedVersion = "58.21.9-full-style-enforcement-component-migration";
const expectedRelease = "v58.21.9 Full Style Enforcement + Component Migration";

function read(rel) {
  const full = path.join(root, rel);
  return fs.existsSync(full) ? fs.readFileSync(full, "utf8") : "";
}
function exists(rel) { return fs.existsSync(path.join(root, rel)); }
function requireFile(rel) { if (!exists(rel)) failures.push(`Missing file: ${rel}`); }
function requireIncludes(rel, text) { if (!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); }
function requireNotIncludes(rel, text, label = text) { if (read(rel).includes(text)) failures.push(`Unexpected '${label}' in ${rel}`); }
function walk(dir) {
  const out = [];
  if (!fs.existsSync(path.join(root, dir))) return out;
  for (const entry of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
    const rel = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (["node_modules", ".next"].includes(entry.name)) continue;
      out.push(...walk(rel));
    } else if (/\.(tsx|ts|css)$/.test(entry.name)) {
      out.push(rel);
    }
  }
  return out;
}

requireFile("src/lib/design-system/tokens.ts");
requireFile("docs/design-system/FLOWTASK_STYLE_ENFORCEMENT.md");
requireFile("docs/release/V58_21_9_FULL_STYLE_ENFORCEMENT_COMPONENT_MIGRATION.md");
requireFile("docs/qa/FLOWTASK_V58_21_9_STYLE_ENFORCEMENT_QA.md");
requireFile("scripts/verify-v58.21.9.mjs");

const pkg = JSON.parse(read("package.json"));
const scripts = pkg.scripts ?? {};
if (pkg.version !== expectedVersion) failures.push(`package.json version must be ${expectedVersion}`);
if (scripts["verify:current"] !== "npm run verify:v58.21.9") failures.push("verify:current must target verify:v58.21.9");
if (scripts["verify:v58.21.9"] !== "node scripts/verify-v58.21.9.mjs") failures.push("verify:v58.21.9 script must target scripts/verify-v58.21.9.mjs");

requireIncludes("package-lock.json", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedRelease);
requireIncludes("src/lib/release/version.ts", "production-candidate");
requireIncludes("src/lib/design-system/tokens.ts", "style-enforcement-compact");
requireIncludes("src/lib/design-system/tokens.ts", "styleEnforcement");
requireIncludes("src/lib/design-system/tokens.ts", "migrationPolicy");
requireIncludes("src/app/globals.css", "v58.21.9 Full Style Enforcement + Component Migration");
requireIncludes("src/app/globals.css", ".ft-enforced-surface");
requireIncludes("src/app/globals.css", ".ft-floating-card");
requireIncludes("src/app/globals.css", ".ft-overlay-card");
requireIncludes("docs/design-system/FLOWTASK_STYLE_ENFORCEMENT.md", "Surface policy");
requireIncludes("docs/release/V58_21_9_FULL_STYLE_ENFORCEMENT_COMPONENT_MIGRATION.md", "Full Style Enforcement + Component Migration");
requireIncludes("docs/qa/FLOWTASK_V58_21_9_STYLE_ENFORCEMENT_QA.md", "Visual QA");

requireNotIncludes("src/app/globals.css", 'body [class*="shadow', "global shadow override");
requireNotIncludes("src/app/globals.css", "v58.21.4 Design System Governance", "old v58.21.4 layer comment");
requireNotIncludes("src/app/globals.css", "v58.21.5 Modern Density", "old v58.21.5 layer comment");
requireNotIncludes("src/app/globals.css", "v58.21.6 Visual Rhythm", "old v58.21.6 layer comment");
requireNotIncludes("src/app/globals.css", "v58.21.7 Style Cascade Reset", "old v58.21.7 layer comment");
requireNotIncludes("src/app/globals.css", "v58.21.8 Spacing Governance", "old v58.21.8 layer comment");

const forbidden = [
  { pattern: /shadow-\[0_(24|28|30)px/g, label: "heavy handcrafted shadow" },
  { pattern: /rounded-\[(26|30|34)px\]/g, label: "oversized bespoke radius" },
  { pattern: /\b(p|px|py|gap|space-y)-8\b/g, label: "loose 8-step spacing" },
  { pattern: /(sm:|md:)?text-\[32px\]/g, label: "oversized 32px text" },
  { pattern: /min-h-\[64px\]/g, label: "oversized 64px input height" },
];

const scanFiles = walk("src");
for (const rel of scanFiles) {
  const content = read(rel);
  for (const rule of forbidden) {
    const matches = content.match(rule.pattern);
    if (matches?.length) failures.push(`${rel} contains ${rule.label}: ${matches.slice(0, 3).join(", ")}`);
  }
}

for (const rel of [
  "src/components/layout/user-menu.tsx",
  "src/components/layout/organization-switcher.tsx",
  "src/components/clients/client-manager-panel.tsx",
  "src/components/workspace/focus-drawer.tsx",
  "src/components/workspace/floating-actions.tsx",
  "src/components/settings/settings-account-overview.tsx",
]) {
  requireNotIncludes(rel, "shadow-[0_24px", `${rel} old heavy shadow`);
  requireNotIncludes(rel, "shadow-[0_28px", `${rel} old heavy shadow`);
  requireNotIncludes(rel, "rounded-[30px]", `${rel} old radius`);
  requireNotIncludes(rel, "rounded-[26px]", `${rel} old radius`);
}

const migrations = exists("supabase/migrations") ? fs.readdirSync(path.join(root, "supabase/migrations")) : [];
if (migrations.some((file) => file.includes("58_21_9") || file.includes("v58_21_9"))) failures.push("v58.21.9 must not add Supabase migrations");

if (failures.length) {
  console.error("[verify:v58.21.9] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[verify:v58.21.9] OK — Full style enforcement and secondary component migration aligned.");
