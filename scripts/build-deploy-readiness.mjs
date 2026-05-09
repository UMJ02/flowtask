#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
const root = process.cwd();
const failures = [];
const expectedVersion = "58.21.9-full-style-enforcement-component-migration";
const expectedReleaseLabel = "v58.21.9 Full Style Enforcement + Component Migration";
function requireFile(rel) { if (!fs.existsSync(path.join(root, rel))) failures.push(`Missing required file: ${rel}`); }
function read(rel) { const full = path.join(root, rel); return fs.existsSync(full) ? fs.readFileSync(full, "utf8") : ""; }
function requireIncludes(rel, text) { if (!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); }
function requireNotIncludes(rel, text, label = text) { if (read(rel).includes(text)) failures.push(`Unexpected '${label}' in ${rel}`); }
[
  "package.json","package-lock.json","vercel.json","next.config.ts",".nvmrc",".env.example",
  "scripts/runtime-check.mjs","scripts/validate-env.mjs","scripts/verify-v58.21.9.mjs",
  "docs/release/DB_CONTINUITY_SOURCE_OF_TRUTH.md",
  "docs/release/V58_21_9_FULL_STYLE_ENFORCEMENT_COMPONENT_MIGRATION.md",
  "docs/qa/FLOWTASK_V58_21_9_STYLE_ENFORCEMENT_QA.md",
  "docs/design-system/FLOWTASK_STYLE_ENFORCEMENT.md",
  "src/lib/design-system/tokens.ts",
  "src/components/ui/app-page.tsx",
  "src/components/ui/app-card.tsx",
  "src/components/ui/app-toolbar.tsx"
].forEach(requireFile);
const pkg = JSON.parse(read("package.json"));
const scripts = pkg.scripts ?? {};
for (const scriptName of ["build", "vercel:build", "deploy:readiness", "build:preflight", "verify:current", "deploy:production:ready", "verify:v58.21.9"]) if (!scripts[scriptName]) failures.push(`Missing package script: ${scriptName}`);
if (pkg.version !== expectedVersion) failures.push(`Unexpected package version: ${pkg.version}`);
if (scripts["verify:current"] !== "npm run verify:v58.21.9") failures.push("verify:current must target verify:v58.21.9");
if (scripts["verify:v58.21.9"] !== "node scripts/verify-v58.21.9.mjs") failures.push("verify:v58.21.9 must target scripts/verify-v58.21.9.mjs");
const vercel = JSON.parse(read("vercel.json"));
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
requireIncludes("src/lib/design-system/tokens.ts", "style-enforcement-compact");
requireIncludes("src/lib/design-system/tokens.ts", "styleEnforcement");
requireIncludes("src/app/globals.css", "v58.21.9 Full Style Enforcement + Component Migration");
requireIncludes("src/app/globals.css", ".ft-enforced-surface");
requireIncludes("src/app/globals.css", ".ft-floating-card");
requireNotIncludes("src/app/globals.css", 'body [class*="shadow', "global shadow override");
requireIncludes("docs/design-system/FLOWTASK_STYLE_ENFORCEMENT.md", "Surface policy");
requireIncludes("docs/release/V58_21_9_FULL_STYLE_ENFORCEMENT_COMPONENT_MIGRATION.md", "Full Style Enforcement + Component Migration");
requireIncludes("docs/release/DB_CONTINUITY_SOURCE_OF_TRUTH.md", "0001-0034");
if (failures.length) { console.error("[build-deploy-readiness] Failed checks:"); for (const failure of failures) console.error(`- ${failure}`); process.exit(1); }
console.log("[build-deploy-readiness] OK — v58.21.9 package, env, release exports and style enforcement readiness aligned.");
