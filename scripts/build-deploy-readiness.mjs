#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
const root = process.cwd();
const failures = [];
const expectedVersion = "58.21.7-style-cascade-reset-interaction-polish";
const expectedReleaseLabel = "v58.21.7 Style Cascade Reset + Interaction Polish";
function requireFile(rel) { if (!fs.existsSync(path.join(root, rel))) failures.push(`Missing required file: ${rel}`); }
function requireIncludes(rel, text) { const full = path.join(root, rel); if (!fs.existsSync(full)) { failures.push(`Missing required file: ${rel}`); return; } const content = fs.readFileSync(full, "utf8"); if (!content.includes(text)) failures.push(`Expected '${text}' in ${rel}`); }
function requireNotIncludes(rel, text, label = text) { const full = path.join(root, rel); if (fs.existsSync(full) && fs.readFileSync(full, "utf8").includes(text)) failures.push(`Unexpected '${label}' in ${rel}`); }
[
  "package.json","package-lock.json","vercel.json","next.config.ts",".nvmrc",".env.example",
  "scripts/runtime-check.mjs","scripts/validate-env.mjs","scripts/verify-v58.21.7.mjs",
  "docs/release/DB_CONTINUITY_SOURCE_OF_TRUTH.md",
  "docs/release/V58_21_7_STYLE_CASCADE_RESET_INTERACTION_POLISH.md",
  "docs/qa/FLOWTASK_V58_21_7_STYLE_CASCADE_QA.md",
  "docs/design-system/FLOWTASK_DESIGN_SYSTEM.md",
  "docs/design-system/FLOWTASK_LIVING_SYSTEM.md",
  "docs/design-system/FLOWTASK_STYLE_CASCADE.md",
  "src/lib/design-system/tokens.ts",
  "src/components/ui/app-page.tsx",
  "src/components/ui/app-card.tsx",
  "src/components/ui/app-toolbar.tsx"
].forEach(requireFile);
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const scripts = pkg.scripts ?? {};
for (const scriptName of ["build", "vercel:build", "deploy:readiness", "build:preflight", "verify:current", "deploy:production:ready", "verify:v58.21.7"]) if (!scripts[scriptName]) failures.push(`Missing package script: ${scriptName}`);
if (pkg.version !== expectedVersion) failures.push(`Unexpected package version: ${pkg.version}`);
if (scripts["verify:current"] !== "npm run verify:v58.21.7") failures.push("verify:current must target verify:v58.21.7");
if (scripts["verify:v58.21.7"] !== "node scripts/verify-v58.21.7.mjs") failures.push("verify:v58.21.7 must target scripts/verify-v58.21.7.mjs");
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
requireIncludes("src/lib/design-system/tokens.ts", "cascade-reset-compact");
requireIncludes("src/lib/design-system/tokens.ts", "cascadePolicy");
requireIncludes("src/app/globals.css", "v58.21.7 Style Cascade Reset + Interaction Polish");
requireIncludes("src/app/globals.css", ".ft-overlay-card");
requireIncludes("src/app/globals.css", ".ft-motion-expand");
requireNotIncludes("src/app/globals.css", 'body [class*="shadow', "global shadow override");
requireIncludes("src/components/ui/button.tsx", "h-9 rounded-[10px]");
requireIncludes("src/components/ui/input.tsx", "h-9 w-full rounded-[10px]");
requireIncludes("docs/design-system/FLOWTASK_STYLE_CASCADE.md", "cascada visual única");
requireIncludes("docs/release/V58_21_7_STYLE_CASCADE_RESET_INTERACTION_POLISH.md", "Style Cascade Reset + Interaction Polish");
requireIncludes("docs/release/DB_CONTINUITY_SOURCE_OF_TRUTH.md", "0001-0034");
if (failures.length) { console.error("[build-deploy-readiness] Failed checks:"); for (const failure of failures) console.error(`- ${failure}`); process.exit(1); }
console.log("[build-deploy-readiness] OK — v58.21.7 package, env, release exports and style cascade readiness aligned.");
