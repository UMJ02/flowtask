#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
const root = process.cwd();
const failures = [];
const expectedVersion = "58.22.1-full-semantic-migration-motion-experience-layer";
const expectedReleaseLabel = "v58.22.1 Full Semantic Migration + Motion Experience Layer";
function exists(rel) { return fs.existsSync(path.join(root, rel)); }
function read(rel) { return fs.readFileSync(path.join(root, rel), "utf8"); }
function requireFile(rel) { if (!exists(rel)) failures.push(`Missing required file: ${rel}`); }
function requireIncludes(rel, text) { if (!exists(rel)) { failures.push(`Missing required file: ${rel}`); return; } if (!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); }
for (const rel of ["package.json","package-lock.json","vercel.json","next.config.ts",".nvmrc",".env.example","scripts/runtime-check.mjs","scripts/validate-env.mjs","scripts/verify-v58.22.1.mjs","docs/release/V58_22_1_FULL_SEMANTIC_MIGRATION_MOTION_EXPERIENCE_LAYER.md","docs/qa/FLOWTASK_V58_22_1_FULL_SEMANTIC_MOTION_QA.md","docs/design-system/FLOWTASK_FULL_SEMANTIC_MOTION_LAYER.md"]) requireFile(rel);
const pkg = JSON.parse(read("package.json"));
const scripts = pkg.scripts ?? {};
for (const scriptName of ["build","vercel:build","deploy:readiness","build:preflight","verify:current","deploy:production:ready","verify:v58.22.1"]) if (!scripts[scriptName]) failures.push(`Missing package script: ${scriptName}`);
if (pkg.version !== expectedVersion) failures.push(`Unexpected package version: ${pkg.version}`);
if (scripts["verify:current"] !== "npm run verify:v58.22.1") failures.push("verify:current must target verify:v58.22.1");
if (scripts["verify:v58.22.1"] !== "node scripts/verify-v58.22.1.mjs") failures.push("verify:v58.22.1 must target scripts/verify-v58.22.1.mjs");
const vercel = JSON.parse(read("vercel.json"));
if (vercel.framework !== "nextjs") failures.push("vercel.json framework must be nextjs");
if (vercel.buildCommand !== "npm run vercel:build") failures.push("vercel.json buildCommand must be npm run vercel:build");
requireIncludes("package-lock.json", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedReleaseLabel);
requireIncludes("src/lib/release/version.ts", "production-candidate");
for (const text of ["ft-glass-panel", "ft-motion-tab", "ft-skeleton", "ft-feedback-success", "ft-liquid-hover"]) requireIncludes("src/app/globals.css", text);
requireIncludes("src/lib/design-system/tokens.ts", "motionExperienceLayer");
requireIncludes("src/lib/design-system/tokens.ts", "semanticMigrationLayer");
requireIncludes("src/components/ui/app-motion.tsx", "ft-motion-reveal");
requireIncludes("src/components/ui/app-skeleton.tsx", "ft-skeleton");
requireIncludes("src/components/ui/app-feedback.tsx", "ft-feedback-success");
requireIncludes("src/components/ui/app-glass-panel.tsx", "ft-glass-panel");
requireIncludes("src/components/ui/app-animated-tabs.tsx", "ft-motion-tab");
requireIncludes(".env.example", "NEXT_PUBLIC_SUPABASE_URL");
requireIncludes(".env.example", "NEXT_PUBLIC_SUPABASE_ANON_KEY");
requireIncludes(".env.example", "SUPABASE_SERVICE_ROLE_KEY");
if (failures.length) { console.error("[build-deploy-readiness] Failed checks:"); for (const failure of failures) console.error(`- ${failure}`); process.exit(1); }
console.log("[build-deploy-readiness] OK — v58.22.1 package, env, semantic motion layer and feedback readiness aligned.");
