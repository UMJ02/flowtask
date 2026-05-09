#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
const root = process.cwd();
const failures = [];
const expectedVersion = "58.21.4-design-system-governance-core-screen-migration";
const expectedReleaseLabel = "v58.21.4 Design System Governance + Core Screen Migration";
function requireFile(rel) { if (!fs.existsSync(path.join(root, rel))) failures.push(`Missing required file: ${rel}`); }
function requireIncludes(rel, text) { const full = path.join(root, rel); if (!fs.existsSync(full)) { failures.push(`Missing required file: ${rel}`); return; } const content = fs.readFileSync(full, "utf8"); if (!content.includes(text)) failures.push(`Expected '${text}' in ${rel}`); }
[
  "package.json","package-lock.json","vercel.json","next.config.ts",".nvmrc",".env.example",
  "scripts/runtime-check.mjs","scripts/validate-env.mjs","scripts/verify-v58.21.4.mjs",
  "docs/release/DB_CONTINUITY_SOURCE_OF_TRUTH.md",
  "docs/release/V58_21_4_DESIGN_SYSTEM_GOVERNANCE_CORE_SCREEN_MIGRATION.md",
  "docs/qa/FLOWTASK_V58_21_4_DESIGN_SYSTEM_GOVERNANCE_QA.md",
  "docs/design-system/FLOWTASK_DESIGN_SYSTEM.md",
  "src/lib/design-system/tokens.ts",
  "src/components/ui/app-page.tsx",
  "src/components/ui/app-card.tsx",
  "src/components/ui/app-toolbar.tsx"
].forEach(requireFile);
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const scripts = pkg.scripts ?? {};
for (const scriptName of ["build", "vercel:build", "deploy:readiness", "build:preflight", "verify:current", "deploy:production:ready", "verify:v58.21.4"]) if (!scripts[scriptName]) failures.push(`Missing package script: ${scriptName}`);
if (pkg.version !== expectedVersion) failures.push(`Unexpected package version: ${pkg.version}`);
if (scripts["verify:current"] !== "npm run verify:v58.21.4") failures.push("verify:current must target verify:v58.21.4");
if (scripts["verify:v58.21.4"] !== "node scripts/verify-v58.21.4.mjs") failures.push("verify:v58.21.4 must target scripts/verify-v58.21.4.mjs");
const vercel = JSON.parse(fs.readFileSync(path.join(root, "vercel.json"), "utf8"));
if (vercel.framework !== "nextjs") failures.push("vercel.json framework must be nextjs");
if (vercel.buildCommand !== "npm run vercel:build") failures.push("vercel.json buildCommand must be npm run vercel:build");
if (!["npm ci", "npm install"].includes(vercel.installCommand)) failures.push("vercel.json installCommand must be npm ci or npm install");
requireIncludes(".env.example", "NEXT_PUBLIC_SUPABASE_URL");
requireIncludes(".env.example", "NEXT_PUBLIC_SUPABASE_ANON_KEY");
requireIncludes(".env.example", "NEXT_PUBLIC_APP_URL");
requireIncludes(".env.example", "SUPABASE_SERVICE_ROLE_KEY");
requireIncludes("package-lock.json", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedReleaseLabel);
requireIncludes("src/lib/release/version.ts", "production-candidate");
requireIncludes("src/lib/design-system/tokens.ts", "export const ds");
requireIncludes("src/app/globals.css", ".ft-governed-screen");
requireIncludes("src/app/globals.css", ".ft-data-table");
requireIncludes("src/components/ui/app-page.tsx", "ft-page-shell");
requireIncludes("src/components/ui/app-card.tsx", "ft-main-card");
requireIncludes("src/components/ui/button.tsx", "variant?: \"primary\" | \"secondary\" | \"ghost\" | \"danger\"");
requireIncludes("src/app/(app)/app/projects/page.tsx", "ft-governed-screen");
requireIncludes("src/app/(app)/app/tasks/page.tsx", "ft-governed-screen");
requireIncludes("docs/release/V58_21_4_DESIGN_SYSTEM_GOVERNANCE_CORE_SCREEN_MIGRATION.md", "Design System Governance + Core Screen Migration");
requireIncludes("docs/release/DB_CONTINUITY_SOURCE_OF_TRUTH.md", "0001-0034");
if (failures.length) { console.error("[build-deploy-readiness] Failed checks:"); for (const failure of failures) console.error(`- ${failure}`); process.exit(1); }
console.log("[build-deploy-readiness] OK — v58.21.4 package, env, release exports and design system governance readiness aligned.");
