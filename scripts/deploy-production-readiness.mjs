#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const expectedVersion = "58.25.1-settings-footer-cleanup-alignment-polish";

function exists(rel){ return fs.existsSync(path.join(root, rel)); }
function read(rel){ return exists(rel) ? fs.readFileSync(path.join(root, rel), "utf8") : ""; }
function requireFile(rel){ if(!exists(rel)) failures.push(`Missing required file: ${rel}`); }
function requireMissing(rel){ if(exists(rel)) failures.push(`File should have been removed: ${rel}`); }
function requireIncludes(rel, text){ if(!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); }
function requireNotIncludes(rel, text){ if(read(rel).includes(text)) failures.push(`Did not expect '${text}' in ${rel}`); }

for (const rel of [
  "package.json","package-lock.json","vercel.json","next.config.ts",".nvmrc",".env.example",
  "scripts/runtime-check.mjs","scripts/validate-env.mjs","scripts/verify-v58.25.1.mjs",
  "docs/release/V58_25_1_SETTINGS_FOOTER_CLEANUP_ALIGNMENT_POLISH.md",
  "docs/qa/FLOWTASK_V58_25_1_SETTINGS_FOOTER_CLEANUP_ALIGNMENT_POLISH_QA.md",
  "src/app/(app)/app/settings/page.tsx",
  "src/components/settings/settings-account-overview.tsx",
  "src/components/settings/access-control-settings-card.tsx"
]) requireFile(rel);

requireMissing("src/components/settings/settings-footer.tsx");

const pkg = JSON.parse(read("package.json"));
const scripts = pkg.scripts ?? {};
if (pkg.version !== expectedVersion) failures.push(`Unexpected package version: ${pkg.version}`);
if (scripts["verify:current"] !== "npm run verify:v58.25.1") failures.push("verify:current must target verify:v58.25.1");
if (scripts["verify:v58.25.1"] !== "node scripts/verify-v58.25.1.mjs") failures.push("verify:v58.25.1 must target scripts/verify-v58.25.1.mjs");

const vercel = JSON.parse(read("vercel.json"));
if (vercel.framework !== "nextjs") failures.push("vercel.json framework must be nextjs");
if (vercel.buildCommand !== "npm run vercel:build") failures.push("vercel.json buildCommand must be npm run vercel:build");

requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("package-lock.json", expectedVersion);
requireIncludes("src/app/globals.css", "v58.25.1 — Settings footer cleanup");
requireIncludes("src/app/(app)/app/settings/page.tsx", "ft-settings-shell");
requireNotIncludes("src/app/(app)/app/settings/page.tsx", "SettingsFooter");

if (failures.length) {
  console.error("[deploy-production-readiness] Failed checks:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[deploy-production-readiness] OK — v58.25.1 Settings footer cleanup readiness aligned.");
