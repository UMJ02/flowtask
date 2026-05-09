#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
const root = process.cwd();
const failures = [];
const expectedVersion = "58.22.0-semantic-ui-classes-density-contracts";
const expectedReleaseLabel = "v58.22.0 Semantic UI Classes + Density Contracts";
function exists(rel) { return fs.existsSync(path.join(root, rel)); }
function read(rel) { return fs.readFileSync(path.join(root, rel), "utf8"); }
function requireFile(rel) { if (!exists(rel)) failures.push(`Missing required file: ${rel}`); }
function requireIncludes(rel, text) { if (!exists(rel)) { failures.push(`Missing required file: ${rel}`); return; } if (!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); }
for (const rel of ["package.json","package-lock.json","vercel.json","next.config.ts",".nvmrc",".env.example","scripts/runtime-check.mjs","scripts/validate-env.mjs","scripts/verify-v58.22.0.mjs","docs/release/V58_22_0_SEMANTIC_UI_CLASSES_DENSITY_CONTRACTS.md","docs/qa/FLOWTASK_V58_22_0_SEMANTIC_UI_DENSITY_QA.md","docs/design-system/FLOWTASK_SEMANTIC_UI_DENSITY_CONTRACTS.md"]) requireFile(rel);
const pkg = JSON.parse(read("package.json"));
const scripts = pkg.scripts ?? {};
for (const scriptName of ["build","vercel:build","deploy:readiness","build:preflight","verify:current","deploy:production:ready","verify:v58.22.0"]) if (!scripts[scriptName]) failures.push(`Missing package script: ${scriptName}`);
if (pkg.version !== expectedVersion) failures.push(`Unexpected package version: ${pkg.version}`);
if (scripts["verify:current"] !== "npm run verify:v58.22.0") failures.push("verify:current must target verify:v58.22.0");
if (scripts["verify:v58.22.0"] !== "node scripts/verify-v58.22.0.mjs") failures.push("verify:v58.22.0 must target scripts/verify-v58.22.0.mjs");
const vercel = JSON.parse(read("vercel.json"));
if (vercel.framework !== "nextjs") failures.push("vercel.json framework must be nextjs");
if (vercel.buildCommand !== "npm run vercel:build") failures.push("vercel.json buildCommand must be npm run vercel:build");
requireIncludes("package-lock.json", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedReleaseLabel);
requireIncludes("src/lib/release/version.ts", "production-candidate");
requireIncludes("src/app/globals.css", "ft-title-page");
requireIncludes("src/app/globals.css", "ft-density-create");
requireIncludes("src/lib/design-system/tokens.ts", "densityContracts");
requireIncludes("docs/design-system/FLOWTASK_SEMANTIC_UI_DENSITY_CONTRACTS.md", "Semantic text roles");
requireIncludes(".env.example", "NEXT_PUBLIC_SUPABASE_URL");
requireIncludes(".env.example", "NEXT_PUBLIC_SUPABASE_ANON_KEY");
requireIncludes(".env.example", "SUPABASE_SERVICE_ROLE_KEY");
if (failures.length) { console.error("[build-deploy-readiness] Failed checks:"); for (const failure of failures) console.error(`- ${failure}`); process.exit(1); }
console.log("[build-deploy-readiness] OK — v58.22.0 package, env, semantic UI and density contracts readiness aligned.");
